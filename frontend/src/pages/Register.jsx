import { useState } from "react";
import { ShieldCheck, User, Mail, Lock, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return alert("กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง");
    }
    
    // จำลองการบันทึก (ในระบบจริงจะส่งไป API)
    alert("สร้างบัญชีสำเร็จ! กรุณาเข้าสู่ระบบ");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/10 overflow-hidden border border-slate-100">
        
        {/* ส่วน Header */}
        <div className="bg-slate-900 px-8 py-12 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-4 left-4 w-20 h-20 border-4 border-white rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-4 border-white rounded-full"></div>
          </div>
          
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-5 backdrop-blur-sm border border-white/20 shadow-inner">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Register</h1>
          <p className="text-slate-400 font-medium mt-2">สร้างบัญชีผู้ใช้งานระบบเฝ้าระวัง</p>
        </div>

        {/* ส่วนฟอร์ม */}
        <div className="p-8 pb-10 space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="relative group">
              <User className="absolute left-4 top-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="ชื่อผู้ใช้งาน" 
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-700"
                required 
                onChange={e => setForm({...form, name: e.target.value})} 
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} />
              <input 
                type="email" 
                placeholder="อีเมล (Email)" 
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-700"
                required 
                onChange={e => setForm({...form, email: e.target.value})} 
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={20} />
              <input 
                type="password" 
                placeholder="รหัสผ่าน (Password)" 
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all font-bold text-slate-700"
                required 
                onChange={e => setForm({...form, password: e.target.value})} 
              />
            </div>

            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-slate-900/30 hover:bg-black hover:-translate-y-0.5 transition-all mt-2 active:scale-95 flex items-center justify-center gap-2">
              ยืนยันการสมัคร <ArrowRight size={20} />
            </button>
          </form>
          
          <div className="text-center pt-2">
            <p className="text-slate-500 text-sm font-medium">
              มีบัญชีผู้ใช้งานอยู่แล้ว? <Link to="/login" className="text-slate-900 font-bold hover:underline">เข้าสู่ระบบ</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}