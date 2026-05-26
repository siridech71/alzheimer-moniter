import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import {
  LayoutDashboard, Camera, Users, Bell, Settings, ShieldAlert, LogOut, Activity
} from "lucide-react";
import { base44 } from "../../api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/", roles: ["admin", "user"] },
  { label: "กล้อง", icon: Camera, path: "/cameras", roles: ["admin", "user"] },
  { label: "ผู้ป่วย", icon: Users, path: "/patients", roles: ["admin"] },
  { label: "การแจ้งเตือน", icon: Bell, path: "/alerts", roles: ["admin", "user"] },
  { label: "ตั้งค่า", icon: Settings, path: "/settings", roles: ["admin"] },
];

export default function Sidebar() {
  const location = useLocation();
  const { currentUser } = useAuth();

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts-unread"],
    queryFn: () => base44.entities.Alert.filter({ status: "new" }),
    refetchInterval: 10000,
  });

  const userRole = currentUser?.role || "user";
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <aside className="fixed left-0 top-0 h-full w-[240px] bg-white border-r border-border flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <ShieldAlert size={16} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">Alzheimer</p>
          <p className="text-xs text-muted-foreground">Guard AI</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path || (path !== "/" && location.pathname.startsWith(path));
          const badgeCount = label === "การแจ้งเตือน" ? alerts.length : 0;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {badgeCount > 0 && (
                <span className="min-w-[18px] h-[18px] rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {currentUser?.full_name?.[0] || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{currentUser?.full_name || "User"}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{userRole}</p>
          </div>
        </div>
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
        >
          <LogOut size={15} />
          <span>ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}