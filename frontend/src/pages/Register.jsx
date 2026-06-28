import { useState } from "react";
import { ShieldCheck, User, Mail, Lock, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:8000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      alert("สร้างบัญชีลงฐานข้อมูลสำเร็จ!");
      navigate("/login");
    } else {
      // 🛠️ [แก้ไขสำเร็จ] ป้องกันกรณีสมัครสมาชิกซ้ำแล้วขึ้น undefined
      alert(data.detail || data.message || "ไม่สามารถสมัครสมาชิกได้");
    }
  } catch (err) {
    alert("ไม่สามารถติดต่อเซิร์ฟเวอร์เพื่อบันทึกข้อมูลได้");
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFBF5] p-4 font-['Inter']">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-md border border-slate-200/60 overflow-hidden">
        
        {/* Header - สีกรมท่าอุ่นธีมเดียวกัน */}
        <div className="bg-[#0F1B3D] px-8 py-12 text-center text-white relative">
          <div className="mx-auto w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10 text-[#FF8A5C]">
            <ShieldCheck size={30} />
          </div>
          <h1 className="text-2xl font-black tracking-tight uppercase font-['Lexend']">Register</h1>
          <p className="text-slate-400 font-medium text-xs mt-1.5 font-['Sarabun']">สร้างบัญชีผู้ใช้งานระบบเฝ้าระวังผู้สูงอายุ</p>
        </div>

        {/* Form Body */}
        <div className="p-8 pb-10 space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="relative group">
              <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#2D5DE8] transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="ชื่อผู้ใช้งาน-นามสกุล" 
                className="w-full h-12 pl-12 pr-6 py-3 bg-[#FFFBF5] border border-slate-200/50 rounded-xl outline-none focus:bg-white focus:border-[#2D5DE8] focus:ring-4 focus:ring-[#2D5DE8]/5 transition-all font-semibold text-slate-700 text-sm font-['Prompt']"
                required 
                onChange={e => setForm({...form, name: e.target.value})} 
              />
            </div>

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

            {/* 🎯 ขนาดปุ่มสูง 48px และกว้างเต็มเท่ากันกับหน้า Login เป๊ะ ๆ */}
            <button type="submit" className="w-full h-[48px] bg-[#2D5DE8] text-white rounded-xl font-bold text-sm shadow-md shadow-[#2D5DE8]/20 hover:bg-blue-700 transition-all mt-6 flex items-center justify-center gap-2 font-['Prompt'] active:scale-98">
              ยืนยันการสมัครสมาชิก <ArrowRight size={16} />
            </button>
          </form>
          
          <div className="text-center pt-1">
            <p className="text-slate-400 text-xs font-medium font-['Prompt']">
              มีบัญชีผู้ใช้งานอยู่แล้ว? <Link to="/login" className="text-[#2D5DE8] font-bold hover:underline ml-1">เข้าสู่ระบบที่นี่</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}