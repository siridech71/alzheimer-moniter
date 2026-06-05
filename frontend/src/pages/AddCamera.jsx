import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { localStore } from "../api/localStore";
import { ArrowLeft, RefreshCw, CheckCircle2, Eraser, Mail, Activity, Camera, Save } from "lucide-react";

export default function AddCamera() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", source: "0", email_to: "" });
  const [imgSrc, setImgSrc] = useState(null);
  const [points, setPoints] = useState([]);
  const [mousePos, setMousePos] = useState(null);
  const [isClosed, setIsClosed] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (id) {
      const data = localStore.cameras.get(id);
      if (data) { 
        setForm({ name: data.name, source: data.source, email_to: data.email_to || "" }); 
        setPoints(data.safe_zone || []); 
        setIsClosed(true); 
      }
    }
  }, [id]);

  const loadPreview = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/get-thumbnail?source=${form.source}`);
      if (res.ok) {
        const blob = await res.blob();
        setImgSrc(URL.createObjectURL(blob));
        if(!id) { setPoints([]); setIsClosed(false); }
      }
    } catch (e) { alert("Backend Port 8000 Offline"); }
  };

  const getCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return [
      Math.round((e.clientX - rect.left) * (1280 / rect.width)),
      Math.round((e.clientY - rect.top) * (720 / rect.height))
    ];
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgSrc) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 1280, 720);
    ctx.strokeStyle = "#00ff00"; ctx.lineWidth = 5; ctx.lineJoin = "round";
    if (points.length > 0) {
      ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
      points.forEach(p => ctx.lineTo(p[0], p[1]));
      if (!isClosed && mousePos) ctx.lineTo(mousePos[0], mousePos[1]);
      if (isClosed) { ctx.closePath(); ctx.fillStyle = "rgba(0, 255, 0, 0.2)"; ctx.fill(); }
      ctx.stroke();
      points.forEach(p => { 
        ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, Math.PI*2); ctx.fillStyle="#fff"; ctx.fill(); ctx.stroke(); 
      });
    }
  }, [points, mousePos, isClosed, imgSrc]);

  const handleSave = () => {
    if (points.length < 3 || !isClosed) return alert("กรุณาวาดพื้นที่ให้เสร็จ (อย่างน้อย 3 จุด) และกดปิดรูปทรง");
    localStore.cameras.save({ ...form, id: id || Date.now().toString(), safe_zone: points });
    navigate("/");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <div className="flex gap-4 items-center">
        <button onClick={() => navigate(-1)} className="p-2 bg-white border rounded-full hover:bg-slate-50 transition-all"><ArrowLeft size={20}/></button>
        <h1 className="text-2xl font-black text-slate-900">{id ? "แก้ไขการตั้งค่ากล้อง" : "เพิ่มกล้องและตั้งเขตปลอดภัย"}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border space-y-6 shadow-sm h-fit">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">ชื่อกล้อง</label>
            <input className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-bold" placeholder="เช่น ห้องนั่งเล่น" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">แหล่งวิดีโอ (0/a.mp4)</label>
            <input className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none font-mono text-sm" placeholder="0" value={form.source} onChange={e => setForm({...form, source: e.target.value})} />
          </div>
          
          {/* ช่อง Email กลับมาแล้วครับ */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Email แจ้งเตือน</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-slate-300" size={18}/>
              <input className="w-full p-4 pl-12 bg-slate-50 border-none rounded-2xl outline-none text-sm" placeholder="caregiver@email.com" value={form.email_to} onChange={e => setForm({...form, email_to: e.target.value})} />
            </div>
          </div>

          <button onClick={loadPreview} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold flex justify-center gap-2 hover:bg-black transition-all"><RefreshCw size={18}/> โหลดภาพวิดีโอ</button>
          
          <div className="flex gap-2">
            <button onClick={() => setIsClosed(true)} disabled={points.length < 3 || isClosed} className="flex-1 bg-green-500 text-white p-4 rounded-2xl font-bold disabled:opacity-50 hover:bg-green-600 transition-all">ปิดรูปทรง</button>
            <button onClick={() => { setPoints([]); setIsClosed(false); }} className="p-4 bg-red-50 text-red-500 rounded-2xl font-bold hover:bg-red-100 transition-all"><Eraser size={20}/></button>
          </div>
          
          <button onClick={handleSave} className="w-full bg-blue-600 text-white p-5 rounded-[2rem] font-black text-xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
            <Save size={20} className="inline mr-2" /> บันทึกการตั้งค่า
          </button>
        </div>

        <div className="lg:col-span-2 relative bg-slate-900 rounded-[3rem] overflow-hidden aspect-video shadow-2xl border-4 border-white cursor-crosshair">
          {imgSrc ? (
            <>
              <img src={imgSrc} className="w-full h-full object-cover select-none pointer-events-none" draggable="false" />
              <canvas 
                ref={canvasRef} width={1280} height={720} 
                onClick={(e) => !isClosed && setPoints([...points, getCoords(e)])}
                onMouseMove={(e) => !isClosed && setMousePos(getCoords(e))}
                className="absolute inset-0 w-full h-full z-10 touch-none" 
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 uppercase font-bold text-xs tracking-widest">
              <Camera size={48} className="opacity-10"/> <p>กรุณากดปุ่ม โหลดภาพวิดีโอ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}