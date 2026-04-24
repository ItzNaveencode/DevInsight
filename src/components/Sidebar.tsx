"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, TrendingUp, Users, Activity,
  ChevronRight, Sun, Moon, Menu, X
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[var(--bg-secondary)] border-b border-[var(--border-default)] z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center">
            <Activity size={18} color="white" />
          </div>
          <div className="font-semibold text-[var(--text-primary)]">DevInsight Pro</div>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-[var(--text-secondary)]">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setMobileOpen(false)} 
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-[260px] bg-[var(--bg-secondary)] border-r border-[var(--border-default)] transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="p-6 pb-5 border-b border-[var(--border-default)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center">
              <Activity size={18} color="white" />
            </div>
            <div>
              <div className="text-base font-semibold text-[var(--text-primary)] tracking-tight">DevInsight Pro</div>
            </div>
          </div>
          <button className="md:hidden text-[var(--text-secondary)]" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-6 pt-6 pb-2">
          <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider pl-2 mb-2">
            Menu
          </div>
          {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
            const path = href(activeDeveloperId);
            const isActive = pathname === path || pathname.startsWith(path.split("?")[0]);
            return (
              <Link 
                key={label} 
                href={path} 
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${isActive ? 'bg-[var(--bg-tertiary)] text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'}`}
              >
                <Icon size={18} />
                <span>{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Developers */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider pl-2 mb-2">
            Developers
          </div>
          {developers.map((dev) => {
            const isActive = activeDeveloperId === dev.developer_id;
            const href = pathname.includes("/trends") ? `/trends/${dev.developer_id}`
                       : pathname.includes("/manager") ? `/manager`
                       : `/dashboard/${dev.developer_id}`;
            return (
              <Link key={dev.developer_id} href={href} onClick={() => setMobileOpen(false)}>
                <div className={`flex items-center gap-2.5 p-2 rounded-lg mb-1 transition-colors ${isActive ? 'bg-[var(--bg-tertiary)]' : 'hover:bg-[var(--bg-tertiary)]'}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${isActive ? 'bg-[var(--accent-primary)] text-white border-none' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-light)]'}`}>
                    {dev.avatar}
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-medium truncate ${isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
                      {dev.name}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{dev.team_name}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer / Theme Toggle */}
        <div className="p-4 px-5 border-t border-[var(--border-default)] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--semantic-success)]" />
            <span className="text-sm text-[var(--text-secondary)] font-medium">System Online</span>
          </div>
          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-light)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
