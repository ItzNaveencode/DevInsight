"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { Users, AlertTriangle, CheckCircle, Zap, BarChart2 } from "lucide-react";
import type { Developer } from "@/lib/data/seed";
import type { ComputedMetrics } from "@/lib/engines/metrics";

interface MemberSummary {
  developer: Developer;
  metrics: ComputedMetrics;
  topInsight: { title: string; severity: string; confidence: number } | null;
  health: string;
}

interface ManagerData {
  teamAverages: Record<string, number>;
  memberSummaries: MemberSummary[];
  summary: { criticalCount: number; warningCount: number; healthyCount: number; totalMembers: number };
}

const HEALTH_CONFIG: Record<string, { color: string; badge: string; label: string; Icon: any }> = {
  critical: { color: "var(--semantic-danger)",  badge: "badge-danger",  label: "Critical",  Icon: AlertTriangle },
  warning:  { color: "var(--semantic-warning)", badge: "badge-warning", label: "Warning",   Icon: Zap           },
  healthy:  { color: "var(--semantic-success)", badge: "badge-success", label: "Healthy",   Icon: CheckCircle   },
  info:     { color: "var(--text-secondary)",   badge: "badge-neutral", label: "Info",      Icon: CheckCircle   },
};

export default function ManagerPage() {
  const [data,       setData]       = useState<ManagerData | null>(null);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/developers").then(r => r.json()),
      fetch("/api/manager/summary").then(r => r.json()),
    ]).then(([devs, mgr]) => {
      setDevelopers(devs.developers);
      setData(mgr);
      setLoading(false);
    });
  }, []);

  if (loading || !data) return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <div className="hidden md:block w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-default)]" />
      <main className="flex-1 w-full md:ml-64 pt-16 md:pt-0">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="h-12 w-64 bg-[var(--bg-tertiary)] rounded-lg mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[var(--bg-tertiary)] rounded-2xl w-full" />)}
          </div>
        </div>
      </main>
    </div>
  );

  const { teamAverages, memberSummaries, summary } = data;

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar developers={developers} activeDeveloperId={developers[0]?.developer_id ?? ""} />
      
      <main className="flex-1 w-full md:ml-64 pt-16 md:pt-0">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

          {/* Header */}
          <div className="mb-8 pb-6 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0">
                <Users size={24} color="var(--text-primary)" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight truncate">
                  Manager Summary
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1 truncate">
                  Team-level metrics and bottleneck overview
                </p>
              </div>
            </div>
          </div>

          {/* Team health overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Members",   value: summary.totalMembers, color: "var(--text-primary)",  badgeClass: "badge-neutral", Icon: Users         },
              { label: "Critical Issues", value: summary.criticalCount, color: "var(--semantic-danger)", badgeClass: "badge-danger",  Icon: AlertTriangle },
              { label: "Warnings",        value: summary.warningCount,  color: "var(--semantic-warning)",badgeClass: "badge-warning", Icon: Zap           },
              { label: "Healthy",         value: summary.healthyCount,  color: "var(--semantic-success)",badgeClass: "badge-success", Icon: CheckCircle   },
            ].map(({ label, value, color, badgeClass, Icon }) => (
              <div key={label} className="premium-card p-6 flex items-center gap-4 w-full min-w-0">
                <div className={`${badgeClass} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon size={20} color={color} />
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-3xl font-semibold text-[var(--text-primary)] leading-none truncate">{value}</div>
                  <div className="text-sm text-[var(--text-secondary)] font-medium mt-1 truncate">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Team averages */}
          <div className="premium-card p-6 sm:p-8 mb-8 w-full min-w-0">
            <div className="flex items-center gap-2 mb-6">
              <BarChart2 size={20} className="text-[var(--accent-primary)] shrink-0" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)] truncate">Team Averages (30-day)</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { label: "Lead Time",    value: teamAverages.leadTime,        unit: "h" },
                { label: "Cycle Time",   value: teamAverages.cycleTime,       unit: "h" },
                { label: "PR Throughput",value: teamAverages.prThroughput,    unit: " PRs" },
                { label: "Deploy Freq.", value: teamAverages.deployFrequency, unit: "/30d" },
                { label: "Bug Rate",     value: teamAverages.bugRate,         unit: "%" },
              ].map(m => (
                <div key={m.label} className="min-w-0">
                  <div className="text-sm text-[var(--text-secondary)] font-medium mb-2 truncate">{m.label}</div>
                  <div className="font-mono text-2xl font-semibold text-[var(--text-primary)] truncate">
                    {m.value}<span className="text-sm font-sans text-[var(--text-muted)] ml-1">{m.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Member table */}
          <div className="premium-card w-full overflow-hidden">
            <div className="p-6 border-b border-[var(--border-default)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] truncate">Developer Breakdown</h2>
            </div>

            <div className="w-full overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Table Header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_2fr] px-6 py-4 border-b border-[var(--border-default)] text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-tertiary)]">
                  {["Developer", "Lead", "Cycle", "PRs", "Deploys", "Bugs", "Top Insight"].map(h => (
                    <div key={h} className="truncate px-2">{h}</div>
                  ))}
                </div>

                {/* Table Rows */}
                {memberSummaries.map((member, i) => {
                  const cfg = HEALTH_CONFIG[member.health] ?? HEALTH_CONFIG.healthy;
                  const HIcon = cfg.Icon;
                  return (
                    <Link key={member.developer.developer_id} href={`/dashboard/${member.developer.developer_id}`} className="block w-full">
                      <div className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_2fr] px-6 py-4 items-center transition-colors hover:bg-[var(--bg-tertiary)] ${i < memberSummaries.length - 1 ? 'border-b border-[var(--border-default)]' : ''}`}>
                        
                        <div className="flex items-center gap-3 px-2 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-light)] flex items-center justify-center text-sm font-semibold text-[var(--text-primary)] shrink-0">
                            {member.developer.avatar}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-[var(--text-primary)] truncate">{member.developer.name}</div>
                            <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{member.developer.team_name}</div>
                          </div>
                        </div>

                        {[
                          { v: member.metrics.leadTime,        u: "h" },
                          { v: member.metrics.cycleTime,       u: "h" },
                          { v: member.metrics.prThroughput,    u: "" },
                          { v: member.metrics.deployFrequency, u: "" },
                          { v: member.metrics.bugRate,         u: "%" },
                        ].map((m, mi) => (
                          <div key={mi} className="font-mono text-sm font-medium text-[var(--text-primary)] px-2 truncate">
                            {m.v}<span className="text-xs font-sans text-[var(--text-muted)] ml-1">{m.u}</span>
                          </div>
                        ))}

                        <div className="flex items-center gap-2 px-2 min-w-0">
                          <div className={`${cfg.badge} px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 truncate max-w-full`}>
                            <HIcon size={14} className="shrink-0" />
                            <span className="truncate">{member.topInsight?.title ?? "Healthy"}</span>
                          </div>
                        </div>

                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
