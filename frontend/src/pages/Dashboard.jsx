import { useState, useEffect } from "react";
import { Camera, AlertTriangle, Video, X, AlertCircle, ShieldCheck, Plus, Settings, HeartHandshake } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [cameras, setCameras] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [viewingCam, setViewingCam] = useState(null);
  const [tick, setTick] = useState(0);

  const refreshData = () => {
    try {
      const localCams = localStorage.getItem("local_cameras");
      const localAlerts = localStorage.getItem("local_alerts");
      const list = localCams ? JSON.parse(localCams) : [];
      setCameras(list);
      setAlerts(localAlerts ? JSON.parse(localAlerts) : []);

      fetch("http://localhost:8000/api/sync-cameras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cameras: list })
      }).catch(() => console.log("Backend offline"));
    } catch (e) { console.error(e); }
  };

  const checkAlerts = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/get-latest-alerts");
      const data = await res.json();
      if (data && data.length > 0) {
        const localAlerts = localStorage.getItem("local_alerts") || "[]";
        let currentAlerts = JSON.parse(localAlerts);
        
        data.forEach(a => {
          if (!currentAlerts.some(exist => exist.id === a.id)) {
            currentAlerts.unshift(a);
          }
        });
        
        localStorage.setItem("local_alerts", JSON.stringify(currentAlerts));
        setAlerts(currentAlerts);
        
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        osc.type = "sine"; osc.frequency.value = 800;
        osc.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.15);
      }
    } catch (e) {}
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(checkAlerts, 2000);
    const tInterval = setInterval(() => setTick(t => t + 1), 4000);
    return () => { clearInterval(interval); clearInterval(tInterval); };
  }, []);

  return (
    <div className="w-full space-y-6 md:space-y-8 animate-in fade-in duration-500">
      
      {/* Header - ปรับให้ยืดหยุ่น ยุบปุ่มลงมาข้างล่างเมื่อเปิดบนมือถือจอแคบ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 w-full">
        <div>
          <h1 className="font-['Lexend'] font-black text-2xl md:text-3xl text-[#0F1B3D] tracking-tight">Dashboard</h1>
          <p className="font-['Sarabun'] text-slate-500 font-medium text-xs md:text-sm mt-1">ระบบเฝ้าระวังและบันทึกพฤติกรรมความปลอดภัยความอบอุ่นในบ้าน</p>
        </div>
        <Link to="/cameras/new" className="w-full sm:w-auto bg-[#2D5DE8] text-white px-6 py-3.5 rounded-2xl font-bold font-['Prompt'] text-sm shadow-lg shadow-[#2D5DE8]/20 flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300">
          <Plus size={18} /> เพิ่มกล้องวงจรปิด
        </Link>
      </div>

      {/* สถิติ 2 ใบ - บนมือถือเป็น 1 คอลัมน์ (grid-cols-1) บนคอมเป็น 2 คอลัมน์ (md:grid-cols-2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 w-full">
        <div className="bg-white border border-slate-200/60 p-5 md:p-6 rounded-[2rem] flex items-center gap-4 shadow-sm">
          <div className="bg-blue-50 p-3.5 rounded-2xl text-[#2D5DE8]"><Camera size={22} /></div>
          <div>
            <p className="font-['Prompt'] text-[11px] font-bold text-slate-400 uppercase tracking-wider">ติดตั้งกล้องทั้งหมด</p>
            <p className="font-['Lexend'] text-xl md:text-2xl font-black text-[#0F1B3D]">{cameras.length} <span className="font-['Prompt'] text-xs font-bold text-slate-400">ตัว</span></p>
          </div>
        </div>
        <div className="bg-white border border-slate-200/60 p-5 md:p-6 rounded-[2rem] flex items-center gap-4 shadow-sm">
          <div className="bg-orange-50 p-3.5 rounded-2xl text-[#FF8A5C]"><AlertTriangle size={22} /></div>
          <div>
            <p className="font-['Prompt'] text-[11px] font-bold text-slate-400 uppercase tracking-wider">การเดินออกนอกเขตวันนี้</p>
            <p className="font-['Lexend'] text-xl md:text-2xl font-black text-[#0F1B3D]">{alerts.length} <span className="font-['Prompt'] text-xs font-bold text-slate-400">ครั้ง</span></p>
          </div>
        </div>
      </div>

      {/* Main Grid Content - แบ่งคอลัมน์แบบยืดหยุ่นตามขนาดหน้าจอ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:grid-cols-1 w-full">
        
        {/* คอลัมน์สตรีมกล้องด้านซ้าย */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-['Lexend'] text-md font-bold text-[#0F1B3D] flex items-center gap-2">
            <Video size={18} className="text-[#2D5DE8]" /> เฝ้าระวังตรวจจับสด
          </h2>
          
          {cameras.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-10 md:p-16 text-center space-y-4 shadow-sm w-full">
              <div className="w-16 h-16 bg-orange-50 text-[#FF8A5C] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <HeartHandshake size={32} />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="font-['Prompt'] font-bold text-[#0F1B3D] text-base">เริ่มต้นดูแลคนที่คุณรัก</h3>
                <p className="font-['Sarabun'] text-xs text-slate-400 font-medium leading-relaxed">
                  ขณะนี้ยังไม่มีการเปิดสตรีมกล้องในระบบ กรุณากดปุ่ม <span className="text-[#2D5DE8] font-bold">"เพิ่มกล้องระบบ"</span> เพื่อกำหนดเส้นพิกัดพื้นที่ปลอดภัยสำหรับการวิเคราะห์พฤติกรรมเสี่ยง
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5 w-full">
              {cameras.map(cam => (
                <div key={cam.id} className="bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group relative">
                  <div className="absolute top-4 left-4 z-20 bg-[#0F1B3D]/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                    <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-['Lexend'] font-black text-slate-200 tracking-wider">RADAR ACTIVE</span>
                  </div>
                  <div className="aspect-video bg-slate-900 relative flex items-center justify-center cursor-pointer overflow-hidden" onClick={() => setViewingCam(cam)}>
                    <img 
                      src={`http://localhost:8000/api/last-frame/${cam.id}?t=${tick}`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      alt="camera stream overview"
                      onError={(e) => { e.target.style.display = 'none'; }} 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F1B3D]/50 backdrop-blur-xs z-10">
                      <span className="bg-white text-[#0F1B3D] px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg text-xs transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 font-['Prompt']">
                        <Video size={14}/> ขยายภาพนิ่งสด
                      </span>
                    </div>
                  </div>
                  <div className="p-4 md:p-5 flex justify-between items-center bg-white relative z-20">
                    <div>
                      <h3 className="font-['Prompt'] font-bold text-[#0F1B3D] text-sm">{cam.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">📍 {cam.source}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/cameras/edit/${cam.id}`); }} className="p-2 text-slate-400 hover:text-[#2D5DE8] hover:bg-blue-50 rounded-xl transition-all duration-300">
                      <Settings size={18}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* คอลัมน์ประวัติการแจ้งเตือนด้านขวา (จะลงไปอยู่ข้างล่างเมื่อเปิดบนมือถือ) */}
        <div className="space-y-4 w-full">
          <h2 className="font-['Lexend'] text-md font-bold text-[#0F1B3D] flex items-center gap-2">
            <AlertTriangle size={18} className="text-[#FF8A5C]"/> แจ้งเตือนล่าสุดวันนี้
          </h2>
          <div className="bg-white rounded-[2rem] border border-slate-200/60 divide-y divide-slate-100 overflow-hidden shadow-sm w-full">
            {alerts.length > 0 ? alerts.map(a => (
              <div key={a.id} className="p-4 flex items-center justify-between group hover:bg-slate-50/80 transition-colors duration-300">
                <div className="flex gap-3">
                  <div className="text-[#FF8A5C] bg-orange-50 p-2.5 rounded-xl h-fit border border-orange-100/50"><AlertCircle size={18}/></div>
                  <div>
                    <p className="text-xs font-bold text-[#0F1B3D] font-['Prompt']">ออกนอกพื้นที่ปลอดภัย</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 font-['Sarabun']">📷 {a.location} · <span className="text-[#2D5DE8] font-mono font-bold">{a.time}</span></p>
                  </div>
                </div>
                <button onClick={() => { 
                  const updated = alerts.filter(exist => exist.id !== a.id);
                  localStorage.setItem("local_alerts", JSON.stringify(updated));
                  setAlerts(updated);
                }} className="p-2 text-slate-300 hover:text-[#FF8A5C] rounded-lg transition-all"><X size={14}/></button>
              </div>
            )) : (
              <div className="p-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest py-16 w-full font-['Prompt']">
                <ShieldCheck size={36} className="mx-auto mb-2 text-[#22C55E] opacity-70"/>
                พื้นที่ปลอดภัย 100%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal หน้าต่างขยายภาพวิดีโอแบบลอยเต็มจอสำหรับมือถือ */}
      {viewingCam && (
        <div className="fixed inset-0 z-[100] bg-[#0F1B3D]/80 backdrop-blur-sm flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-[#FFFBF5]">
              <h3 className="font-['Lexend'] font-bold flex items-center gap-2 text-[#0F1B3D] text-xs md:text-sm uppercase tracking-wider">
                <span className="w-2 h-2 bg-[#FF8A5C] rounded-full animate-pulse"></span>
                {viewingCam.name} - สัญญาณภาพสด
              </h3>
              <button onClick={() => setViewingCam(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><X size={16}/></button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <img src={`http://localhost:8000/api/video-feed/${viewingCam.id}`} className="w-full h-full object-contain" alt="realtime monitor feed" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}