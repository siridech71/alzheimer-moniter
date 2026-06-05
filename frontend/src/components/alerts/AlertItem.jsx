import { AlertCircle, Clock } from "lucide-react";

export default function AlertItem({ alert }) {
  // สร้างข้อมูลจำลองกรณีที่ไม่มีข้อมูลส่งมา เพื่อให้ UI คงความสวยงามไว้
  const data = alert || {
    location: "ไม่ระบุตำแหน่ง",
    time: "เพิ่งเกิดขึ้น",
    duration: "0s",
    status: "รับทราบ"
  };

  return (
    <div className="p-4 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
      <div className="flex items-start gap-4">
         <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <AlertCircle size={20}/>
         </div>
         <div>
           <div className="flex items-center gap-2">
             <span className="font-bold text-slate-800">ออกนอกพื้นที่</span>
             <span className="bg-yellow-100 text-yellow-700 px-3 py-0.5 rounded-full text-[10px] font-bold">
               {data.status}
             </span>
           </div>
           <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
             <span className="flex items-center gap-1">📷 {data.location}</span>
             <span className="flex items-center gap-1"><Clock size={12}/> {data.time}</span>
             <span className="text-slate-600">{data.duration} นอกพื้นที่</span>
           </p>
         </div>
      </div>
    </div>
  );
}