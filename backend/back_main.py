import os
import cv2
import torch
import numpy as np
import asyncio
import time
import asyncpg
import json
import threading
import uuid
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from pathlib import Path
from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from ultralytics import YOLO
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

IMAGE_DIR = ROOT_DIR / "alert_images"
IMAGE_DIR.mkdir(parents=True, exist_ok=True)

# ---- Email Config (Free via Gmail) ----
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.environ.get("SMTP_EMAIL")
SENDER_PASSWORD = os.environ.get("SMTP_PASSWORD")

def send_email_direct(to_email, camera_name, event_type, duration, confidence, image_path):
    if not SENDER_EMAIL or not SENDER_PASSWORD:
        logger.error("Email settings missing in .env")
        return
    
    try:
        subject = f"🚨 แจ้งเตือน: พบพฤติกรรมเสี่ยงจากกล้อง {camera_name}"
        msg = MIMEMultipart()
        msg['From'] = f"Alzheimer Guard <{SENDER_EMAIL}>"
        msg['To'] = to_email
        msg['Subject'] = subject

        body = f"""
        <html>
            <body>
                <h2 style='color: #d32f2f;'>🚨 ตรวจพบพฤติกรรมเสี่ยง</h2>
                <p><b>เหตุการณ์:</b> {event_type}</p>
                <p><b>กล้อง:</b> {camera_name}</p>
                <p><b>เวลา:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
                <p><b>ระยะเวลาที่อยู่นอกพื้นที่:</b> {duration:.1f} วินาที</p>
                <p><b>ความมั่นใจ AI:</b> {confidence*100:.1f}%</p>
                <p><i>กรุณาตรวจสอบและให้ความช่วยเหลือโดยเร็ว</i></p>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))

        if image_path and os.path.exists(image_path):
            with open(image_path, 'rb') as f:
                img_data = f.read()
                image = MIMEImage(img_data, name=os.path.basename(image_path))
                msg.attach(image)

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        server.quit()
        logger.info(f"✅ Email sent to {to_email}")
    except Exception as e:
        logger.error(f"❌ Email failed: {e}")

# ---- Load YOLOv8 ----
device = "mps" if torch.backends.mps.is_available() else "cuda" if torch.cuda.is_available() else "cpu"
model = YOLO("yolov8n.pt").to(device)

# ---- Global State ----
db_pool = None
monitoring_sessions = {}
latest_frames = {}
pending_alerts = []
acknowledged_uids = set()

# ============================================================
# Monitoring Loop
# ============================================================

async def monitoring_loop(camera_id, camera_name, source, safe_zone, email_to, confidence_threshold, alert_delay):
    global latest_frames
    src = int(source) if str(source).isdigit() else source
    cap = cv2.VideoCapture(src)
    
    out_of_zone_start = 0
    last_alert_time = 0
    COOLDOWN = 30.0

    while monitoring_sessions.get(camera_id, {}).get("active"):
        ret, frame = cap.read()
        if not ret: break

        results = model(frame, classes=[0], conf=confidence_threshold, verbose=False)
        poly_pts = np.array(safe_zone, np.int32)
        cv2.polylines(frame, [poly_pts], True, (0, 255, 0), 2)

        person_out = False
        max_conf = 0

        for box in results[0].boxes:
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            conf = float(box.conf[0])
            foot_pos = (float((x1+x2)/2), float(y2))
            
            if cv2.pointPolygonTest(poly_pts, foot_pos, False) < 0:
                person_out = True
                max_conf = conf
                cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 0, 255), 2)
        
        now = time.time()
        if person_out:
            if out_of_zone_start == 0: out_of_zone_start = now
            elapsed = now - out_of_zone_start
            if elapsed >= alert_delay and (now - last_alert_time) > COOLDOWN:
                img_path = IMAGE_DIR / f"alert_{uuid.uuid4()}.jpg"
                cv2.imwrite(str(img_path), frame)
                
                # ส่งเมลทันทีจาก Backend
                if email_to:
                    threading.Thread(target=send_email_direct, args=(
                        email_to, camera_name, "ออกนอกพื้นที่ Safe Zone", elapsed, max_conf, str(img_path)
                    )).start()
                
                last_alert_time = now
        else:
            out_of_zone_start = 0

        _, buffer = cv2.imencode('.jpg', frame)
        latest_frames[camera_id] = buffer.tobytes()
        await asyncio.sleep(0.01)

    cap.release()

# ============================================================
# FastAPI App
# ============================================================
class MonitoringRequest(BaseModel):
    camera_id: str
    camera_name: str = "Camera"
    camera_source: str
    safe_zone: List[List[int]]
    email_to: str
    confidence_threshold: float = 0.6
    alert_delay_seconds: float = 4.0
    
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/api/start-monitoring")
async def start_monitoring(req: MonitoringRequest):
    monitoring_sessions[req.camera_id] = {"active": True}
    asyncio.create_task(monitoring_loop(
        req.camera_id, req.camera_name, req.camera_source, 
        req.safe_zone, req.email_to, req.confidence_threshold, req.alert_delay_seconds
    ))
    return {"status": "success"}

@app.get("/api/video-feed")
async def video_feed(camera_id: str):
    async def generate():
        while True:
            frame = latest_frames.get(camera_id)
            if frame:
                yield b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame + b'\r\n'
            await asyncio.sleep(0.05)
    return StreamingResponse(generate(), media_type='multipart/x-mixed-replace; boundary=frame')

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)