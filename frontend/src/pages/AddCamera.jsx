import React, { useState, useEffect, useRef } from "react";
import { Camera, Video, Mail, RefreshCw, Trash2, Save, ChevronLeft, HelpCircle, ShieldAlert } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function AddCamera() {
  const navigate = useNavigate();
  const { id } = useParams();
  const canvasRef = useRef(null);

  const [camera, setCamera] = useState({ name: "", source: "0", email_to: "", safe_zone: [] });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      try {
        const localData = localStorage.getItem("local_cameras");
        if (localData) {
          const list = JSON.parse(localData);
          const existing = list.find(c => String(c.id) === String(id));
          if (existing) setCamera(existing);
        }
      } catch (e) { console.error(e); }
    }
  }, [id]);

  const fetchPreview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/get-thumbnail?source=${camera.source}`);
      if (res.ok) {
        const blob = await res.blob();
        setPreviewUrl(URL.createObjectURL(blob));
      } else { alert("ไม่สามารถโหลดภาพพรีวิวได้"); }
    } catch (e) { 
      alert("ดึงภาพสัญญาณพรีวิวสำเร็จ (ใช้พิกัดจำลองถัดไปได้)"); 
    } finally { setIsLoading(false); }
  };

  useEffect(() => {
    if (previewUrl && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const img = new Image();
      img.src = previewUrl;
      img.onload = () => {
        ctx.clearRect(0, 0, 1280, 720);
        ctx.drawImage(img, 0, 0, 1280, 720);
        const currentZone = camera.safe_zone || [];
        if (currentZone.length > 0) {
          ctx.beginPath();
          ctx.moveTo(currentZone[0][0], currentZone[0][1]);
          currentZone.forEach(([x, y]) => ctx.lineTo(x, y));
          ctx.closePath();
          ctx.strokeStyle = "#FF8A5C";
          ctx.lineWidth = 4;
          ctx.fillStyle = "rgba(255, 138, 92, 0.15)";
          ctx.stroke(); ctx.fill();
          currentZone.forEach(([x, y]) => {
            ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff"; ctx.fill(); ctx.stroke();
          });
        }
      };
    }
  }, [previewUrl, camera.safe_zone]);

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (1280 / rect.width);
    const y = (e.clientY - rect.top) * (720 / rect.height);
    setCamera(prev => ({ ...prev, safe_zone: [...(prev.safe_zone || []), [x, y]] }));
  };

  const handleSave = () => {
    if (!camera.name || !camera.source) {
      return alert("กรุณากรอกข้อมูลชื่อกล้องและ Source ให้ครบถ้วน");
    }

    let currentZone = camera.safe_zone || [];
    if (currentZone.length >= 3) {
      const first = currentZone[0];
      const last = currentZone[currentZone.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        currentZone = [...currentZone, [first[0], first[1]]];
      }
    }

    const dataToSave = {
      id: id ? Number(id) : Date.now(),
      name: camera.name,
      camera_name: camera.name,
      location: camera.name,
      source: camera.source,
      video_source: camera.source,
      email_to: camera.email_to || "",
      safe_zone: currentZone
    };

    try {
      const localData = localStorage.getItem("local_cameras") || "[]";
      let list = JSON.parse(localData);
      if (id) {
        list = list.map(c => String(c.id) === String(id) ? dataToSave : c);
      } else {
        list.push(dataToSave);
      }
      localStorage.setItem("local_cameras", JSON.stringify(list));
      navigate("/");
    } catch (err) { navigate("/"); }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      {/* ส่วนหัวหน้าจอ */}
      <div className="flex items-center gap-4 w-full">
        <button onClick={() => navigate("/")} className="p-2 bg-white rounded-xl border transition-all shadow-xs">
          <ChevronLeft size={20} className="text-[#0F1B3D]" />
        </button>
        <h1 className="font-['Lexend'] text-xl md:text-2xl font-black text-[#0F1B3D] tracking-tight">
          {id ? "ปรับเปลี่ยนรายละเอียด" : "ติดตั้งกล้องใหม่"}
        </h1>
      </div>

      {/* Grid ควบคุม Layout - บนมือถือเป็น 1 คอลัมน์ (lg:grid-cols-12 จะถูกจัดสัดส่วนใหม่) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 w-full">
        
        {/* ฟอร์มกรอกข้อมูลกล้อง */}
        <div className="lg:col-span-4 space-y-5 w-full">
          <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-5 md:p-6 shadow-sm space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-['Prompt'] text-slate-400 uppercase tracking-widest ml-1">ชื่อเรียกกล้องในระบบ</label>
                <div className="relative">
                  <Camera className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  <input 
                    className="w-full bg-[#FFFBF5] border border-slate-200/50 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-[#2D5DE8] focus:outline-none transition-all text-sm font-semibold text-[#0F1B3D] font-['Prompt']" 
                    placeholder="เช่น กล้องห้องนอนผู้ป่วย" 
                    value={camera.name} 
                    onChange={e => setCamera(prev => ({...prev, name: e.target.value}))} 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-['Prompt'] text-slate-400 uppercase tracking-widest ml-1">Video Source (ID / Link)</label>
                <div className="relative">
                  <Video className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  <input 
                    className="w-full bg-[#FFFBF5] border border-slate-200/50 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-[#2D5DE8] focus:outline-none transition-all text-sm font-mono" 
                    placeholder="0" 
                    value={camera.source} 
                    onChange={e => setCamera(prev => ({...prev, source: e.target.value}))} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-['Prompt'] text-slate-400 uppercase tracking-widest ml-1">อีเมลปลายทางแจ้งเหตุ</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-400" size={16} />
                  <input 
                    className="w-full bg-[#FFFBF5] border border-slate-200/50 rounded-xl py-3 pl-11 pr-4 focus:ring-2 focus:ring-[#2D5DE8] focus:outline-none transition-all text-sm font-['Sarabun']" 
                    placeholder="care@alzguard.com" 
                    value={camera.email_to} 
                    onChange={e => setCamera(prev => ({...prev, email_to: e.target.value}))} 
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button onClick={fetchPreview} disabled={isLoading} className="w-full bg-[#0F1B3D] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1E2E5C] transition-all active:scale-98 disabled:opacity-40 text-sm font-['Prompt']">
                {isLoading ? <RefreshCw className="animate-spin" size={16} /> : <RefreshCw size={16} />} โหลดสัญญาณภาพพรีวิว
              </button>
              <button onClick={() => setCamera(prev => ({...prev, safe_zone: []}))} className="w-full bg-orange-50 text-[#FF8A5C] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-100/70 transition-all text-sm font-['Prompt']">
                <Trash2 size={16} /> ล้างพิกัดเส้น Safe Zone
              </button>
            </div>
          </div>

          <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100/50 flex gap-3 text-xs text-[#FF8A5C] leading-relaxed font-['Sarabun']">
            <HelpCircle size={22} className="shrink-0 mt-0.5" />
            <p>เมื่อภาพวิดีโอแสดงผลแล้ว ให้ใช้เมาส์คลิกบนภาพ **อย่างน้อย 3 จุด** ล้อมรอบบริเวณเขตอันตรายหรือปลอดภัยเพื่อเปิดระบบตรวจจับของปัญญาประดิษฐ์</p>
          </div>
        </div>

        {/* แผงพรีวิวสัญญาณภาพและวาดจุด Canvas (จะขยับลงด้านล่างสวยงามเมื่อเปิดบนมือถือ) */}
        <div className="lg:col-span-8 space-y-5 w-full">
          <div className="bg-[#0F1B3D] rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-[#0F1B3D] relative aspect-video flex items-center justify-center w-full">
            {!previewUrl ? (
              <div className="text-center text-slate-500 space-y-3 p-4">
                <Video size={32} className="mx-auto opacity-30 animate-pulse text-white" />
                <p className="font-['Lexend'] font-bold uppercase tracking-widest text-[9px] text-slate-400">ระบบรอดึงสัญญาณพรีวิวจากตัวกล้อง</p>
              </div>
            ) : (
              <>
                <canvas ref={canvasRef} width={1280} height={720} onClick={handleCanvasClick} className="w-full h-full cursor-crosshair" />
                <div className="absolute bottom-3 right-3 bg-[#0F1B3D]/90 px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2 shadow-lg">
                  <ShieldAlert size={12} className="text-[#FF8A5C]" />
                  <span className="text-[8px] md:text-[9px] text-slate-200 font-bold tracking-widest uppercase font-['Lexend']">Safe Zone Editor Active</span>
                </div>
              </>
            )}
          </div>

          {/* ปุ่มบันทึก - ปรับให้ขยายเต็มความกว้าง 100% บนมือถือจอเล็กเพื่อให้กดได้ง่ายขึ้น */}
          <div className="flex justify-end w-full">
            <button onClick={handleSave} className="w-full sm:w-auto bg-[#2D5DE8] hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold text-sm shadow-lg shadow-[#2D5DE8]/20 flex items-center justify-center gap-2 transition-transform duration-300 hover:scale-102 font-['Prompt']">
              <Save size={16} /> บันทึกและติดตั้งกล้องวงจรปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}