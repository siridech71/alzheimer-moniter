import time
from config import Config

class PersonTracker:
    def __init__(self):
        # เก็บเวลาที่เริ่มออกนอกเขตแยกตาม ID
        self.timers = {}

    def update(self, tid, out_status):
        if out_status:
            if tid not in self.timers:
                self.timers[tid] = time.time()
            return time.time() - self.timers[tid]
        else:
            self.timers.pop(tid, None)
            return 0