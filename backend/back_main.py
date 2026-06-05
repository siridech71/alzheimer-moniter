import os, cv2, torch, numpy as np, asyncio, time, smtplib, threading, psycopg2
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = "mps" if torch.backends.mps.is_available() else "cpu"
model = YOLO("yolov8n.pt").to(device)

# --- Global States (ระบบใหม่) ---
running_monitors = {} 
latest_frames = {}    
current_alerts = [] 

def log_to_db(location):
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME_PG")
        )
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO alerts (event_type, location, alert_time) VALUES (%s, %s, %s)",
            ("ออกนอกพื้นที่", location, datetime.now())
        )
        conn.commit()
        cur.close()
        conn.close()
        print(f"💾 บันทึกแจ้งเตือน [{location}] ลง PostgreSQL สำเร็จ")
    except Exception as e:
        print(f"❌ DB Error: {e}")

def send_alert_email(to_email, frame):
    sender = os.getenv("GMAIL_EMAIL")
    pw = os.getenv("GMAIL_APP_PASSWORD")
    if not sender or not pw or not to_email: return
    try:
        msg = MIMEMultipart()
        msg['From'], msg['To'] = sender, to_email
        msg['Subject'] = f"⚠️ [Alzheimer Guard] แจ้งเตือน: พบคนออกนอกเขต ({datetime.now().strftime('%H:%M:%S')})"
        body = f"พบคนอยู่นอกเขตปลอดภัยเกิน 4 วินาที\nเวลา: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        msg.attach(MIMEText(body, 'plain'))
        _, buffer = cv2.imencode('.jpg', frame)
        msg.attach(MIMEImage(buffer.tobytes(), name="alert.jpg"))
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender, pw)
            server.send_message(msg)
        print(f"📧 ส่งอีเมลแจ้งเตือนสำเร็จไปยัง: {to_email}")
    except Exception as e: print(f"❌ SMTP Error: {e}")

async def monitor_engine(cam_id, source, safe_zone, email):
    global running_monitors, latest_frames, current_alerts
    src = int(source) if str(source).isdigit() else source
    cap = cv2.VideoCapture(src)
    out_of_zone_start_time = 0
    print(f"🚀 AI Engine Started: {cam_id}")
    
    while cam_id in running_monitors and running_monitors[cam_id]["active"]:
        ret, frame = cap.read()
        if not ret:
            if not str(source).isdigit(): cap.set(cv2.CAP_PROP_POS_FRAMES, 0); continue
            else: break

        frame = cv2.resize(frame, (1280, 720))
        if len(safe_zone) >= 3:
            poly_pts = np.array(safe_zone, np.int32)
            cv2.polylines(frame, [poly_pts], True, (0, 255, 0), 2)
            results = model(frame, classes=[0], conf=0.5, verbose=False, device=device)
            
            person_is_outside = False
            for box in results[0].boxes.xyxy.cpu().numpy():
                foot = [(box[0] + box[2]) / 2, box[3]]
                dist = cv2.pointPolygonTest(poly_pts, (float(foot[0]), float(foot[1])), False)
                if dist < 0:
                    person_is_outside = True
                    cv2.rectangle(frame, (int(box[0]), int(box[1])), (int(box[2]), int(box[3])), (0, 0, 255), 3)
            
            if person_is_outside:
                if out_of_zone_start_time == 0: out_of_zone_start_time = time.time()
                elapsed = time.time() - out_of_zone_start_time
                if elapsed >= 4.0:
                    threading.Thread(target=send_alert_email, args=(email, frame.copy())).start()
                    threading.Thread(target=log_to_db, args=(f"กล้อง {cam_id}",)).start()
                    current_alerts.append({"id": int(time.time()), "location": f"กล้อง {cam_id}", "time": datetime.now().strftime('%H:%M:%S')})
                    out_of_zone_start_time = time.time() + 60 
            else: out_of_zone_start_time = 0

        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
        latest_frames[cam_id] = buffer.tobytes()
        await asyncio.sleep(0.01)

    cap.release()
    if cam_id in latest_frames: del latest_frames[cam_id]
    print(f"🛑 Engine Stopped: {cam_id}")

@app.post("/api/sync-cameras")
async def sync_cameras(req: dict):
    global running_monitors
    cameras = req.get("cameras", [])
    active_ids = [str(c['id']) for c in cameras]
    
    # 1. หยุดกล้องที่ถูกลบ
    for old_id in list(running_monitors.keys()):
        if old_id not in active_ids:
            running_monitors[old_id]["active"] = False

    # 2. เริ่มกล้องใหม่
    for cam in cameras:
        cid = str(cam['id'])
        if cid not in running_monitors or not running_monitors[cid]["active"]:
            running_monitors[cid] = {"active": True}
            asyncio.create_task(monitor_engine(cid, cam['source'], cam['safe_zone'], cam.get('email_to')))
            
    return {"status": "synced", "active_engines": list(running_monitors.keys())}

@app.get("/api/video-feed/{cam_id}")
async def video_feed(cam_id: str):
    async def gen():
        while cam_id in running_monitors and running_monitors[cam_id]["active"]:
            frame = latest_frames.get(cam_id)
            if frame:
                yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
            await asyncio.sleep(0.05)
    return StreamingResponse(gen(), media_type='multipart/x-mixed-replace; boundary=frame')

@app.get("/api/get-latest-alerts")
async def get_latest_alerts():
    global current_alerts
    data = list(current_alerts); current_alerts = []
    return data

@app.get("/api/get-thumbnail")
async def get_thumb(source: str = None):
    src_val = source if source else "0"
    src = int(src_val) if str(src_val).isdigit() else src_val
    cap = cv2.VideoCapture(src)
    ret, frame = cap.read(); cap.release()
    if not ret: return Response(status_code=400)
    _, buf = cv2.imencode('.jpg', cv2.resize(frame, (1280, 720)))
    return Response(content=buf.tobytes(), media_type="image/jpeg")

# API สำหรับดึงภาพนิ่งล่าสุดเฟรมเดียว (สำหรับหน้า Dashboard)
@app.get("/api/last-frame/{cam_id}")
async def get_last_frame(cam_id: str):
    if cam_id in latest_frames:
        return Response(content=latest_frames[cam_id], media_type="image/jpeg")
    return Response(status_code=404)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)