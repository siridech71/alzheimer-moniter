import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import { Users, Plus, Pencil, Trash2, X, Save, Loader2 } from "lucide-react";

const GENDER_LABELS = { male: "ชาย", female: "หญิง", other: "อื่นๆ" };

const EMPTY_FORM = { name: "", age: "", gender: "male", zone: "", notes: "" };

export default function Patients() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients"],
    queryFn: () => base44.entities.Patient.list("-created_date"),
  });

  const openNew = () => { setForm(EMPTY_FORM); setEditTarget(null); setShowForm(true); };
  const openEdit = (p) => { setForm({ name: p.name, age: p.age || "", gender: p.gender || "male", zone: p.zone || "", notes: p.notes || "" }); setEditTarget(p); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...form, age: form.age ? parseInt(form.age) : undefined };
      if (editTarget) await base44.entities.Patient.update(editTarget.id, data);
      else await base44.entities.Patient.create(data);
      qc.invalidateQueries({ queryKey: ["patients"] });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (patient) => {
    if (!confirm(`ลบข้อมูล "${patient.name}"?`)) return;
    await base44.entities.Patient.delete(patient.id);
    qc.invalidateQueries({ queryKey: ["patients"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">ผู้ป่วย</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{patients.length} คนในระบบ</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} /> เพิ่มผู้ป่วย
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-36 bg-white rounded-xl border border-border animate-pulse" />)}
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white rounded-xl border border-border border-dashed flex flex-col items-center py-16 gap-3">
          <Users size={40} className="text-muted-foreground opacity-30" />
          <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูลผู้ป่วย</p>
          <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90">
            <Plus size={14} /> เพิ่มผู้ป่วยคนแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-border p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-base">
                    {p.name?.[0] || "?"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {p.age ? `${p.age} ปี` : ""} {p.gender ? `· ${GENDER_LABELS[p.gender] || p.gender}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {p.zone && <p className="mt-2 text-xs text-muted-foreground">📍 {p.zone}</p>}
              {p.notes && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{p.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">{editTarget ? "แก้ไขข้อมูลผู้ป่วย" : "เพิ่มผู้ป่วยใหม่"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { key: "name", label: "ชื่อ-นามสกุล *", type: "text", placeholder: "ชื่อผู้ป่วย" },
                { key: "age", label: "อายุ", type: "number", placeholder: "อายุ (ปี)" },
                { key: "zone", label: "ห้อง/โซน", type: "text", placeholder: "เช่น ห้องนอนชั้น 1" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-muted-foreground">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-muted-foreground">เพศ</label>
                <select
                  value={form.gender}
                  onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                >
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">หมายเหตุ</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  rows={3}
                  placeholder="ข้อมูลเพิ่มเติม..."
                  className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 border border-border rounded-lg text-sm hover:bg-secondary transition-colors">
                ยกเลิก
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name}
                className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}