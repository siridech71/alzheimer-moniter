import { useQuery } from "@tanstack/react-query";
import { base44 } from "../api/base44Client";
import CameraCard from "../components/cameras/CameraCard";
import { Camera, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Cameras() {
  const [search, setSearch] = useState("");

  const { data: cameras = [], isLoading } = useQuery({
    queryKey: ["cameras"],
    queryFn: () => base44.entities.Camera.list("-created_date"),
    refetchInterval: 15000,
  });

  const filtered = cameras.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">กล้องวงจรปิด</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{cameras.length} กล้องในระบบ</p>
        </div>
        <Link
          to="/cameras/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={15} /> เพิ่มกล้องใหม่
        </Link>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหากล้อง..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="bg-secondary rounded-xl animate-pulse h-48" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filtered.map(cam => (
            <CameraCard key={cam.id} camera={cam} />
          ))}
        </div>
      )}
    </div>
  );
}