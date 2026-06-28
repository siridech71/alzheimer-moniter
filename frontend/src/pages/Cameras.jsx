import { useState, useEffect } from "react";
import { Plus, Camera, Settings, Video, Trash2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Cameras() {
  const navigate = useNavigate();
  const [cameras, setCameras] = useState([]);
  const [viewingCam, setViewingCam] = useState(null); // เพิ่ม State สำหรับเปิดหน้าต่างขยายวิดีโอสด
  const [tick, setTick] = useState(0);

  const loadCameras = () => {
    try {
      const localCams = localStorage.getItem("local_cameras");
      setCameras(localCams ? JSON.parse(localCams) : []);
    } catch (e) {
      console.error("ไม่สามารถโหลดข้อมูลกล้องได้", e);
    }
  };

  useEffect(() => {
    loadCameras();
    // สั่งรีเฟรชภาพนิ่งสดทุกๆ 4 วินาที
    const tInterval = setInterval(() => setTick(t => t + 1), 4000);
    return () => clearInterval(tInterval);
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("คุณต้องการลบกล้องตัวนี้ออกจากระบบใช่หรือไม่?")) {
      const updated = cameras.filter(cam => cam.id !== id);
      localStorage.setItem("local_cameras", JSON.stringify(updated));
      setCameras(updated);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      
      {/* Header ส่วนหัว */}
      <div className="flex justify-between items-end w-full">
        <div>
          <h1 className="font-['Lexend'] font-black text-3xl text-[#0F1B3D] tracking-tight">กล้องวงจรปิด</h1>
          <p className="font-['Sarabun'] text-slate-500 font-medium text-sm mt-1">จัดการและดูภาพสดจากกล้องทั้งหมดในระบบ</p>
        </div>
        <Link 
          to="/cameras/new" 
          className="bg-[#2D5DE8] text-white px-6 py-3.5 rounded-2xl font-bold font-['Prompt'] text-sm shadow-lg shadow-[#2D5DE8]/20 flex items-center gap-2 hover:scale-105 transition-transform duration-300"
        >
          <Plus size={18} /> เพิ่มกล้องระบบ
        </Link>
      </div>

      {/* รายการกล้อง */}
      {cameras.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-16 text-center space-y-4 shadow-sm w-full">
          <div className="w-16 h-16 bg-blue-50 text-[#2D5DE8] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Camera size={28} />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-['Prompt'] font-bold text-[#0F1B3D] text-base">ยังไม่มีกล้องวงจรปิด</h3>
            <p className="font-['Sarabun'] text-xs text-slate-400 font-medium leading-relaxed">
              กรุณากดปุ่ม <span className="text-[#2D5DE8] font-bold">"เพิ่มกล้องระบบ"</span> ด้านบน เพื่อเชื่อมต่อสัญญาณ
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {cameras.map((cam) => (
            <div key={cam.id} className="bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
              
              {/* แผงแสดงภาพวิดีโอสด: ผูกฟังก์ชัน onClick สำหรับขยายภาพเรียบร้อย */}
              <div 
                className="aspect-video bg-slate-900 relative flex items-center justify-center overflow-hidden cursor-pointer"
                onClick={() => setViewingCam(cam)} // 🛠️ กดตรงพื้นที่ภาพเพื่อเปิดดูสตรีมสด
              >
                <div className="absolute top-4 left-4 z-20 bg-[#0F1B3D]/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                  <span className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></span>
                  <span className="text-[9px] font-['Lexend'] font-black text-slate-200 tracking-wider">SYSTEM ONLINE</span>
                </div>
                
                {/* 🛠️ เปลี่ยนมาดึงเฟรมภาพจริงจาก Backend มาแสดงผลพรีวิว */}
                <img 
                  src={`http://localhost:8000/api/last-frame/${cam.id}?t=${tick}`} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt="Live Camera Overview"
                  onError={(e) => { 
                    // ถ้าภาพจากเซิร์ฟเวอร์หลักไม่ขึ้น ให้แสดงไอคอนจำลองไว้เหมือนเดิมไม่ให้พัง
                    e.target.style.display = 'none'; 
                  }} 
                />

                {/* เอฟเฟกต์โฮเวอร์เปิดดูภาพขยายใหญ่ */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F1B3D]/50 backdrop-blur-xs z-10">
                  <span className="bg-white text-[#0F1B3D] px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg text-xs transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 font-['Prompt']">
                    <Video size={14}/> เปิดสตรีมสดวิดีโอ
                  </span>
                </div>
              </div>

              {/* ข้อมูลใต้การ์ด */}
              <div className="p-5 flex justify-between items-center bg-white">
                <div>
                  <h3 className="font-['Prompt'] font-bold text-[#0F1B3D] text-sm">{cam.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">📍 Source: {cam.source}</p>
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => navigate(`/cameras/edit/${cam.id}`)} 
                    className="p-2.5 text-slate-400 hover:text-[#2D5DE8] hover:bg-blue-50 rounded-xl transition-all duration-300"
                  >
                    <Settings size={16}/>
                  </button>
                  <button 
                    onClick={() => handleDelete(cam.id)} 
                    className="p-2.5 text-slate-300 hover:text-[#FF8A5C] hover:bg-orange-50 rounded-xl transition-all duration-300"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* 🛠️ หน้าต่าง Modal ป๊อปอัปขยายวิดีโอสดแบบเรียลไทม์เมื่อคลิกเลือกกล้อง */}
      {viewingCam && (
        <div className="fixed inset-0 z-[100] bg-[#0F1B3D]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-[#FFFBF5]">
              <h3 className="font-['Lexend'] font-bold flex items-center gap-2 text-[#0F1B3D] text-sm uppercase tracking-wider">
                <span className="w-2 h-2 bg-[#FF8A5C] rounded-full animate-pulse"></span>
                {viewingCam.name} - สัญญาณวิเคราะห์วิดีโอเรียลไทม์
              </h3>
              <button onClick={() => setViewingCam(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"><X size={18}/></button>
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