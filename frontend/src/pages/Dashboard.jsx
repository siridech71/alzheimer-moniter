import { useState, useEffect } from "react";
import { Camera, Activity, AlertTriangle, Users, Plus, Video, X, Settings, AlertCircle, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { localStore } from "../api/localStore";

export default function Dashboard() {
  const navigate = useNavigate();
  const [cameras, setCameras] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [viewingCam, setViewingCam] = useState(null);
  const [thumbTick, setThumbTick] = useState(0);

useEffect(() => {
  // สั่งให้ภาพนิ่งหน้านอกเปลี่ยนทุกๆ 5 วินาที (นิ่งแต่เปลี่ยนเฟรม)
  const t = setInterval(() => setThumbTick(prev => prev + 1), 5000);
  return () => clearInterval(t);
}, []);

 const refreshData = async () => {
    const list = localStore.cameras.list();
    setCameras(list);
    setAlerts(localStore.alerts.list());
    
    // ส่งข้อมูลกล้องทั้งหมดที่มีในเครื่องไปให้ Python
    try {
      await fetch("http://localhost:8000/api/sync-cameras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cameras: list })
      });
    } catch (e) {
      console.log("Backend offline");
    }
  };

  // ดึงแจ้งเตือนแบบ Real-time
  const checkAlerts = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/get-latest-alerts");
      const data = await res.json();
      if (data.length > 0) {
        data.forEach(a => localStore.alerts.add(a));
        setAlerts(localStore.alerts.list());
        new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3").play().catch(e => {});
      }
    } catch (e) { console.log("Backend offline"); }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(checkAlerts, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 p-2 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Dashboard</h1>
          <p className="text-slate-500 font-medium">ภาพรวมระบบและการเฝ้าระวัง</p>
        </div>
        <Link to="/cameras/new" className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
          <Plus size={20} /> เพิ่มกล้อง
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><Camera size={20} className="text-blue-600"/> เฝ้าระวังสด</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cameras.map(cam => (
              <div key={cam.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm group">
                <div className="aspect-video bg-slate-900 relative flex items-center justify-center cursor-pointer" onClick={() => setViewingCam(cam)}>
                  <img 
                    src={`http://localhost:8000/api/last-frame/${cam.id}?t=${thumbTick}`} 
                    className="w-full h-full object-cover" 
                    alt="camera thumbnail"
                    onError={(e) => { e.target.style.display = 'none'; }} 
                    />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <span className="bg-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Video size={16}/> ดูภาพสด</span>
                  </div>
                </div>
                <div className="p-5 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800">{cam.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">📍 {cam.source}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/cameras/edit/${cam.id}`); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Settings size={20}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><AlertTriangle size={20} className="text-red-500"/> แจ้งเตือนล่าสุด</h2>
          <div className="bg-white rounded-3xl border divide-y overflow-hidden shadow-sm">
            {alerts.length > 0 ? alerts.map(a => (
              <div key={a.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                <div className="flex gap-3">
                  <div className="text-red-500 bg-red-50 p-2 rounded-full h-fit"><AlertCircle size={20}/></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">ออกนอกพื้นที่ปลอดภัย</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{a.time}</p>
                  </div>
                </div>
                <button onClick={() => { localStore.alerts.remove(a.id); setAlerts(localStore.alerts.list()); }} className="p-2 text-slate-300 hover:text-red-500 transition-all">
                  <X size={18}/>
                </button>
              </div>
            )) : (
              <div className="p-16 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                <ShieldCheck size={40} className="mx-auto mb-3 opacity-20"/>
                System Clear
              </div>
            )}
          </div>
        </div>
      </div>

      {viewingCam && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold flex items-center gap-2 text-slate-800 uppercase tracking-tighter">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
                {viewingCam.name} - LIVE MONITORING
              </h3>
              <button onClick={() => setViewingCam(null)} className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition-colors"><X size={24}/></button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <img 
                src={`http://localhost:8000/api/video-feed/${viewingCam.id}`} 
                className="w-full h-full object-contain" 
                alt="live feed"
                />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}