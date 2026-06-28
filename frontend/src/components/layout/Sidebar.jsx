import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Camera, Bell, Heart, LogOut } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  // 🎯 ดึงชื่อที่เก็บไว้ตอน Login สำเร็จมาจากเครื่อง (ถ้าไม่มีข้อมูลให้ใช้คำว่า "siridech c." เป็นค่าเริ่มต้น)
  const currentUserName = localStorage.getItem("user_display_name") || "siridech c.";

  const menuItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/cameras", label: "กล้องเฝ้าระวัง", icon: Camera },
    { path: "/alerts", label: "ประวัติการแจ้งเตือน", icon: Bell },
  ];

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่หรือไม่?")) {
      localStorage.setItem("is_logged_in", "false");
      // ล้างชื่อเก่าออกไปด้วยตอนกดออกจากระบบ เพื่อให้ล็อกอินรอบถัดไปแสดงผลได้ถูกต้อง
      localStorage.removeItem("user_display_name"); 
      window.location.href = "/login";
    }
  };

  return (
    <div className="w-64 h-screen bg-[#0F1B3D] text-white flex flex-col justify-between p-6 font-['Inter'] shadow-xl fixed top-0 left-0 z-50">
      <div className="space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="p-2.5 bg-gradient-to-tr from-[#FF8A5C] to-[#2D5DE8] rounded-xl shadow-lg">
            <Heart size={22} className="text-white fill-white/20 animate-pulse" />
          </div>
          <div>
            <h1 className="font-['Lexend'] font-black text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Alzheimer
            </h1>
            <p className="font-['Lexend'] text-[10px] font-bold text-[#FF8A5C] tracking-widest uppercase -mt-1">
              Guard AI
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm transition-all duration-300 group ${
                  isActive
                    ? "bg-[#2D5DE8] text-white shadow-md shadow-[#2D5DE8]/30 translate-x-1"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon
                  size={18}
                  className={`transition-transform group-hover:scale-110 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-[#FF8A5C]"
                  }`}
                />
                <span className="font-['Inter']">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile & Logout ด้านล่างสุด */}
      <div className="border-t border-slate-800 pt-4 space-y-4">
        <div className="flex items-center gap-3 px-2">
          {/* 🌟 ปรับอักษรย่อโปรไฟล์ดึงตัวแรกของชื่อคนที่ Login เข้ามาใช้งานมาสกรีนอัตโนมัติ */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2D5DE8] to-[#0F1B3D] border border-slate-700 flex items-center justify-center font-['Lexend'] font-black text-sm text-white shadow-inner">
            {currentUserName.charAt(0).toUpperCase()}
          </div>
          <div>
            {/* 🎯 เปลี่ยนจากของเดิมที่ล็อกไว้ มาแสดงชื่อผู้ดูแลตามจริงที่มาจาก Database แล้วครับ */}
            <p className="text-xs font-bold text-slate-200 font-['Prompt'] tracking-wide">
              {currentUserName}
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 font-['Prompt'] cursor-pointer"
        >
          <LogOut size={16} />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </div>
  );
}