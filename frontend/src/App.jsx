import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import AddCamera from './pages/AddCamera';
import Cameras from './pages/Cameras';
import Alerts from './pages/Alerts';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  const isAuth = localStorage.getItem("is_logged_in") === "true";

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
        {isAuth && <Sidebar />}
        <main className={`flex-1 transition-all ${isAuth ? 'ml-64 p-8' : ''}`}>
          <Routes>
            <Route path="/login" element={!isAuth ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuth ? <Register /> : <Navigate to="/" />} />
            
            <Route path="/" element={isAuth ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/cameras" element={isAuth ? <Cameras /> : <Navigate to="/login" />} />
            <Route path="/cameras/new" element={isAuth ? <AddCamera /> : <Navigate to="/login" />} />
            {/* หน้าแก้ไขกล้องส่งไปใช้หน้า AddCamera เดียวกัน */}
            <Route path="/cameras/edit/:id" element={isAuth ? <AddCamera /> : <Navigate to="/login" />} />
            <Route path="/alerts" element={isAuth ? <Alerts /> : <Navigate to="/login" />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}