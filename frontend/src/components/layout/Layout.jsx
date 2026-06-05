import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  // แก้ให้เหลือแค่โครงสร้างพื้นฐาน ไม่ต้องเช็คสิทธิ์อะไรทั้งสิ้น
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-auto min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}