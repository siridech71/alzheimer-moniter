import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { handleAlertWebhook } from "../lib/alertWebhook";

const BACKEND_URL_KEY = "backend_url";
const POLL_INTERVAL = 3000; // poll ทุก 3 วินาที

/**
 * Hook สำหรับ Poll alert ใหม่จาก Backend Python
 * เมื่อได้รับ alert ใหม่จะ:
 *   1. บันทึก Alert ลงฐานข้อมูล
 *   2. ส่ง Email ผ่าน Base44
 *   3. Refresh alert list บน UI
 */
export function useAlertListener(backendUrl = "http://localhost:8001") {
  const qc = useQueryClient();
  const processedIds = useRef(new Set());
  const intervalRef = useRef(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/pending-alerts`, { signal: AbortSignal.timeout(2500) });
      if (!res.ok) return;
      const data = await res.json();
      const pendingAlerts = data.alerts || [];

      for (const alert of pendingAlerts) {
        const uid = alert.alert_uid || `${alert.camera_id}-${alert.timestamp}`;
        if (processedIds.current.has(uid)) continue;
        processedIds.current.add(uid);

        // ประมวลผล: บันทึก DB + ส่ง Email
        handleAlertWebhook(alert).then(() => {
          qc.invalidateQueries({ queryKey: ["alerts"] });
          qc.invalidateQueries({ queryKey: ["alerts-unread"] });
          // ยืนยัน backend ว่าประมวลผลแล้ว
          fetch(`${backendUrl}/api/acknowledge-alert`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ alert_uid: uid }),
          }).catch(() => {});
        }).catch(console.error);
      }
    } catch {
      // ถ้า backend ไม่ตอบ ก็แค่รอรอบถัดไป
    }
  }, [backendUrl, qc]);

  useEffect(() => {
    if (!backendUrl) return;
    intervalRef.current = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [poll, backendUrl]);
}