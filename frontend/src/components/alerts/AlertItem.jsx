import { useState } from "react";
import { AlertTriangle, Camera, Clock, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { base44 } from "../../api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

const EVENT_LABELS = {
  out_of_zone: "ออกนอกพื้นที่",
  fall_detected: "ตรวจจับการล้ม",
  prolonged_standing: "ยืนนานผิดปกติ",
};

export default function AlertItem({ alert }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const acknowledge = async (e) => {
    e.stopPropagation();
    await base44.entities.Alert.update(alert.id, { status: "acknowledged" });
    queryClient.invalidateQueries({ queryKey: ["alerts"] });
    queryClient.invalidateQueries({ queryKey: ["alerts-unread"] });
  };

  const timeAgo = alert.created_date
    ? formatDistanceToNow(new Date(alert.created_date), { addSuffix: true, locale: th })
    : "";

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden hover:shadow-sm transition-shadow">
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Icon */}
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
          alert.status === "new" ? "bg-red-50" : "bg-slate-50"
        }`}>
          <AlertTriangle size={16} className={alert.status === "new" ? "text-red-500" : "text-slate-400"} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">
              {EVENT_LABELS[alert.event_type] || alert.event_type}
            </span>
            <StatusBadge status={alert.status} />
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Camera size={11} /> {alert.camera_name || alert.camera_id}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={11} /> {timeAgo}
            </span>
            {alert.duration_seconds && (
              <span className="text-xs text-muted-foreground">
                {alert.duration_seconds.toFixed(1)}s นอกพื้นที่
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {alert.status === "new" && (
            <button
              onClick={acknowledge}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium"
            >
              <CheckCircle2 size={12} /> รับทราบ
            </button>
          )}
          {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {alert.image_url && (
            <img
              src={alert.image_url}
              alt="Evidence"
              className="rounded-lg border border-border w-full object-cover max-h-48"
            />
          )}
          <div className="space-y-2 text-sm">
            {alert.confidence_score && (
              <div>
                <span className="text-muted-foreground text-xs">ความมั่นใจ AI</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(alert.confidence_score * 100).toFixed(0)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">{(alert.confidence_score * 100).toFixed(0)}%</span>
                </div>
              </div>
            )}
            {alert.email_sent_to && (
              <div>
                <span className="text-muted-foreground text-xs">ส่งแจ้งเตือนไปยัง</span>
                <p className="text-xs mt-0.5">{alert.email_sent_to}</p>
              </div>
            )}
            {alert.track_id && (
              <div>
                <span className="text-muted-foreground text-xs">Track ID</span>
                <p className="text-xs mt-0.5 font-mono">{alert.track_id}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}