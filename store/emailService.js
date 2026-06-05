import { base44 } from "../api/base44Client";

/**
 * ส่งอีเมลแจ้งเตือนเมื่อตรวจพบพฤติกรรมเสี่ยง
 * ใช้ Base44 SendEmail integration (ไม่ต้องตั้งค่า SMTP เอง)
 */
export async function sendAlertEmail({ toEmail, cameraName, eventType, durationSeconds, confidenceScore, timestamp, imageUrl }) {
  const eventLabels = {
    out_of_zone: "ออกนอกพื้นที่ Safe Zone",
    fall_detected: "ตรวจจับการล้ม",
    prolonged_standing: "ยืนนานผิดปกติ",
  };

  const eventLabel = eventLabels[eventType] || eventType;
  const timeStr = timestamp ? new Date(timestamp).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }) : new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
  const confPct = confidenceScore ? `${(confidenceScore * 100).toFixed(0)}%` : "-";

  const subject = `🚨 [แจ้งเตือน] ${eventLabel} — กล้อง: ${cameraName}`;

  const body = `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 24px; border-radius: 12px;">
  
  <div style="background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background: #EF4444; padding: 20px 24px;">
      <h1 style="margin: 0; color: white; font-size: 18px; font-weight: 700;">🚨 แจ้งเตือนพฤติกรรมเสี่ยง</h1>
      <p style="margin: 4px 0 0; color: rgba(255,255,255,0.85); font-size: 13px;">ระบบ Alzheimer Guard AI</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 24px;">
      
      <div style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 15px; font-weight: 600; color: #991B1B;">${eventLabel}</p>
        <p style="margin: 4px 0 0; font-size: 13px; color: #B91C1C;">ตรวจพบโดยระบบ AI อัตโนมัติ</p>
      </div>
      
      <!-- Details table -->
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 10px 0; color: #64748B; width: 40%;">📹 กล้องที่ตรวจพบ</td>
          <td style="padding: 10px 0; font-weight: 600; color: #1E293B;">${cameraName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 10px 0; color: #64748B;">🕐 เวลาที่ตรวจพบ</td>
          <td style="padding: 10px 0; font-weight: 600; color: #1E293B;">${timeStr}</td>
        </tr>
        ${durationSeconds ? `
        <tr style="border-bottom: 1px solid #F1F5F9;">
          <td style="padding: 10px 0; color: #64748B;">⏱ ระยะเวลานอกพื้นที่</td>
          <td style="padding: 10px 0; font-weight: 600; color: #EF4444;">${durationSeconds.toFixed(1)} วินาที</td>
        </tr>` : ""}
        <tr>
          <td style="padding: 10px 0; color: #64748B;">🤖 ความมั่นใจ AI</td>
          <td style="padding: 10px 0; font-weight: 600; color: #1E293B;">${confPct}</td>
        </tr>
      </table>
      
      ${imageUrl ? `
      <div style="margin-top: 20px;">
        <p style="font-size: 13px; color: #64748B; margin-bottom: 8px;">📷 ภาพหลักฐาน ณ เวลาที่ตรวจพบ:</p>
        <img src="${imageUrl}" style="width: 100%; border-radius: 8px; border: 1px solid #E2E8F0;" alt="Evidence" />
      </div>` : ""}
      
      <div style="margin-top: 20px; padding: 14px 16px; background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px;">
        <p style="margin: 0; font-size: 13px; color: #166534; font-weight: 500;">✅ กรุณาตรวจสอบสถานการณ์และให้ความช่วยเหลือผู้ป่วยโดยเร็ว</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="padding: 16px 24px; background: #F8FAFC; border-top: 1px solid #E2E8F0;">
      <p style="margin: 0; font-size: 12px; color: #94A3B8; text-align: center;">
        ส่งโดยอัตโนมัติจาก Alzheimer Guard AI • ระบบเฝ้าระวังผู้ป่วยอัลไซเมอร์
      </p>
    </div>
  </div>
</div>
  `.trim();

  await base44.integrations.Core.SendEmail({
    to: toEmail,
    subject,
    body,
    from_name: "Alzheimer Guard AI",
  });
}

/**
 * ส่ง email ทดสอบ
 */
export async function sendTestEmail(toEmail) {
  await base44.integrations.Core.SendEmail({
    to: toEmail,
    subject: "✅ ทดสอบการแจ้งเตือน — Alzheimer Guard AI",
    body: `
<div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
  <div style="background: white; border-radius: 8px; padding: 24px; border: 1px solid #e2e8f0;">
    <h2 style="color: #4F7CFF; margin: 0 0 12px;">✅ การเชื่อมต่อ Email สำเร็จ!</h2>
    <p style="color: #475569; margin: 0;">ระบบ Alzheimer Guard AI พร้อมส่งการแจ้งเตือนมายัง <strong>${toEmail}</strong> เมื่อตรวจพบพฤติกรรมเสี่ยง</p>
    <p style="color: #94A3B8; font-size: 12px; margin: 16px 0 0;">ส่งเมื่อ: ${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}</p>
  </div>
</div>`,
    from_name: "Alzheimer Guard AI",
  });
}