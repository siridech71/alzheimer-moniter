"""
notifier.py — ส่งแจ้งเตือนผ่าน Email (SMTP)

ทำไมเปลี่ยนจาก LINE Notify มา Email?
- LINE Notify ประกาศปิดบริการ (ใช้ไม่ได้อีกต่อไป)
- Email ใช้ได้ทุก provider เช่น Gmail, Outlook, Yahoo
- ส่งได้ทั้งข้อความและภาพแนบในคราวเดียว
- ไม่มีข้อจำกัดจำนวนครั้งส่ง

ทำไมใช้ smtplib?
- มาพร้อมกับ Python ไม่ต้อง pip install เพิ่ม
- รองรับทุก email provider ที่มี SMTP server
"""

import smtplib
import time
import os
import threading
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# ดึงค่าจาก .env
SMTP_HOST: str  = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT: int  = int(os.getenv("SMTP_PORT", "587"))
EMAIL_USER: str = os.getenv("EMAIL_USER", "")   # อีเมลผู้ส่ง
EMAIL_PASS: str = os.getenv("EMAIL_PASS", "")   # App Password
EMAIL_TO: str   = os.getenv("EMAIL_TO", "")     # อีเมลผู้รับ (ผู้ดูแล)

from config import COOLDOWN_SECONDS

# cooldown แยกตาม track_id เหมือนเดิม
_last_alert_time: dict[int, float] = {}


def can_send_alert(track_id: int) -> bool:
    """ตรวจสอบว่าผ่าน cooldown แล้วหรือยัง"""
    last = _last_alert_time.get(track_id, 0)
    return (time.time() - last) > COOLDOWN_SECONDS


def send_email_notify(
    track_id: int,
    duration: float,
    confidence: float,
    image_path: str = None,
) -> bool:
    """
    ส่ง Email แจ้งเตือนพร้อมภาพแนบ

    ทำไมใช้ MIMEMultipart?
    -> ทำให้ส่งได้ทั้งข้อความและไฟล์แนบในเมลเดียว
       ถ้าใช้ MIMEText อย่างเดียวจะแนบไฟล์ไม่ได้

    ทำไมใช้ port 587?
    -> เป็น port มาตรฐานสำหรับ STARTTLS (TLS แบบ upgrade)
       ปลอดภัยกว่า port 25 และใช้ได้กับ Gmail, Outlook ฯลฯ
    """
    if not all([EMAIL_USER, EMAIL_PASS, EMAIL_TO]):
        print("[Email] ไม่พบข้อมูล email — ตรวจสอบไฟล์ .env")
        return False

    if not can_send_alert(track_id):
        return False

    # อัปเดต cooldown ทันที ก่อนส่ง thread
    # ทำไมอัปเดตก่อน?
    # → ถ้าอัปเดตใน thread อาจส่งซ้ำได้ถ้า thread ยังไม่ทัน update
    _last_alert_time[track_id] = time.time()

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # สร้าง Email
    msg = MIMEMultipart()
    msg["From"]    = EMAIL_USER
    msg["To"]      = EMAIL_TO
    msg["Subject"] = f"แจ้งเตือน: ผู้ป่วยออกนอกพื้นที่ [{now_str}]"

    body = f"""
    <h2 style="color:#c0392b;">แจ้งเตือน: ผู้ป่วยออกนอกพื้นที่!</h2>
    <table style="font-size:15px;line-height:2">
      <tr><td><b>เวลา</b></td><td>{now_str}</td></tr>
      <tr><td><b>Track ID</b></td><td>{track_id}</td></tr>
      <tr><td><b>อยู่นอกพื้นที่นาน</b></td><td>{duration:.1f} วินาที</td></tr>
      <tr><td><b>ความมั่นใจ AI</b></td><td>{confidence:.0%}</td></tr>
    </table>
    <p style="color:#7f8c8d;font-size:13px;">
      ข้อความนี้ส่งโดยระบบแจ้งเตือนผู้ป่วยอัลไซเมอร์อัตโนมัติ
    </p>
    """
    msg.attach(MIMEText(body, "html", "utf-8"))

    if image_path:
        try:
            with open(image_path, "rb") as f:
                img_data = f.read()
            image = MIMEImage(img_data, name=os.path.basename(image_path))
            msg.attach(image)
        except FileNotFoundError:
            pass

    def _send(msg_str: str) -> None:
        """
        ส่ง email ใน background thread
        ทำไมใช้ thread แยก?
        → การส่ง email ใช้เวลา 1-10 วินาที
          ถ้ารันใน main loop จะทำให้ภาพกล้องค้างระหว่างส่ง
          thread แยกทำให้กล้องทำงานต่อได้ทันที
        """
        try:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                server.starttls()
                server.login(EMAIL_USER, EMAIL_PASS)
                server.sendmail(EMAIL_USER, EMAIL_TO, msg_str)
            print(f"[Email] ส่งแจ้งเตือน ID={track_id} สำเร็จ -> {EMAIL_TO}")
        except smtplib.SMTPAuthenticationError:
            print("[Email] Login ไม่สำเร็จ — ตรวจสอบ EMAIL_USER และ EMAIL_PASS")
        except smtplib.SMTPException as e:
            print(f"[Email] SMTP Error: {e}")
        except Exception as e:
            print(f"[Email] Error: {e}")

    # รัน _send ใน thread แยก
    # daemon=True = thread ปิดตามเมื่อโปรแกรมหลักปิด
    t = threading.Thread(target=_send, args=(msg.as_string(),), daemon=True)
    t.start()
    print(f"[Email] กำลังส่งแจ้งเตือน ID={track_id} (background)...")
    return True


# alias ให้ main.py เรียกชื่อเดิมได้ ไม่ต้องแก้ main.py
send_line_notify = send_email_notify