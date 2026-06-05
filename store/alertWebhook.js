import { base44 } from "../api/base44Client";

export async function handleAlertWebhook(payload) {
  const {
    camera_id,
    camera_name,
    event_type = "out_of_zone",
    duration_seconds,
    confidence_score,
    track_id,
  } = payload;

  // บันทึก Alert ลงฐานข้อมูลเฉยๆ เพื่อโชว์ในหน้า Dashboard
  const alert = await base44.entities.Alert.create({
    camera_id,
    camera_name,
    event_type,
    duration_seconds,
    confidence_score,
    status: "new",
    track_id: track_id ? String(track_id) : undefined,
  });

  return alert;
}