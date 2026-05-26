import { useQuery } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import { useAuth } from "../lib/AuthContext";
import CameraCard from "../components/cameras/CameraCard";
import { Camera, AlertTriangle, Activity, Users, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import AlertItem from "../components/alerts/AlertItem";

export default function Dashboard() {
  const { currentUser } = useAuth();

  const { data: cameras = [], isLoading: loadingCameras } = useQuery({
    queryKey: ["cameras"],
    queryFn: () => base44.entities.Camera.list("-created_date"),
    refetchInterval: 15000,
  });

  const { data: alerts = [], isLoading: loadingAlerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.Alert.list("-created_date", 20),
    refetchInterval: 10000,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: () => base44.entities.Patient.list(),
  });

  const newAlerts = alerts.filter(a => a.status === "new");
  const liveCount = cameras.filter(c => c.status === "live").length;

  const alertsPerCamera = {};
  alerts.forEach(a => {
    if (!alertsPerCamera[a.camera_id]) alertsPerCamera[a.camera_id] = 0;
    if (a.status === "new") alertsPerCamera[a.camera_id]++;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            สวัสดี, {currentUser?.full_name || "ผู้ใช้งาน"} — ภาพรวมระบบเฝ้าระวัง
          </p>
        </div>
        {currentUser?.role === "admin" && (
          <Link
            to="/cameras/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} /> เพิ่มกล้อง
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "กล้องทั้งหมด", value: cameras.length, icon: Camera, color: "text-primary bg-primary/10" },
          { label: "กำลัง LIVE", value: liveCount, icon: Activity, color: "text-green-600 bg-green-50" },
          { label: "แจ้งเตือนใหม่", value: newAlerts.length, icon: AlertTriangle, color: "text-red-500 bg-red-50" },
          { label: "ผู้ป่วยในระบบ", value: patients.length, icon: Users, color: "text-blue-500 bg-blue-50" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Camera Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">กล้องวงจรปิด</h2>
          <Link to="/cameras" className="flex items-center gap-1 text-xs text-primary hover:underline">
            ดูทั้งหมด <ArrowRight size={12} />
          </Link>
        </div>

        {loadingCameras ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border border-border aspect-video animate-pulse bg-secondary" />
            ))}
          </div>
        ) : cameras.length === 0 ? (
          <div className="bg-white rounded-xl border border-border border-dashed flex flex-col items-center justify-center py-16 gap-3">
            <Camera size={36} className="text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">ยังไม่มีกล้องในระบบ</p>
            {currentUser?.role === "admin" && (
              <Link
                to="/cameras/new"
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus size={14} /> เพิ่มกล้องแรก
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {cameras.map(cam => (
              <CameraCard
                key={cam.id}
                camera={cam}
                alertCount={alertsPerCamera[cam.id] || 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Alerts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-foreground">การแจ้งเตือนล่าสุด</h2>
          <Link to="/alerts" className="flex items-center gap-1 text-xs text-primary hover:underline">
            ดูทั้งหมด <ArrowRight size={12} />
          </Link>
        </div>

        {loadingAlerts ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-white rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-xl border border-border flex items-center justify-center py-10">
            <p className="text-sm text-muted-foreground">ยังไม่มีการแจ้งเตือน</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 5).map(alert => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}