import os
import numpy as np
from dotenv import load_dotenv

load_dotenv()

class Config:
    # --- กล้องและโมเดล ---
    # เปลี่ยนเป็น 0 สำหรับ Webcam หรือใส่พาธ "video/a.mp4" ตามในโฟลเดอร์คุณ
    CAMERA_SOURCE = "video/a.mp4" 
    YOLO_MODEL = "yolov8n.pt" 
    CONF_THRESHOLD = 0.5
    
    # --- พื้นที่ปลอดภัย (Safe Zone) ---
    # ปรับพิกัด [x, y] ตามพื้นที่จริง (เรียงตามเข็มนาฬิกา)
    SAFE_ZONE_POLYGON = np.array([
        (100, 100), (540, 100), (540, 380), (100, 380)
    ], np.int32)
    
    # --- เงื่อนไขการแจ้งเตือน ---
    ALERT_DURATION = 4.0   # อยู่นอกเขตนาน 4 วินาทีถึงจะเตือน
    COOLDOWN = 30          # พักการเตือน 30 วินาทีหลังส่งเมลไปแล้ว
    
    # --- อีเมล (ดึงค่าจากไฟล์ .env) ---
    SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
    EMAIL_USER = os.getenv("EMAIL_USER", "")
    EMAIL_PASS = os.getenv("EMAIL_PASS", "")
    EMAIL_TO = os.getenv("EMAIL_TO", "")