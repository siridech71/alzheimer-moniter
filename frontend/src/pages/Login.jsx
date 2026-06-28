import { useState } from "react";
import { ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      localStorage.setItem("user_display_name", data.name);
      localStorage.setItem("is_logged_in", "true");
      alert(`ยินดีต้อนรับคุณ ${data.name}`);
      window.location.href = "/";
    } else {
      // 🛠️ [แก้ไขสำเร็จ] ดักจับทั้ง data.detail (ของ FastAPI) หรือ data.message ป้องกัน undefined
      alert(data.detail || data.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
  } catch (err) {
    alert("ระบบหลังบ้านออฟไลน์ ไม่สามารถเชื่อมต่อฐานข้อมูลได้");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5] p-4 font-['Inter']">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-md border border-slate-200/60 overflow-hidden">
        
        {/* Header - สีกรมท่าอุ่น */}
        <div className="bg-[#0F1B3D] px-8 py-12 text-center text-white relative">
          <div className="mx-auto w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10 text-[#FF8A5C]">
            <ShieldCheck size={30} />
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase font-['Lexend']">Login</h1>
          <p className="text-slate-400 font-medium text-xs mt-1.5 font-['Sarabun']">ลงชื่อเข้าใช้งานระบบเฝ้าระวังผู้สูงอายุ</p>
        </div>

        {/* Form Body */}
        <div className="p-8 pb-10 space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#2D5DE8] transition-colors" size={18} />
              <input 
                type="email" 
                placeholder="อีเมล (Email)" 
                className="w-full h-12 pl-12 pr-6 py-3 bg-[#FFFBF5] border border-slate-200/50 rounded-xl outline-none focus:bg-white focus:border-[#2D5DE8] focus:ring-4 focus:ring-[#2D5DE8]/5 transition-all font-semibold text-slate-700 text-sm"
                required 
                onChange={e => setForm({...form, email: e.target.value})} 
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#2D5DE8] transition-colors" size={18} />
              <input 
                type="password" 
                placeholder="รหัสผ่าน (Password)" 
                className="w-full h-12 pl-12 pr-6 py-3 bg-[#FFFBF5] border border-slate-200/50 rounded-xl outline-none focus:bg-white focus:border-[#2D5DE8] focus:ring-4 focus:ring-[#2D5DE8]/5 transition-all font-semibold text-slate-700 text-sm"
                required 
                onChange={e => setForm({...form, password: e.target.value})} 
              />
            </div>

            <div className="flex justify-end -mt-1">
              <button type="button" className="text-[12px] text-[#2D5DE8] font-bold hover:underline font-['Prompt']">ลืมรหัสผ่าน?</button>
            </div>

            {/* 🎯 ขนาดปุ่มสูง 48px มาตรฐานเท่ากันเป๊ะ */}
            <button type="submit" className="w-full h-[48px] bg-[#2D5DE8] text-white rounded-xl font-bold text-sm shadow-md shadow-[#2D5DE8]/20 hover:bg-blue-700 transition-all mt-4 flex items-center justify-center gap-2 font-['Prompt'] active:scale-98">
              เข้าสู่ระบบตรวจสอบ <ArrowRight size={16} />
            </button>
          </form>
          
          <div className="text-center pt-1">
            <p className="text-slate-400 text-xs font-medium font-['Prompt']">
              ยังไม่มีบัญชีผู้ใช้งาน? <Link to="/register" className="text-[#2D5DE8] font-bold hover:underline ml-1">สมัครสมาชิกใหม่ที่นี่</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}