import cv2
import torch
import time
from ultralytics import YOLO
from config import Config
import database
import geofencing
import tracker
import notifier

# คลิกเมาส์ที่หน้าจอเพื่อหาพิกัด XY สำหรับแก้ใน Config
def on_mouse(event, x, y, flags, param):
    if event == cv2.EVENT_LBUTTONDOWN:
        print(f"Coordinate: ({x}, {y})")

def main():
    database.init_db()
    if torch.cuda.is_available():
        device = "cuda"
        print("[SYSTEM] ใช้ NVIDIA GPU (CUDA)")
    elif torch.backends.mps.is_available():
        device = "mps"
        print("[SYSTEM] ใช้ Apple Silicon GPU (MPS)")
    else:
        device = "cpu"
        print("[SYSTEM] ใช้ CPU (ธรรมดา)")
    model = YOLO(Config.YOLO_MODEL).to(device)
    cap = cv2.VideoCapture(Config.CAMERA_SOURCE)
    person_tracker = tracker.PersonTracker()
    
    cv2.namedWindow("Alzheimer Monitoring")
    cv2.setMouseCallback("Alzheimer Monitoring", on_mouse)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break

        results = model.track(frame, persist=True, classes=[0], verbose=False)

        # --- 1. เช็คสถานะก่อนว่ามีใครอยู่นอกเขตบ้างไหม (เพื่อเลือกสี Zone) ---
        is_anyone_out = any(person_tracker.timers.values())
        zone_color = (0, 0, 255) if is_anyone_out else (0, 255, 0) # แดง=มีคนออก, เขียว=ปกติ

        # --- 2. วาด Safe Zone ลงใน frame ทันที (เพื่อให้ติดไปในรูปเซฟด้วย) ---
        overlay = frame.copy()
        cv2.fillPoly(overlay, [Config.SAFE_ZONE_POLYGON], zone_color)
        cv2.addWeighted(overlay, 0.2, frame, 0.8, 0, frame) # ทำพื้นหลังโปร่งแสง
        cv2.polylines(frame, [Config.SAFE_ZONE_POLYGON], True, zone_color, 3) # วาดเส้นขอบ
        
        label = "! OUT OF ZONE" if is_anyone_out else "SAFE ZONE"
        cv2.putText(frame, label, (Config.SAFE_ZONE_POLYGON[0][0], Config.SAFE_ZONE_POLYGON[0][1]-10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, zone_color, 2)

        # --- 3. ตรวจสอบรายบุคคล ---
        if results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.cpu().numpy()
            ids = results[0].boxes.id.cpu().numpy().astype(int)
            confs = results[0].boxes.conf.cpu().numpy()
            
            for box, tid, conf in zip(boxes, ids, confs):
                # หาจุดเท้า
                fx, fy = (box[0] + box[2]) / 2, box[3]
                
                is_out = geofencing.is_outside(fx, fy)
                duration = person_tracker.update(tid, is_out)

                # วาดกรอบคน
                color = (0, 0, 255) if is_out else (0, 255, 0)
                cv2.rectangle(frame, (int(box[0]), int(box[1])), (int(box[2]), int(box[3])), color, 2)
                cv2.putText(frame, f"ID:{tid} {duration:.1f}s", (int(box[0]), int(box[1]-10)), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                
                # --- 4. เงื่อนไขการแจ้งเตือนและการเซฟรูป ---
                if duration >= Config.ALERT_DURATION:
                    # สำคัญ: ต้องเช็ค can_send เพื่อไม่ให้เซฟรูปรัวๆ
                    if notifier.can_send(tid): 
                        img_path = f"alert_{tid}_{int(time.time())}.jpg"
                        
                        # เซฟ frame ที่วาด Zone เรียบร้อยแล้ว
                        cv2.imwrite(img_path, frame) 
                        
                        database.save_event(tid, "OUT_OF_ZONE", duration, conf, img_path)
                        notifier.send_alert_async(tid, duration, conf, img_path)

        # --- 5. แสดงผลหน้าจอ ---
        cv2.imshow("Alzheimer Monitoring", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'): break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()