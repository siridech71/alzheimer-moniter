import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import { useAuth } from "../lib/AuthContext";
import SafeZoneEditor from "../components/cameras/SafeZoneEditor";
import StatusBadge from "../components/ui/StatusBadge";
import {
  ArrowLeft, Save, Play, Square, Trash2, RefreshCw, Loader2, Mail, Settings
} from "lucide-react";

const API_BASE = "http://localhost:8001/api";

export default function CameraDetail() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const [form, setForm] = useState({
    name: "", source: "0", location: "", alert_email: "",
    confidence_threshold: 0.6, alert_delay_seconds: 4,
    status: "standby", safe_zone: [],
  });
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [loadingThumb, setLoadingThumb] = useState(false);
  const [saving, setSaving] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [backendError, setBackendError] = useState(false);

  const { data: camera } = useQuery({
    queryKey: ["camera", id],
    queryFn: () => base44.entities.Camera.filter({ id }),
    enabled: !isNew,
    select: data => data[0],
  });

  useEffect(() => {
    if (camera) {
      setForm({
        name: camera.name || "",
        source: camera.source || "0",
        location: camera.location || "",
        alert_email: camera.alert_email || "",
        confidence_threshold: camera.confidence_threshold || 0.6,
        alert_delay_seconds: camera.alert_delay_seconds || 4,
        status: camera.status || "standby",
        safe_zone: camera.safe_zone || [],
      });
      setMonitoring(camera.status === "live");
    }
  }, [camera]);

  const fetchThumbnail = async (source = form.source) => {
    setLoadingThumb(true);
    setBackendError(false);
    try {
      const resp = await fetch(`${API_BASE}/get-thumbnail?source=${source}&t=${Date.now()}`);
      if (!resp.ok) throw new Error("Failed");
      const blob = await resp.blob();
      setThumbnailUrl(URL.createObjectURL(blob));
    } catch {
      setBackendError(true);
    } finally {
      setLoadingThumb(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        const created = await base44.entities.Camera.create(form);
        qc.invalidateQueries({ queryKey: ["cameras"] });
        navigate(`/cameras/${created.id}`);
      } else {
        await base44.entities.Camera.update(camera.id, form);
        qc.invalidateQueries({ queryKey: ["cameras"] });
        qc.invalidateQueries({ queryKey: ["camera", id] });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("ต้องการลบกล้องนี้?")) return;
    await base44.entities.Camera.delete(camera.id);
    qc.invalidateQueries({ queryKey: ["cameras"] });
    navigate("/cameras");
  };

  const toggleMonitoring = async () => {
    if (!camera?.id) return;
    if (monitoring) {
      await fetch(`${API_BASE}/stop-monitoring`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ camera_id: camera.id }),
      }).catch(() => {});
      await base44.entities.Camera.update(camera.id, { status: "standby" });
      setMonitoring(false);
      setForm(p => ({ ...p, status: "standby" }));
    } else {
      if (form.safe_zone.length < 3) {
        alert("กรุณาวาด Safe Zone ก่อน (ต้องมีอย่างน้อย 3 จุด)");
        return;
      }
      await fetch(`${API_BASE}/start-monitoring`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          camera_source: form.source,
          safe_zone: form.safe_zone,
          email_to: form.alert_email,
          camera_id: camera?.id,
        }),
      }).catch(() => {});
      await base44.entities.Camera.update(camera.id, { status: "live" });
      setMonitoring(true);
      setForm(p => ({ ...p, status: "live" }));
    }
    qc.invalidateQueries({ queryKey: ["cameras"] });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/cameras" className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground">
            {isNew ? "เพิ่มกล้องใหม่" : form.name || "กล้อง"}
          </h1>
          {!isNew && <StatusBadge status={form.status} className="mt-1" />}
        </div>
        <div className="flex gap-2">
          {!isNew && isAdmin && (
            <button
              onClick={toggleMonitoring}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                monitoring
                  ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                  : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
              }`}
            >
              {monitoring ? <><Square size={14} /> หยุดระบบ</> : <><Play size={14} /> เริ่มเฝ้าระวัง</>}
            </button>
          )}
          {isAdmin && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              บันทึก
            </button>
          )}
          {!isNew && isAdmin && (
            <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors border border-border">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Settings */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-border p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Settings size={15} /> ตั้งค่ากล้อง</h3>

            <div>
              <label className="text-xs font-medium text-muted-foreground">ชื่อกล้อง *</label>
              <input
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="เช่น ห้องนอน, ห้องนั่งเล่น"
                disabled={!isAdmin}
                className="mt-1 w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">แหล่งสัญญาณ *</label>
              <div className="flex gap-2 mt-1">
                <input
                  value={form.source}
                  onChange={e => setForm(p => ({ ...p, source: e.target.value }))}
                  placeholder="0 (webcam) หรือ rtsp://..."
                  disabled={!isAdmin}
                  className="flex-1 px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
                />
                <button
                  onClick={() => fetchThumbnail(form.source)}
                  disabled={loadingThumb}
                  className="px-3 py-2 bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition-colors text-sm"
                >
                  {loadingThumb ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">ตำแหน่งติดตั้ง</label>
              <input
                value={form.location}
                onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                placeholder="เช่น ชั้น 1 หน้าบ้าน"
                disabled={!isAdmin}
                className="mt-1 w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2"><Mail size={15} /> การแจ้งเตือน</h3>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email รับแจ้งเตือน</label>
              <input
                type="email"
                value={form.alert_email}
                onChange={e => setForm(p => ({ ...p, alert_email: e.target.value }))}
                placeholder="caregiver@example.com"
                disabled={!isAdmin}
                className="mt-1 w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Confidence (%)</label>
                <input
                  type="number" min={0.1} max={1} step={0.05}
                  value={form.confidence_threshold}
                  onChange={e => setForm(p => ({ ...p, confidence_threshold: parseFloat(e.target.value) }))}
                  disabled={!isAdmin}
                  className="mt-1 w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">หน่วงเวลา (วิ)</label>
                <input
                  type="number" min={1} max={30}
                  value={form.alert_delay_seconds}
                  onChange={e => setForm(p => ({ ...p, alert_delay_seconds: parseInt(e.target.value) }))}
                  disabled={!isAdmin}
                  className="mt-1 w-full px-3 py-2 bg-secondary/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Camera preview + Safe Zone */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">ภาพจากกล้อง & Safe Zone</h3>
              {!thumbnailUrl && !monitoring && (
                <button
                  onClick={() => fetchThumbnail()}
                  className="flex items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  <RefreshCw size={12} /> โหลดภาพ
                </button>
              )}
            </div>

            {monitoring && !isNew ? (
              <div className="rounded-xl overflow-hidden border border-border bg-slate-900 aspect-video">
                <img
                  src={`${API_BASE}/video-feed?camera_id=${camera?.id}&t=${Date.now()}`}
                  className="w-full h-full object-contain"
                  alt="Live feed"
                />
              </div>
            ) : thumbnailUrl ? (
              <SafeZoneEditor
                imageUrl={thumbnailUrl}
                initialPoints={form.safe_zone || []}
                onChange={pts => isAdmin && setForm(p => ({ ...p, safe_zone: pts }))}
              />
            ) : (
              <div className="aspect-video rounded-xl bg-secondary flex flex-col items-center justify-center gap-3 border border-dashed border-border">
                {loadingThumb ? (
                  <><Loader2 size={28} className="animate-spin text-muted-foreground" /><p className="text-xs text-muted-foreground">กำลังโหลดภาพ...</p></>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">{backendError ? "ไม่สามารถเชื่อมต่อ Backend" : "คลิก 'โหลดภาพ' เพื่อดูภาพจากกล้อง"}</p>
                    <button onClick={() => fetchThumbnail()} className="px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary/90">
                      โหลดภาพ
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}