import { useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Settings, Play, Square, AlertTriangle, MapPin } from "lucide-react";
import StatusBadge from "../../components/ui/StatusBadge";

import { cn } from "../../lib/utils";

const API_BASE = "http://localhost:8001/api";

export default function CameraCard({ camera, alertCount = 0, onStatusChange }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
      {/* Video preview area */}
      <div className="relative aspect-video bg-slate-900 flex items-center justify-center overflow-hidden">
        {camera.status === "live" && !imgError ? (
          <img
            src={`${API_BASE}/video-feed?camera_id=${camera.id}&t=${Date.now()}`}
            className="w-full h-full object-cover"
            alt="Live feed"
            onError={() => setImgError(true)}
          />
        ) : camera.thumbnail_url && !imgError ? (
          <img
            src={camera.thumbnail_url}
            className="w-full h-full object-cover opacity-80"
            alt="Thumbnail"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-40">
            <Camera size={32} className="text-slate-400" />
            <span className="text-xs text-slate-400">{camera.name}</span>
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-2 left-2">
          <StatusBadge status={camera.status || "standby"} />
        </div>

        {alertCount > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            <AlertTriangle size={11} />
            {alertCount}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Link
            to={`/cameras/${camera.id}`}
            className="px-4 py-2 bg-white/90 text-foreground text-sm font-medium rounded-lg hover:bg-white transition-colors"
          >
            จัดการกล้อง
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">{camera.name}</h3>
            {camera.location && (
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="text-muted-foreground flex-shrink-0" />
                <span className="text-xs text-muted-foreground truncate">{camera.location}</span>
              </div>
            )}
          </div>
          <Link
            to={`/cameras/${camera.id}`}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
          >
            <Settings size={14} />
          </Link>
        </div>

        {camera.alert_email && (
          <p className="mt-2 text-xs text-muted-foreground truncate">📧 {camera.alert_email}</p>
        )}
      </div>
    </div>
  );
}