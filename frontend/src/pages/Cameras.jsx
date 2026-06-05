import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { localStore } from "../api/localStore";
import { Camera, Plus, Search, Settings, Trash2, Video, X } from "lucide-react";

export default function Cameras() {
  const navigate = useNavigate();
  const [cameras, setCameras] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingCam, setViewingCam] = useState(null);
  const [tick, setTick] = useState(0);

  const refreshData = async (listData) => {
    const list = listData || localStore.cameras.list();
    setCameras(list);
    try {
      await fetch("http://localhost:8000/api/sync-cameras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cameras: list })
      });
    } catch (e) {}
  };

  useEffect(() => {
    refreshData();
    const t = setInterval(() => setTick(prev => prev + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("ลบกล้องนี้ใช่หรือไม่? ระบบจะหยุดการตรวจจับทันที")) {
      localStore.cameras.remove(id);
      const newList = localStore.cameras.list();
      setCameras(newList);
      await refreshData(newList); // ส่งลิสต์ใหม่ไปให้ Backend ทันทีเพื่อหยุด Engine ตัวที่ถูกลบ
    }
  };

  const filteredCameras = cameras.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 p-4 animate-in fade-in">
      <div className="flex justify-between items-end">
        <div><h1 className="text-3xl font-black text-slate-900">กล้องวงจรปิด</h1><p className="text-slate-500 font-medium">จัดการและดูภาพสดจากกล้องทั้งหมด</p></div>
        <Link to="/cameras/new" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Plus size={20} /> เพิ่มกล้อง</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCameras.map((cam) => (
          <div key={cam.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm group">
            <div className="aspect-video bg-slate-900 relative flex items-center justify-center cursor-pointer" onClick={() => setViewingCam(cam)}>
              <img src={`http://localhost:8000/api/last-frame/${cam.id}?t=${tick}`} className="w-full h-full object-cover" alt="feed" onError={(e) => e.target.style.display = 'none'} />
              <Camera size={40} className="absolute text-white opacity-10" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <span className="bg-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Video size={16}/> ดูภาพสด</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div><h3 className="font-bold text-slate-900 text-lg uppercase">{cam.name}</h3><p className="text-xs text-slate-400 font-mono">📍 {cam.source}</p></div>
                <div className="flex gap-1">
                  <button onClick={() => navigate(`/cameras/edit/${cam.id}`)} className="p-2 text-slate-400 hover:text-blue-600 transition-all"><Settings size={20}/></button>
                  <button onClick={() => handleDelete(cam.id)} className="p-2 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={20}/></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {viewingCam && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold flex items-center gap-2 uppercase tracking-tighter"><span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>{viewingCam.name} - LIVE FEED</h3>
              <button onClick={() => setViewingCam(null)} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition-colors"><X size={24}/></button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <img src={`http://localhost:8000/api/video-feed/${viewingCam.id}`} className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}