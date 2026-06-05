import { useState } from "react";
import { ShieldCheck } from "lucide-react";

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login");
  
  // State สำหรับเก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔐 ระบบเข้าสู่ระบบ (Login)
  const handleLogin = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    // 1. ดึงข้อมูลบัญชีทั้งหมดที่เคยสมัครไว้ในเครื่องมาตรวจสอบ
    const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
    
    // 2. ค้นหาผู้ใช้ที่มีอีเมลตรงกับที่กรอกเข้ามา
    const userMatch = registeredUsers.find(
      (user) => user.email.toLowerCase() === formData.email.toLowerCase()
    );

    // 3. ตรวจสอบเงื่อนไขอีเมลและรหัสผ่าน
    if (!userMatch) {
      alert("ไม่พบบัญชีผู้ใช้งานนี้ในระบบ กรุณาสมัครสมาชิก");
      return;
    }

    if (userMatch.password !== formData.password) {
      alert("รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      return;
    }

    // 4. ถ้าผ่านเงื่อนไข ให้บันทึก Session และพาเข้าหน้าหลัก
    localStorage.setItem("user_display_name", userMatch.name || formData.email.split("@")[0]);
    localStorage.setItem("is_logged_in", "true");
    
    alert(`ยินดีต้อนรับคุณ ${userMatch.name}`);
    window.location.href = "/";
  };

  // 📝 ระบบสมัครสมาชิก (Register)
  const handleRegister = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      alert("กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    // 1. ดึงรายชื่อบัญชีเดิมที่มีอยู่แล้วออกมาก่อน
    const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");

    // 2. ตรวจสอบว่าอีเมลนี้เคยถูกสมัครไปแล้วหรือยัง
    const isEmailExist = registeredUsers.some(
      (user) => user.email.toLowerCase() === formData.email.toLowerCase()
    );

    if (isEmailExist) {
      alert("อีเมลนี้ถูกใช้งานในระบบแล้ว กรุณาใช้ไฟล์อีเมลอื่นหรือเข้าสู่ระบบ");
      return;
    }

    // 3. บันทึกบัญชีใหม่เพิ่มเข้าไปในอาร์เรย์เดิม
    const newUser = {
      name: formData.name,
      email: formData.email,
      password: formData.password
    };
    registeredUsers.push(newUser);

    // 4. เซฟกลับลงไปใน localStorage ของเครื่อง
    localStorage.setItem("registered_users", JSON.stringify(registeredUsers));
    
    alert("สร้างบัญชีผู้ใช้งานสำเร็จ! ระบบจะพาท่านไปยังหน้าเข้าสู่ระบบ");
    
    // 5. เคลียร์ค่ารหัสผ่านในฟอร์มและสลับหน้ากลับไปแท็บ Login
    setFormData({ ...formData, password: "", confirmPassword: "" });
    setActiveTab("login");
  };

  const labels = {
    login: ["ยินดีต้อนรับกลับ", "Alzheimer Guard AI — ระบบเฝ้าระวังอัจฉริยะ"],
    register: ["สร้างบัญชีใหม่", "เพิ่มผู้ดูแลระบบสำหรับ Guard AI"]
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-6 font-sans">
      <div className="bg-white border border-[#E5E7EB] rounded-[20px] w-full max-w-[420px] p-[32px] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-[22px]">
          <div className="w-12 h-12 bg-[#2563EB] rounded-[14px] flex items-center justify-center shrink-0">
            <ShieldCheck className="text-white" size={26} />
          </div>
          <div>
            <div className="text-[22px] font-semibold text-[#111827] tracking-tight">
              {labels[activeTab][0]}
            </div>
            <div className="text-[13px] text-[#9CA3AF] mt-[3px] font-normal">
              {labels[activeTab][1]}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#F3F4F6] rounded-[12px] p-1 mb-[22px]">
          <button 
            type="button"
            className={`flex-1 py-2.5 text-[14px] font-medium rounded-[9px] transition-all ${activeTab === 'login' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#6B7280]'}`}
            onClick={() => setActiveTab("login")}
          >
            เข้าสู่ระบบ
          </button>
          <button 
            type="button"
            className={`flex-1 py-2.5 text-[14px] font-medium rounded-[9px] transition-all ${activeTab === 'register' ? 'bg-white text-[#2563EB] shadow-sm' : 'text-[#6B7280]'}`}
            onClick={() => setActiveTab("register")}
          >
            สมัครสมาชิก
          </button>
        </div>

        {/* Login Panel */}
        {activeTab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-[7px]">
              <label className="block text-[13px] font-medium text-[#374151]">อีเมล</label>
              <input 
                name="email"
                type="email" 
                placeholder="admin@alzguard.ai" 
                value={formData.email}
                className="w-full h-12 px-3.5 text-[14px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/5 outline-none transition-all"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-[7px]">
              <label className="block text-[13px] font-medium text-[#374151]">รหัสผ่าน</label>
              <input 
                name="password"
                type="password" 
                placeholder="••••••••" 
                value={formData.password}
                className="w-full h-12 px-3.5 text-[14px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/5 outline-none transition-all"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex justify-end -mt-2">
              <button type="button" className="text-[13px] text-[#2563EB] font-medium hover:underline">ลืมรหัสผ่าน?</button>
            </div>
            <button type="submit" className="w-full h-[50px] bg-[#2563EB] text-white rounded-[12px] text-[15px] font-semibold hover:bg-[#1D4ED8] active:scale-[0.985] transition-all mt-2">
              เข้าสู่ระบบ
            </button>
          </form>
        ) : (
          /* Register Panel */
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-[7px]">
              <label className="block text-[13px] font-medium text-[#374151]">ชื่อ-นามสกุล</label>
              <input 
                name="name"
                type="text" 
                placeholder="ชื่อของคุณ" 
                value={formData.name}
                className="w-full h-12 px-3.5 text-[14px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] focus:bg-white focus:border-[#2563EB] outline-none transition-all"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-[7px]">
              <label className="block text-[13px] font-medium text-[#374151]">อีเมล</label>
              <input 
                name="email"
                type="email" 
                placeholder="admin@alzguard.ai" 
                value={formData.email}
                className="w-full h-12 px-3.5 text-[14px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] focus:bg-white focus:border-[#2563EB] outline-none transition-all"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-[7px]">
              <label className="block text-[13px] font-medium text-[#374151]">รหัสผ่าน</label>
              <input 
                name="password"
                type="password" 
                placeholder="สร้างรหัสผ่าน" 
                value={formData.password}
                className="w-full h-12 px-3.5 text-[14px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] focus:bg-white focus:border-[#2563EB] outline-none transition-all"
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-[7px] mb-5">
              <label className="block text-[13px] font-medium text-[#374151]">ยืนยันรหัสผ่าน</label>
              <input 
                name="confirmPassword"
                type="password" 
                placeholder="ยืนยันรหัสผ่านอีกครั้ง" 
                value={formData.confirmPassword}
                className="w-full h-12 px-3.5 text-[14px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] focus:bg-white focus:border-[#2563EB] outline-none transition-all"
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="w-full h-[50px] bg-[#2563EB] text-white rounded-[12px] text-[15px] font-semibold hover:bg-[#1D4ED8] active:scale-[0.985] transition-all">
              สร้างบัญชี
            </button>
          </form>
        )}
      </div>
    </div>
  );
}