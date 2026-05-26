import { cn } from "../../lib/utils";

const STATUS_CONFIG = {
  live: {
    label: "LIVE",
    dot: "bg-green-500 pulse-green",
    badge: "bg-green-50 text-green-700 border-green-200",
  },
  standby: {
    label: "STANDBY",
    dot: "bg-slate-400",
    badge: "bg-slate-50 text-slate-500 border-slate-200",
  },
  offline: {
    label: "OFFLINE",
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-600 border-red-200",
  },
  danger: {
    label: "DANGER",
    dot: "bg-red-500 pulse-red",
    badge: "bg-red-50 text-red-700 border-red-200",
  },
  new: {
    label: "ใหม่",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  acknowledged: {
    label: "รับทราบ",
    dot: "bg-yellow-400",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  resolved: {
    label: "แก้ไขแล้ว",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 border-green-200",
  },
};

export default function StatusBadge({ status, className }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.standby;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium", cfg.badge, className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}