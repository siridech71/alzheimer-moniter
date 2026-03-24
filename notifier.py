import smtplib
import threading
import time
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from config import Config

# ตัวแปรสำหรับเก็บเวลาล่าสุดที่ส่งแจ้งเตือนแยกตาม ID
_last_alert = {}

def can_send(tid):
    """ 
    ฟังก์ชันเช็คว่าผ่านช่วงเวลา Cooldown หรือยัง 
    คืนค่า True ถ้าส่งได้, False ถ้ายังติด Cooldown
    """
    now = time.time()
    # ถ้ายังไม่เคยส่งเลย หรือ ส่งครั้งล่าสุดนานเกินค่า COOLDOWN ใน config แล้ว
    if tid not in _last_alert or (now - _last_alert[tid]) > Config.COOLDOWN:
        return True
    return False

def send_alert_async(tid, duration, conf, img_path):
    """ ฟังก์ชันส่งอีเมลแบบเบื้องหลัง (Background) """
    
    # อัปเดตเวลาล่าสุดที่ส่งทันที
    _last_alert[tid] = time.time()

    def task():
        try:
            if not Config.EMAIL_USER or not Config.EMAIL_PASS:
                return

            msg = MIMEMultipart()
            msg["Subject"] = f"⚠️ ALERT: ผู้ป่วยออกนอกพื้นที่ (ID: {tid})"
            msg["From"] = Config.EMAIL_USER
            msg["To"] = Config.EMAIL_TO
            
            body = f"ตรวจพบผู้ป่วยออกนอกพื้นที่ปลอดภัย\nID: {tid}\nระยะเวลา: {duration:.1f} วินาที\nความแม่นยำ: {conf:.0%}"
            msg.attach(MIMEText(body, 'plain'))

            if os.path.exists(img_path):
                with open(img_path, 'rb') as f:
                    msg.attach(MIMEImage(f.read(), name="alert.jpg"))

            with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT) as server:
                server.starttls()
                server.login(Config.EMAIL_USER, Config.EMAIL_PASS)
                server.sendmail(Config.EMAIL_USER, Config.EMAIL_TO, msg.as_string())
            print(f"📧 ส่งอีเมลแจ้งเตือนสำเร็จสำหรับ ID {tid}")
        except Exception as e:
            print(f"Mail Error: {e}")

    threading.Thread(target=task, daemon=True).start()