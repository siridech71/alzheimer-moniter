import { useState, useEffect } from "react";
import { AlertCircle, Trash2, Filter, ChevronDown, ShieldCheck, BellRing } from "lucide-react";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    try {
      const localAlerts = localStorage.getItem("local_alerts");
      setAlerts(localAlerts ? JSON.parse(localAlerts) : []);
    } catch (e) { console.error(e); }
  }, []);

  const handleClearAll = () => {
    if (window.confirm("คุณต้องการล้างประวัติการแจ้งเตือนทั้งหมดใช่หรือไม่?")) {
      localStorage.setItem("local_alerts", "[]");
      setAlerts([]);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      
      {/* 🌟 Top Header Card: ดีไซน์ใหม่ให้กรอบโค้ดมนลอยเด่น */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-6 md:p-8 shadow-xs w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-[#FF8A5C] rounded-2xl flex items-center justify-center border border-orange-100/30 shrink-0">
            <BellRing size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="font-['Lexend'] text-2xl font-black text-[#0F1B3D] tracking-tight">การแจ้งเตือนและระบบบันทึก</h1>
            <p className="font-['Sarabun'] text-slate-400 font-semibold text-xs mt-0.5">รายการเหตุการณ์ความปลอดภัยย้อนหลังสำหรับวิเคราะห์พฤติกรรมเสี่ยง</p>
          </div>
        </div>
        
        <button 
          onClick={handleClearAll} 
          className="flex items-center justify-center gap-2 h-10 px-5 bg-red-50 text-red-500 hover:bg-red-100/70 active:scale-98 rounded-xl text-xs font-bold font-['Prompt'] transition-all self-start sm:self-center shrink-0 border border-red-100/30"
        >
          <Trash2 size={14} /> ล้างข้อมูลทั้งหมด
        </button>
      </div>

      {/* Filter Toolbar Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-[1.8rem] border border-slate-200/60 text-xs font-bold text-slate-600 shadow-xs w-full">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#FFFBF5] rounded-xl border border-slate-200/50 font-['Prompt'] text-slate-400">
            <Filter size={13}/> <span>คัดกรอง:</span>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200/60 hover:border-slate-300 rounded-xl font-['Prompt'] text-[#0F1B3D] transition-colors shadow-2xs">
            กล้องทั้งหมด <ChevronDown size={13} className="text-slate-400"/>
          </button>
        </div>
        
        <div className="font-['Prompt'] font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
          ตรวจพบระบบบันทึก <span className="text-[#2D5DE8] text-sm font-mono font-black ml-1">{alerts.length}</span> รายการ
        </div>
      </div>

      {/* 🌟 Content Area: อัปเกรดหน้าตาการแสดงผลให้ลื่นไหลสไตล์โมเดิร์น */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 overflow-hidden shadow-xs w-full">
        {alerts.length > 0 ? (
          <div className="divide-y divide-slate-100/70">
            {alerts.map((a) => (
              <div key={a.id} className="p-5 flex items-center justify-between group hover:bg-[#FFFBF5]/40 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-50 text-[#FF8A5C] rounded-2xl flex items-center justify-center border border-orange-100/50 shrink-0 shadow-2xs">
                    <AlertCircle size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                       <h4 className="font-['Prompt'] font-bold text-[#0F1B3D] text-base tracking-tight">ออกนอกพื้นที่ปลอดภัย</h4>
                       <span className="bg-orange-100 text-[#FF8A5C] px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider font-['Prompt']">ตรวจจับด้วย AI</span>
                    </div>
                    <p className="text-xs text-slate-400 font-semibold flex flex-wrap items-center gap-x-4 gap-y-1 font-['Sarabun']">
                      <span className="flex items-center gap-1">📷 ตำแหน่งกล้อง: <strong className="text-slate-600 font-['Prompt']">{a.location || "กล้องทดสอบ"}</strong></span>
                      <span className="flex items-center gap-1 text-[#2D5DE8]/80">🕒 บันทึกเวลา: <strong className="text-[#2D5DE8] font-mono font-bold">{a.time}</strong></span>
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    const updated = alerts.filter(exist => exist.id !== a.id);
                    localStorage.setItem("local_alerts", JSON.stringify(updated));
                    setAlerts(updated);
                  }} 
                  className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* 🛡️ Empty State Premium: ดีไซน์จุดว่างเปล่าให้ดูสบายตา อบอุ่น และเป็นระเบียบ */
          <div className="py-24 px-6 text-center space-y-4 w-full max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-100/40 text-[#2D5DE8] rounded-[2rem] flex items-center justify-center mx-auto shadow-sm relative">
              <ShieldCheck size={36} />
              <span className="absolute top-1 right-1 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-white animate-pulse"></span>
            </div>
            
            <div className="space-y-1.5">
              <p className="font-['Prompt'] font-bold text-[#0F1B3D] text-base tracking-tight">ระบบความปลอดภัยทำงานปกติ</p>
              <p className="font-['Sarabun'] text-xs text-slate-400 font-medium leading-relaxed">
                ขณะนี้ยังไม่มีการบันทึกเหตุการณ์ความเสี่ยง ปัญญาประดิษฐ์กำลังเฝ้าระวังและผู้ป่วยยังคงใช้ชีวิตอยู่ในเส้นพิกัดปลอดภัยครบล่วงร้อยเปอร์เซ็นต์
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}