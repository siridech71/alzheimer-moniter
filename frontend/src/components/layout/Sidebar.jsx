import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Camera, Bell, Shield, LogOut } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();
  const userName = localStorage.getItem("user_display_name") || "User";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const menu = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { label: "กล้อง", icon: Camera, path: "/cameras" },
    { label: "การแจ้งเตือน", icon: Bell, path: "/alerts" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col z-50">
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
          <Shield size={24} />
        </div>
        <div className="flex flex-col font-sans">
          <span className="font-bold text-slate-900 leading-tight">Alzheimer</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Guard AI</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} className={isActive ? "text-blue-600" : "text-slate-400"} /> 
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-black text-slate-900 truncate">{userName}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase">Administrator</span>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all group">
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm">ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}