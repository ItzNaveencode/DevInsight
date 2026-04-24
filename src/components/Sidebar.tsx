"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, TrendingUp, Users, Lightbulb,
  Zap, Activity, ChevronRight,
} from "lucide-react";
import clsx from "clsx";

interface SidebarProps {
  developers: { developer_id: string; name: string; team_name: string; avatar: string; role: string }[];
  activeDeveloperId: string;
}

const NAV_ITEMS = [
  { label: "Dashboard",  icon: LayoutDashboard, href: (id: string) => `/dashboard/${id}`  },
  { label: "Trends",     icon: TrendingUp,      href: (id: string) => `/trends/${id}`      },
  { label: "Manager",    icon: Users,            href: ()          => `/manager`            },
];

export default function Sidebar({ developers, activeDeveloperId }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 260,
        minHeight: "100vh",
        background: "#0d0d10",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f4f4f5", letterSpacing: "-0.3px" }}>DevInsight</div>
            <div style={{ fontSize: 11, color: "#71717a", fontWeight: 500 }}>Pro · Engineering Intelligence</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: "16px 12px 8px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em", paddingLeft: 8, marginBottom: 6 }}>
          Navigation
        </div>
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const path = href(activeDeveloperId);
          const isActive = pathname === path || pathname.startsWith(path.split("?")[0]);
          return (
            <Link key={label} href={path} className={clsx("nav-item", isActive && "active")}>
              <Icon size={16} />
              <span>{label}</span>
              {isActive && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
            </Link>
          );
        })}
      </nav>

      {/* Developers */}
      <div style={{ padding: "8px 12px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em", paddingLeft: 8, marginBottom: 8 }}>
          Developers
        </div>
        {developers.map((dev) => {
          const isActive = activeDeveloperId === dev.developer_id;
          const href = pathname.includes("/trends") ? `/trends/${dev.developer_id}`
                     : pathname.includes("/manager") ? `/manager`
                     : `/dashboard/${dev.developer_id}`;
          return (
            <Link key={dev.developer_id} href={href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                  borderRadius: 10, marginBottom: 2,
                  background: isActive ? "rgba(139,92,246,0.1)" : "transparent",
                  border: isActive ? "1px solid rgba(139,92,246,0.2)" : "1px solid transparent",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: isActive
                    ? "linear-gradient(135deg, #8b5cf6, #3b82f6)"
                    : "rgba(255,255,255,0.07)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700,
                  color: isActive ? "white" : "#a1a1aa",
                  flexShrink: 0,
                }}>
                  {dev.avatar}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? "#a78bfa" : "#e4e4e7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {dev.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#71717a" }}>{dev.team_name}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Activity size={12} color="#10b981" />
          <span style={{ fontSize: 11, color: "#52525b" }}>All systems operational</span>
        </div>
        <div style={{ fontSize: 10, color: "#3f3f46", marginTop: 4 }}>
          Last synced: just now · 30-day window
        </div>
      </div>
    </aside>
  );
}
