import { Camera, Settings, Trash2, Video } from "lucide-react";
import { localStore } from "../../api/localStore";

export default function CameraCard({ camera, onLiveView, onDelete }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col group relative">
      {/* ส่วนบน (วิดีโอ/สถานะ) */}
      <div className="aspect-video bg-[#1e2330] relative flex items-center justify-center group-hover:bg-[#161a24] transition-colors cursor-pointer" onClick={() => onLiveView(camera)}>
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span> STANDBY
        </div>
        
        {/* ปุ่มจัดการโผล่ตอน Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
           <button className="bg-white text-slate-800 px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2">
             <Video size={16}/> ดูภาพสด
           </button>
        </div>
        
        <div className="text-center text-slate-500 group-hover:opacity-0 transition-opacity">
          <Camera size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">{camera.name}</p>
        </div>
      </div>

      {/* ส่วนล่าง (ข้อมูล) */}
      <div className="p-4 flex justify-between items-start">
        <div>
          <h3 className="font-bold text-slate-800">{camera.name}</h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            📍 {camera.source}
          </p>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            📧 {camera.email_to || "ไม่ได้ตั้งค่าอีเมล"}
          </p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onDelete(camera.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={16} />
          </button>
          <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}