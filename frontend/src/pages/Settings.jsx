import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import { sendTestEmail } from "../lib/emailService";
import { Mail, Server, Save, Loader2, TestTube2, Check, AlertCircle, Info } from "lucide-react";

export default function Settings() {
  const qc = useQueryClient();
  const [backendUrl, setBackendUrl] = useState("http://localhost:8001");
  const [testEmail, setTestEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const { data: settings = [] } = useQuery({
    queryKey: ["settings"],
    queryFn: () => base44.entities.SystemSettings.list(),
  });

  useEffect(() => {
    const backendSetting = settings.find(s => s.key === "backend_url");
    if (backendSetting?.value) setBackendUrl(backendSetting.value);

    const emailSetting = settings.find(s => s.key === "alert_test_email");
    if (emailSetting?.value) setTestEmail(emailSetting.value);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const backendSetting = settings.find(s => s.key === "backend_url");
      if (backendSetting) {
        await base44.entities.SystemSettings.update(backendSetting.id, { value: backendUrl });
      } else {
        await base44.entities.SystemSettings.create({ key: "backend_url", value: backendUrl, description: "FastAPI Backend URL" });
      }
      qc.invalidateQueries({ queryKey: ["settings"] });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      setTestResult({ ok: false, msg: "กรุณากรอก Email ที่ต้องการทดสอบ" });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      await sendTestEmail(testEmail);
      setTestResult({ ok: true, msg: `ส่ง Email ทดสอบไปยัง ${testEmail} สำเร็จ! กรุณาตรวจสอบ Inbox` });
    } catch (err) {
      setTestResult({ ok: false, msg: `เกิดข้อผิดพลาด: ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">ตั้งค่าระบบ</h1>
        <p className="text-sm text-muted-foreground mt-0.5">จัดการการตั้งค่า Backend และทดสอบการแจ้งเตือน</p>
      </div>

      {/* Email info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">ระบบ Email พร้อมใช้งานทันที</p>
          <p className="text-xs text-blue-600 mt-1">
            Alzheimer Guard AI ใช้ระบบ Email ของ Base44 Platform ในการส่งแจ้งเตือน
            <strong> ไม่ต้องตั้งค่า Gmail SMTP หรือ App Password เอง</strong> —
            เพียงระบุ Email ผู้รับในหน้าตั้งค่ากล้องแต่ละตัว
          </p>
        </div>
      </div>

      {/* Backend URL */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Server size={15} /> Backend URL (FastAPI)
        </h3>
        <div>
          <label className="text-xs font-medium text-muted-foreground">FastAPI Server URL</label>
          <input
            value={backendUrl}
            onChange={e => setBackendUrl(e.target.value)}
            placeholder="http://localhost:8001"
            className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            URL ของ FastAPI Backend ที่รันบนเครื่อง — ใช้สำหรับ stream วิดีโอและ AI วิเคราะห์ภาพ
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          บันทึก
        </button>
      </div>

      {/* Test Email */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Mail size={15} /> ทดสอบการส่ง Email แจ้งเตือน
        </h3>
        <p className="text-xs text-muted-foreground">
          ทดสอบว่าระบบสามารถส่ง Email แจ้งเตือนไปยังผู้ดูแลได้จริง
        </p>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Email ปลายทาง</label>
          <input
            type="email"
            value={testEmail}
            onChange={e => setTestEmail(e.target.value)}
            placeholder="caregiver@example.com"
            className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {testResult && (
          <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm ${testResult.ok ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
            {testResult.ok ? <Check size={15} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />}
            {testResult.msg}
          </div>
        )}

        <button
          onClick={handleTest}
          disabled={testing || !testEmail}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm hover:bg-secondary transition-colors disabled:opacity-60"
        >
          {testing ? <Loader2 size={14} className="animate-spin" /> : <TestTube2 size={14} />}
          ส่ง Email ทดสอบ
        </button>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-xl border border-border p-6 space-y-3">
        <h3 className="text-sm font-semibold">วิธีการทำงานของระบบแจ้งเตือน</h3>
        <ol className="space-y-2">
          {[
            "กล้องวงจรปิดส่งภาพแบบ real-time ไปยัง FastAPI Backend บนเครื่องท้องถิ่น",
            "AI (YOLOv8 + ByteTrack) วิเคราะห์ภาพและตรวจจับตำแหน่งผู้ป่วย",
            "เมื่อผู้ป่วยอยู่นอก Safe Zone เกินเวลาที่กำหนด Backend จะส่ง webhook มายัง Frontend",
            "Frontend รับ webhook แล้วส่ง Email ผ่าน Base44 Platform ไปยัง Email ที่ตั้งค่าในแต่ละกล้อง",
            "Alert ถูกบันทึกลงฐานข้อมูลพร้อมภาพหลักฐาน — มี Cooldown 30 วินาที ป้องกันแจ้งซ้ำ",
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-muted-foreground">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-semibold">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}