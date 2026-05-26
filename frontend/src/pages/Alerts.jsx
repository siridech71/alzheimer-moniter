import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import AlertItem from "../components/alerts/AlertItem";
import { Bell, Filter, CheckCheck, Trash2 } from "lucide-react";

const STATUS_OPTS = [
  { value: "", label: "ทั้งหมด" },
  { value: "new", label: "ใหม่" },
  { value: "acknowledged", label: "รับทราบแล้ว" },
  { value: "resolved", label: "แก้ไขแล้ว" },
];

const EVENT_OPTS = [
  { value: "", label: "ทุกประเภท" },
  { value: "out_of_zone", label: "ออกนอกพื้นที่" },
  { value: "fall_detected", label: "ตรวจจับการล้ม" },
  { value: "prolonged_standing", label: "ยืนนานผิดปกติ" },
];

export default function Alerts() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => base44.entities.Alert.list("-created_date", 100),
    refetchInterval: 10000,
  });

  const acknowledgeAll = async () => {
    const newOnes = alerts.filter(a => a.status === "new");
    await Promise.all(newOnes.map(a => base44.entities.Alert.update(a.id, { status: "acknowledged" })));
    qc.invalidateQueries({ queryKey: ["alerts"] });
    qc.invalidateQueries({ queryKey: ["alerts-unread"] });
  };

  const filtered = alerts.filter(a => {
    const matchStatus = !statusFilter || a.status === statusFilter;
    const matchEvent = !eventFilter || a.event_type === eventFilter;
    return matchStatus && matchEvent;
  });

  const newCount = alerts.filter(a => a.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">การแจ้งเตือน</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {newCount > 0 ? `${newCount} รายการใหม่ที่รอรับทราบ` : "ไม่มีรายการใหม่"}
          </p>
        </div>
        {newCount > 0 && (
          <button
            onClick={acknowledgeAll}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            <CheckCheck size={15} /> รับทราบทั้งหมด
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">กรองโดย:</span>
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={eventFilter}
          onChange={e => setEventFilter(e.target.value)}
          className="px-3 py-1.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {EVENT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} รายการ</span>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-white rounded-xl border border-border animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-border flex flex-col items-center py-16 gap-3">
          <Bell size={36} className="text-muted-foreground opacity-30" />
          <p className="text-sm text-muted-foreground">ไม่มีการแจ้งเตือนที่ตรงกับเงื่อนไข</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(alert => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}