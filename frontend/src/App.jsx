import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import BottomNavigation from './components/layout/BottomNavigation';
import Dashboard from './pages/Dashboard';
import AddCamera from './pages/AddCamera';
import Cameras from './pages/Cameras';
import Alerts from './pages/Alerts';
import Login from './pages/Login';
import Register from './pages/Register';

// 📱 เรียกใช้งาน Hook จากโฟลเดอร์ที่คุณสร้างไว้ตามรูปภาพเป๊ะๆ
import { useIsMobile } from './hooks/use-mobile'; 

export default function App() {
  const isAuth = localStorage.getItem("is_logged_in") === "true";
  const isMobile = useIsMobile(); // 📱 ระบบรู้ทันทีว่าตอนนี้เปิดบนคอมหรือมือถือ

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#FFFBF5] font-sans text-slate-900 overflow-x-hidden">
        
        {/* 💻 ถ้าเป็นคอมพิวเตอร์และล็อกอินแล้ว -> แสดง Sidebar ด้านซ้ายปกติ */}
        {isAuth && !isMobile && <Sidebar />}
        
        {/* 🛠️ จัดการระยะห่าง (Responsive Margin): 
            - บนคอมพิวเตอร์ (จอใหญ่) จะหลบ Sidebar อัตโนมัติด้วย md:ml-64 p-8
            - บนมือถือ (จอเล็ก) จะชิดขอบซ้ายสุดทันที ml-0 p-4 และเว้นระยะด้านล่างเผื่อแถบกด pb-20 */}
        <main className={`flex-1 min-h-screen w-full transition-all duration-300 ${isAuth ? (isMobile ? 'ml-0 p-4 pb-20' : 'ml-64 p-8') : ''}`}>
          <Routes>
            <Route path="/login" element={!isAuth ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuth ? <Register /> : <Navigate to="/" />} />
            
            <Route path="/" element={isAuth ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/cameras" element={isAuth ? <Cameras /> : <Navigate to="/login" />} />
            <Route path="/cameras/new" element={isAuth ? <AddCamera /> : <Navigate to="/login" />} />
            <Route path="/cameras/edit/:id" element={isAuth ? <AddCamera /> : <Navigate to="/login" />} />
            <Route path="/alerts" element={isAuth ? <Alerts /> : <Navigate to="/login" />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* 📱 ถ้าล็อกอินแล้วและเปิดบนมือถือ -> แสดงแถบเมนูด้านล่างสุดเพื่อให้กดเปลี่ยนหน้าง่ายๆ */}
        {isAuth && isMobile && <BottomNavigation />}
      </div>
    </BrowserRouter>
  );
}