import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { localStore } from "../api/localStore"; // นำเข้าตัวจัดการข้อมูลใหม่
import { Save, ArrowLeft, RefreshCw, Camera, Mail, Shield } from "lucide-react";

export default function CameraDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";
  const [previewUrl, setPreviewUrl] = useState(null);

  const [form, setForm] = useState({
    name: "", source: "0", email_to: "", confidence_threshold: 0.6, alert_delay_seconds: 4, safe_zone: []
  });

  // ดึงข้อมูลเดิมมาแสดง (ถ้าเป็นการแก้ไข)
  useEffect(() => {
    if (!isNew) {
      const data = localStore.cameras.get(id);
      if (data) setForm(data);
    } else {
      // ดึงอีเมลเริ่มต้นจาก Settings (ถ้ามี)
      const settings = JSON.parse(localStorage.getItem("local_settings") || "{}");
      if (settings.alert_emails) setForm(f => ({ ...f, email_to: settings.alert_emails }));
    }
  }, [id, isNew]);

  const handleSave = () => {
    if (!form.name) return alert("กรุณาระบุชื่อกล้อง");
    localStore.cameras.save(form);
    alert("บันทึกข้อมูลเรียบร้อย!");
    navigate("/cameras");
  };

  const handleLoadPreview = async () => {
    try {
      const response = await fetch(`http://localhost:8001/api/get-thumbnail?source=${form.source}`);
      if (response.ok) {
        const blob = await response.blob();
        setPreviewUrl(URL.createObjectURL(blob));
      }
    } catch (e) {
      alert("เชื่อมต่อ Backend ไม่ได้! กรุณารัน python back_main.py");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors">
          <ArrowLeft size={20}/> ย้อนกลับ
        </button>
        <h1 className="text-2xl font-black text-slate-900">{isNew ? "ติดตั้งกล้องใหม่" : "ตั้งค่ากล้อง"}</h1>
        <div className="w-10"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">ชื่อกล้อง</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full mt-1 p-4 bg-slate-50 border-none rounded-2xl outline-none" placeholder="เช่น ห้องนั่งเล่น" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">แหล่งสัญญาณ</label>
              <input value={form.source} onChange={e => setForm({...form, source: e.target.value})} className="w-full mt-1 p-4 bg-slate-50 border-none rounded-2xl outline-none font-mono" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">อีเมลแจ้งเตือน</label>
              <textarea value={form.email_to} onChange={e => setForm({...form, email_to: e.target.value})} className="w-full mt-1 p-4 bg-slate-50 border-none rounded-2xl outline-none text-sm" rows="3" />
            </div>
          </div>
          <button onClick={handleSave} className="w-full bg-blue-600 text-white py-4 rounded-[2rem] font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
            <Save size={20} /> บันทึกข้อมูล
          </button>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-[3rem] aspect-video flex flex-col items-center justify-center border-4 border-white shadow-2xl relative overflow-hidden group">
            {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <Camera size={48} className="text-slate-800" />}
            <button onClick={handleLoadPreview} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 py-2 rounded-xl text-xs font-bold transition-all">
              <RefreshCw size={14} className="inline mr-1" /> โหลดภาพล่าสุด
            </button>
          </div>
          <div className="mt-6 bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 flex gap-4">
            <Shield className="text-blue-500 shrink-0" size={24} />
            <p className="text-sm text-blue-700 font-medium"><b>คำแนะนำ:</b> เมื่อภาพจากกล้องแสดงผลแล้ว คุณสามารถวาดเส้นพื้นที่ปลอดภัยได้ทันที</p>
          </div>
        </div>
      </div>
    </div>
  );
}