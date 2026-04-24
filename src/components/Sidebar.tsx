"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, TrendingUp, Users, Activity,
  ChevronRight, Sun, Moon
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
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <aside
      style={{
        width: 260,
        minHeight: "100vh",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-default)",
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
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border-default)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--accent-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Activity size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.3px" }}>DevInsight Pro</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: "24px 16px 8px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: 8, marginBottom: 8 }}>
          Menu
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
                borderRadius: "8px",
                color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                background: isActive ? "var(--bg-tertiary)" : "transparent",
                fontWeight: 500,
                fontSize: "14px",
                textDecoration: "none",
                marginBottom: "4px",
                transition: "background 0.2s, color 0.2s"
              }}
              onMouseEnter={e => { if(!isActive) e.currentTarget.style.background = "var(--bg-tertiary)" }}
              onMouseLeave={e => { if(!isActive) e.currentTarget.style.background = "transparent" }}
            >
              <Icon size={18} />
              <span>{label}</span>
              {isActive && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
            </Link>
          );
        })}
      </nav>

      {/* Developers */}
      <div style={{ padding: "16px", flex: 1, overflowY: "auto" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", paddingLeft: 8, marginBottom: 8 }}>
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
                  borderRadius: 8, marginBottom: 4,
                  background: isActive ? "var(--bg-tertiary)" : "transparent",
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { if(!isActive) e.currentTarget.style.background = "var(--bg-tertiary)" }}
                onMouseLeave={e => { if(!isActive) e.currentTarget.style.background = "transparent" }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: isActive ? "var(--accent-primary)" : "var(--bg-tertiary)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 600,
                  color: isActive ? "white" : "var(--text-secondary)",
                  flexShrink: 0,
                  border: isActive ? "none" : "1px solid var(--border-light)"
                }}>
                  {dev.avatar}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: isActive ? "var(--accent-primary)" : "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {dev.name}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{dev.team_name}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer / Theme Toggle */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border-default)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--semantic-success)" }} />
            <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>System Online</span>
          </div>
        </div>
        {mounted && (
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              background: "var(--bg-tertiary)", border: "1px solid var(--border-light)",
              width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-secondary)"
            }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        )}
      </div>
    </aside>
  );
}
