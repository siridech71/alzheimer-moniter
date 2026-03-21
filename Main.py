"""
main.py — จุดเริ่มต้นของโปรแกรม (Main Loop เท่านั้น)

โครงสร้างโปรเจกต์:
    main.py         <- ไฟล์นี้ รัน loop หลัก
    config.py       <- ค่าตั้งต้นทั้งหมด (แก้ SAFE_ZONE_POLYGON ที่นี่)
    database.py     <- บันทึก/ดึงข้อมูล PostgreSQL
    notifier.py     <- ส่งแจ้งเตือน Email
    geofencing.py   <- ตรวจพื้นที่ + วาดภาพ
    tracker.py      <- ติดตามคนและจับเวลา

รันด้วย:
    python main.py
    กด Q เพื่อหยุด
"""

import cv2
import torch
import time
import numpy as np
from ultralytics import YOLO

from config import (
    CAMERA_SOURCE,
    CONFIDENCE_THRESHOLD,
    YOLO_MODEL,
    ANALYZE_EVERY_N_FRAMES,
)
from database import init_db, save_event
from notifier import send_line_notify, can_send_alert, _last_alert_time
from geofencing import is_outside_safe_zone, draw_overlay
from tracker import PersonTracker


def get_device() -> str:
    """
    เลือก device ที่เร็วที่สุดที่มีในเครื่อง
    1. MPS  = Apple Silicon GPU (M1/M2/M3)
    2. CUDA = NVIDIA GPU
    3. CPU  = ใช้ได้ทุกเครื่อง แต่ช้าสุด
    """
    if torch.backends.mps.is_available():
        print("[Device] ใช้ Apple GPU (MPS)")
        return "mps"
    if torch.cuda.is_available():
        print(f"[Device] ใช้ NVIDIA GPU: {torch.cuda.get_device_name(0)}")
        return "cuda"
    print("[Device] ใช้ CPU")
    return "cpu"


def main() -> None:
    print("=" * 45)
    print("  ระบบแจ้งเตือนผู้ป่วยอัลไซเมอร์")
    print("=" * 45)

    init_db()
    print("[DB] ฐานข้อมูลพร้อมแล้ว")

    device = get_device()

    # โหลด YOLO ครั้งเดียว ไม่โหลดซ้ำทุกเฟรม
    model = YOLO(YOLO_MODEL)
    model.to(device)
    print(f"[AI] โหลด {YOLO_MODEL} สำเร็จ -> device={device}")

    cap = cv2.VideoCapture(CAMERA_SOURCE)
    if not cap.isOpened():
        print(f"[ERROR] ไม่สามารถเปิดกล้อง {CAMERA_SOURCE} ได้")
        return

    width  = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    print(f"[Camera] เปิดกล้อง {CAMERA_SOURCE} สำเร็จ — {width}x{height}")
    print("กด Q เพื่อหยุดโปรแกรม\n")

    cv2.namedWindow("Alzheimer Monitor", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("Alzheimer Monitor", 960, 540)

    # ── Main Loop ────────────────────────────────────────
    tracker     = PersonTracker()
    frame_count = 0

    while True:
        ret, frame = cap.read()

        if not ret:
            print("[INFO] วิดีโอจบหรือกล้องหลุด")
            break

        frame_count += 1

        # ข้ามเฟรมเพื่อลด CPU load
        if frame_count % ANALYZE_EVERY_N_FRAMES != 0:
            cv2.imshow("Alzheimer Monitor", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
            continue

        # ── ตรวจจับและติดตามคน ──────────────────────────
        results = model.track(
            frame,
            conf=CONFIDENCE_THRESHOLD,
            classes=[0],
            persist=True,
            tracker="bytetrack.yaml",
            verbose=False,
            device=device,
        )

        detections: list[tuple] = []
        active_ids: set[int]    = set()

        for result in results:
            if result.boxes is None:
                continue

            for box in result.boxes:
                if box.id is None:
                    continue

                track_id        = int(box.id[0])
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf            = float(box.conf[0])

                active_ids.add(track_id)
                detections.append((track_id, x1, y1, x2, y2, conf))

                foot_x = (x1 + x2) / 2
                foot_y = y2

                is_out   = is_outside_safe_zone(foot_x, foot_y)
                duration = tracker.update(track_id, is_out)

                # ── แจ้งเตือน ────────────────────────────
                if duration is not None:
                    print(
                        f"[ALERT] ID={track_id} นอก zone "
                        f"{duration:.1f} วิ conf={conf:.0%}"
                    )

                    if can_send_alert(track_id):
                        _last_alert_time[track_id] = time.time()

                        img_path = f"alert_{track_id}_{int(time.time())}.jpg"
                        preview  = draw_overlay(
                            frame, detections, tracker.get_outside_info()
                        )
                        cv2.imwrite(img_path, preview)
                        save_event(track_id, "OUT_OF_ZONE", duration, conf, img_path)
                        send_line_notify(track_id, duration, conf, img_path)
                    else:
                        print(f"[COOLDOWN] ID={track_id} รอ cooldown อยู่")

        tracker.cleanup_lost_tracks(active_ids)

        annotated = draw_overlay(
            frame, detections, tracker.get_outside_info()
        )
        cv2.imshow("Alzheimer Monitor", annotated)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("\nระบบหยุดทำงานแล้ว")


if __name__ == "__main__":
    main()