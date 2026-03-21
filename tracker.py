"""
tracker.py — ติดตามบุคคลและจับเวลานอก zone

ทำไมต้องแยกไฟล์นี้ออกมา?
- Logic การติดตามและจับเวลาซับซ้อนพอที่ควรแยก
- ทดสอบ duration logic ได้โดยไม่ต้องเปิดกล้อง
- ถ้าอยากเปลี่ยน tracker (ByteTrack → DeepSORT)
  แก้ที่นี่ที่เดียว
"""

import time
from collections import defaultdict
from config import ALERT_DURATION_SECONDS


class PersonTracker:
    """
    ติดตามแต่ละคนด้วย track_id และจับเวลาที่อยู่นอก zone

    ทำไมใช้ class แทน function ธรรมดา?
    → ต้องเก็บ state (outside_since) ข้ามเฟรม
      class เก็บ state ไว้ใน self ได้สะดวกกว่า
      global variable ที่กระจัดกระจาย

    ทำไมใช้ defaultdict(lambda: None)?
    → ถ้า key ไม่มีอยู่จะได้ None อัตโนมัติ
      ไม่ต้องเขียน if track_id not in dict ทุกครั้ง
    """

    def __init__(self):
        # เวลาที่แต่ละคนเริ่มออกนอก zone
        # {track_id: timestamp หรือ None ถ้าอยู่ใน zone}
        self._outside_since: dict[int, float | None] = defaultdict(lambda: None)

    def update(self, track_id: int, is_outside: bool) -> float | None:
        """
        อัปเดต state ของคนคนหนึ่ง

        Parameters
        ----------
        track_id   : ID ของคนที่ ByteTrack กำหนดให้
        is_outside : True = อยู่นอก zone ตอนนี้

        Returns
        -------
        float | None
            วินาทีที่อยู่นอก zone ถ้าเกิน ALERT_DURATION
            None ถ้ายังไม่ถึงเกณฑ์หรืออยู่ใน zone
        """
        if is_outside:
            if self._outside_since[track_id] is None:
                # เพิ่งออกนอก zone → จดเวลาเริ่ม
                self._outside_since[track_id] = time.time()

            duration = time.time() - self._outside_since[track_id]

            if duration >= ALERT_DURATION_SECONDS:
                return duration   # เกินเกณฑ์ → แจ้งเตือน
        else:
            # กลับเข้า zone แล้ว → รีเซ็ต
            self._outside_since[track_id] = None

        return None

    def get_outside_info(self) -> dict[int, float]:
        """
        คืน dict ของคนที่อยู่นอก zone พร้อมระยะเวลา
        ใช้ใน draw_overlay เพื่อแสดงผล
        """
        now = time.time()
        result = {}
        for tid, since in self._outside_since.items():
            if since is not None:
                result[tid] = now - since
        return result

    def cleanup_lost_tracks(self, active_ids: set[int]) -> None:
        """
        ลบ track_id ที่หายไปจากภาพแล้ว
        ป้องกัน memory leak เมื่อมีคนเดินเข้าออกบ่อย

        ทำไมต้องทำ?
        → ByteTrack จะออก ID ใหม่ให้เรื่อยๆ
          ถ้าไม่ล้าง dict จะโตเรื่อยๆ จนกินหน่วยความจำ
        """
        lost = set(self._outside_since.keys()) - active_ids
        for tid in lost:
            del self._outside_since[tid]