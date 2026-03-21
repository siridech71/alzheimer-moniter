"""
geofencing.py — ตรวจสอบพื้นที่และวาดภาพ

ทำไมต้องแยกไฟล์นี้ออกมา?
- Logic การตรวจสอบพื้นที่เป็นส่วนสำคัญของระบบ
  แยกออกมาทำให้ทดสอบและแก้ไขได้ง่ายขึ้น
- ถ้าอยากเพิ่มหลาย zone หรือ zone รูปร่างซับซ้อน
  แก้ที่นี่ที่เดียว
"""

import cv2
import numpy as np
from datetime import datetime
from config import SAFE_ZONE_POLYGON


def is_outside_safe_zone(point_x: float, point_y: float) -> bool:
    """
    ตรวจว่าจุด (x, y) อยู่นอก Safe Zone หรือเปล่า

    ทำไมใช้ pointPolygonTest?
    → รับ polygon รูปร่างอะไรก็ได้ ไม่จำกัดแค่สี่เหลี่ยม
      คืน +1 = ข้างใน, -1 = ข้างนอก, 0 = บนเส้น

    ทำไมต้อง float()?
    → OpenCV ต้องการ tuple ของ float
      ถ้าส่ง int เข้าไปอาจเกิด TypeError
    """
    result = cv2.pointPolygonTest(
        SAFE_ZONE_POLYGON,
        (float(point_x), float(point_y)),
        measureDist=False,
    )
    return result < 0   # ค่าลบ = อยู่นอก polygon


def draw_overlay(
    frame: np.ndarray,
    detections: list[tuple],
    outside_info: dict[int, float],
) -> np.ndarray:
    """
    วาด Safe Zone, bounding box และ duration บนภาพ

    Parameters
    ----------
    frame        : ภาพต้นฉบับ (จะวาดทับ copy ไม่แก้ต้นฉบับ)
    detections   : list ของ (track_id, x1, y1, x2, y2, conf)
    outside_info : dict {track_id: วินาทีที่อยู่นอก zone}

    ทำไมต้อง frame.copy()?
    → ถ้าวาดทับ frame ต้นฉบับโดยตรง
      จะทำให้ข้อมูลภาพที่ YOLO ใช้เสียหาย
    """
    out = frame.copy()
    alert = len(outside_info) > 0

    # สีตามสถานะ
    # เขียว = ปกติ, แดง = มีคนนอก zone
    zone_color = (0, 0, 255) if alert else (0, 220, 0)

    # วาด fill โปร่งแสงให้เห็น zone ชัดขึ้น
    # ทำไมใช้ addWeighted?
    # → ผสมภาพ 2 ชั้น ทำให้ได้ fill กึ่งโปร่งใส
    #   alpha=0.15 = โปร่งใส 85% เห็นภาพข้างหลังได้
    overlay = out.copy()
    cv2.fillPoly(overlay, [SAFE_ZONE_POLYGON], zone_color)
    cv2.addWeighted(overlay, 0.15, out, 0.85, 0, out)

    # วาดเส้นขอบหนา 4px ให้เห็นชัด
    cv2.polylines(
        out, [SAFE_ZONE_POLYGON],
        isClosed=True, color=zone_color, thickness=4
    )

    # label บอกสถานะ
    zone_label = "! OUT OF ZONE" if alert else "Safe Zone"
    label_x = SAFE_ZONE_POLYGON[0][0]
    label_y = max(SAFE_ZONE_POLYGON[0][1] - 12, 20)

    # วาดกล่องดำรองข้อความให้อ่านง่าย
    (tw, th), _ = cv2.getTextSize(
        zone_label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2
    )
    cv2.rectangle(
        out,
        (label_x - 4, label_y - th - 6),
        (label_x + tw + 4, label_y + 4),
        (0, 0, 0), -1
    )
    cv2.putText(
        out, zone_label,
        (label_x, label_y),
        cv2.FONT_HERSHEY_SIMPLEX, 0.7, zone_color, 2
    )

    # วาด bounding box ของแต่ละคน
    for (track_id, x1, y1, x2, y2, conf) in detections:
        is_out = track_id in outside_info
        box_color = (0, 0, 255) if is_out else (255, 140, 0)

        cv2.rectangle(
            out,
            (int(x1), int(y1)), (int(x2), int(y2)),
            box_color, 2
        )

        # แสดง ID และ duration ถ้าอยู่นอก zone
        if is_out:
            dur = outside_info[track_id]
            label = f"ID={track_id} | {dur:.1f}s"
        else:
            label = f"ID={track_id} | {conf:.0%}"

        cv2.putText(
            out, label,
            (int(x1), int(y1) - 8),
            cv2.FONT_HERSHEY_SIMPLEX, 0.52, box_color, 1
        )

        # วาดจุดที่ใช้เช็ค (เท้า)
        foot_x = int((x1 + x2) / 2)
        foot_y = int(y2)
        cv2.circle(out, (foot_x, foot_y), 4, box_color, -1)

    # Timestamp มุมล่างซ้าย
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cv2.putText(
        out, ts,
        (10, out.shape[0] - 10),
        cv2.FONT_HERSHEY_SIMPLEX, 0.48, (180, 180, 180), 1
    )
    return out