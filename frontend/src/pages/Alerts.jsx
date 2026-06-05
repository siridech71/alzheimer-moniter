import { useState, useEffect } from "react";
import { localStore } from "../api/localStore";
import { AlertCircle, Trash2, Bell, Filter, ChevronDown, CheckCircle } from "lucide-react";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    setAlerts(localStore.alerts.list());
  }, []);

  const deleteAlert = (id) => {
    localStore.alerts.remove(id);
    setAlerts(localStore.alerts.list());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-900">การแจ้งเตือน</h1>
          <p className="text-slate-500 text-sm mt-1">รายการเหตุการณ์ความปลอดภัยย้อนหลัง</p>
        </div>
        <button onClick={() => { localStorage.setItem("local_alerts", "[]"); setAlerts([]); }} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">ล้างทั้งหมด</button>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border">
          <Filter size={14}/> <span>กรองโดย:</span>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-1.5 bg-white border rounded-lg">ทั้งหมด <ChevronDown size={14}/></button>
        <button className="flex items-center gap-1.5 px-4 py-1.5 bg-white border rounded-lg">ทุกประเภท <ChevronDown size={14}/></button>
        <span className="ml-auto text-slate-300 font-medium px-2">{alerts.length} รายการ</span>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm shadow-slate-100">
        {alerts.length > 0 ? (
          <div className="divide-y border-slate-50">
            {alerts.map((a) => (
              <div key={a.id} className="p-5 flex items-center justify-between group hover:bg-slate-50 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center border border-red-100">
                    <AlertCircle size={24} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <h4 className="font-bold text-slate-900 text-lg tracking-tight">ออกนอกพื้นที่ปลอดภัย</h4>
                       <span className="bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">รับทราบ</span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-3">
                      <span className="flex items-center gap-1">📷 {a.location || "กล้องหลัก"}</span>
                      <span className="flex items-center gap-1 font-bold text-blue-500">🕒 {a.time}</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => deleteAlert(a.id)} 
                  className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-24 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 text-slate-100 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-slate-200">
              <Bell size={40} />
            </div>
            <div className="space-y-1">
              <p className="font-black text-slate-900 uppercase text-lg tracking-tighter">ไม่มีรายการแจ้งเตือน</p>
              <p className="text-sm text-slate-400 font-medium">ระบบกำลังเฝ้าระวังและทุกอย่างยังปกติดี</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}