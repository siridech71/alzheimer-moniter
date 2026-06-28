import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Camera, Bell } from "lucide-react";

export default function BottomNavigation() {
  const location = useLocation();
  const navItems = [
    { path: "/", label: "หน้าหลัก", icon: LayoutDashboard },
    { path: "/cameras", label: "กล้อง", icon: Camera },
    { path: "/alerts", label: "แจ้งเตือน", icon: Bell },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0F1B3D] border-t border-slate-800 flex items-center justify-around px-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center w-16 h-full transition-all ${
              isActive ? "text-[#FF8A5C]" : "text-slate-400"
            }`}
          >
            <Icon size={20} className={isActive ? "scale-110" : ""} />
            <span className="text-[10px] font-['Prompt'] font-medium mt-1">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}