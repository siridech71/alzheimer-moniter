import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "../../api/base44Client";
import { useAlertListener } from "../../hooks/useAlertListener";
import Sidebar from "./Sidebar";

export default function Layout() {
  // ดึง backend URL จาก settings
  const { data: settings = [] } = useQuery({
    queryKey: ["settings"],
    queryFn: () => base44.entities.SystemSettings.list(),
    staleTime: 60000,
  });

  const backendUrl = settings.find(s => s.key === "backend_url")?.value || "http://localhost:8001";

  // เริ่ม poll alert จาก backend ตลอดเวลา
  useAlertListener(backendUrl);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 ml-[240px] overflow-auto">
        <div className="max-w-[1400px] mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}