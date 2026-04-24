"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, TrendingUp, Users, Lightbulb,
  Zap, Activity, ChevronRight,
} from "lucide-react";

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
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-color)",
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
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: "var(--brand-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Activity size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)", letterSpacing: "-0.3px" }}>DevInsight</div>
            <div style={{ fontSize: 11, color: "var(--text-subtle)", fontWeight: 500 }}>Professional Edition</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: "16px 12px 8px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: 8, marginBottom: 6 }}>
          Navigation
        </div>
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const path = href(activeDeveloperId);
          const isActive = pathname === path || pathname.startsWith(path.split("?")[0]);
          return (
            <Link 
              key={label} 
              href={path} 
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "6px",
                color: isActive ? "var(--brand-primary)" : "var(--text-muted)",
                background: isActive ? "var(--brand-bg)" : "transparent",
                fontWeight: isActive ? 600 : 500,
                fontSize: "14px",
                textDecoration: "none",
                marginBottom: "4px"
              }}
            >
              <Icon size={16} />
              <span>{label}</span>
              {isActive && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
            </Link>
          );
        })}
      </nav>

      {/* Developers */}
      <div style={{ padding: "8px 12px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: 8, marginBottom: 8 }}>
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
                  borderRadius: 6, marginBottom: 2,
                  background: isActive ? "var(--brand-bg)" : "transparent",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 6,
                  background: isActive ? "var(--brand-primary)" : "var(--bg-subtle)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 600,
                  color: isActive ? "white" : "var(--text-muted)",
                  flexShrink: 0,
                }}>
                  {dev.avatar}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 500, color: isActive ? "var(--brand-primary)" : "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {dev.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-subtle)" }}>{dev.team_name}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--status-healthy-fg)" }} />
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>System Operational</span>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-subtle)", marginTop: 4 }}>
          Last synced: Just now
        </div>
      </div>
    </aside>
  );
}
