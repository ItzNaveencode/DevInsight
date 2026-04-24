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

const HEALTH_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; Icon: any }> = {
  critical: { color: "var(--status-critical-fg)", bg: "var(--status-critical-bg)", border: "var(--status-critical-border)", label: "Critical",  Icon: AlertTriangle },
  warning:  { color: "var(--status-warning-fg)", bg: "var(--status-warning-bg)", border: "var(--status-warning-border)", label: "Warning",  Icon: Zap           },
  healthy:  { color: "var(--status-healthy-fg)", bg: "var(--status-healthy-bg)", border: "var(--status-healthy-border)", label: "Healthy",  Icon: CheckCircle   },
  info:     { color: "var(--status-info-fg)", bg: "var(--status-info-bg)", border: "var(--status-info-border)", label: "Info",     Icon: CheckCircle   },
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
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-main)" }}>
      <div style={{ width: 260, background: "var(--bg-sidebar)", borderRight: "1px solid var(--border-color)" }} />
      <main style={{ marginLeft: 260, flex: 1, padding: "40px" }}>
        <div className="skeleton" style={{ height: 48, width: 300, marginBottom: 32 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 110 }} />)}
        </div>
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12, borderRadius: 8 }} />)}
      </main>
    </div>
  );

  const { teamAverages, memberSummaries, summary } = data;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-main)" }}>
      <Sidebar developers={developers} activeDeveloperId={developers[0]?.developer_id ?? ""} />
      <main style={{ marginLeft: 260, flex: 1, padding: "40px", maxWidth: "calc(100vw - 260px)" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 8,
              background: "var(--brand-primary)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Users size={20} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-main)", letterSpacing: "-0.5px" }}>
                Manager Summary
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
                Team-level metrics · Bottleneck overview · Role-based access view
              </p>
            </div>
          </div>
        </div>

        {/* Team health overview */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Members",   value: summary.totalMembers, color: "var(--text-main)", bg: "var(--bg-subtle)", border: "var(--border-color)", Icon: Users         },
            { label: "Critical Issues", value: summary.criticalCount, color: "var(--status-critical-fg)", bg: "var(--status-critical-bg)", border: "var(--status-critical-border)", Icon: AlertTriangle },
            { label: "Warnings",        value: summary.warningCount,  color: "var(--status-warning-fg)", bg: "var(--status-warning-bg)", border: "var(--status-warning-border)", Icon: Zap           },
            { label: "Healthy",         value: summary.healthyCount,  color: "var(--status-healthy-fg)", bg: "var(--status-healthy-bg)", border: "var(--status-healthy-border)", Icon: CheckCircle   },
          ].map(({ label, value, color, bg, border, Icon }) => (
            <div key={label} className="professional-card" style={{
              padding: "24px", display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 8,
                background: bg, border: `1px solid ${border}`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "var(--text-main)", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, marginTop: 6 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Team averages */}
        <div className="professional-card" style={{ padding: 32, marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <BarChart2 size={18} color="var(--text-muted)" />
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-main)" }}>Team Averages (30-day)</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 24 }}>
            {[
              { label: "Lead Time",    value: teamAverages.leadTime,        unit: "h",   color: "var(--chart-lead)" },
              { label: "Cycle Time",   value: teamAverages.cycleTime,       unit: "h",   color: "var(--chart-cycle)" },
              { label: "PR Throughput",value: teamAverages.prThroughput,    unit: " PRs",color: "var(--chart-pr)" },
              { label: "Deploy Freq.", value: teamAverages.deployFrequency, unit: "/30d",color: "var(--chart-deploy)" },
              { label: "Bug Rate",     value: teamAverages.bugRate,         unit: "%",   color: "var(--chart-bug)" },
            ].map(m => (
              <div key={m.label}>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginBottom: 8 }}>{m.label}</div>
                <div style={{ fontSize: 24, fontWeight: 600, color: "var(--text-main)", fontFamily: "'JetBrains Mono', monospace" }}>
                  {m.value}<span style={{ fontSize: 16, color: "var(--text-subtle)", marginLeft: 2 }}>{m.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member table */}
        <div className="professional-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "24px", borderBottom: "1px solid var(--border-color)", backgroundColor: "var(--bg-subtle)" }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-main)" }}>Developer Breakdown</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Click any developer to view their full dashboard</p>
          </div>

          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 2fr",
            padding: "16px 24px", borderBottom: "1px solid var(--border-color)",
            fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em",
            backgroundColor: "var(--bg-card)",
          }}>
            {["Developer", "Lead Time", "Cycle Time", "PRs", "Deploys", "Bug Rate", "Top Insight"].map(h => (
              <div key={h}>{h}</div>
            ))}
          </div>

          {memberSummaries.map((member, i) => {
            const cfg = HEALTH_CONFIG[member.health] ?? HEALTH_CONFIG.healthy;
            const HIcon = cfg.Icon;
            return (
              <Link key={member.developer.developer_id} href={`/dashboard/${member.developer.developer_id}`} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 2fr",
                    padding: "16px 24px", alignItems: "center",
                    borderBottom: i < memberSummaries.length - 1 ? "1px solid var(--border-color)" : "none",
                    backgroundColor: "var(--bg-card)", cursor: "pointer", transition: "background-color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-subtle)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--bg-card)")}
                >
                  {/* Developer */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                      background: "var(--bg-subtle)", border: "1px solid var(--border-color)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 600, color: "var(--text-main)",
                    }}>
                      {member.developer.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)" }}>{member.developer.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{member.developer.team_name} · {member.developer.role}</div>
                    </div>
                  </div>

                  {/* Metrics */}
                  {[
                    { v: member.metrics.leadTime,        u: "h"   },
                    { v: member.metrics.cycleTime,       u: "h"   },
                    { v: member.metrics.prThroughput,    u: ""    },
                    { v: member.metrics.deployFrequency, u: ""    },
                    { v: member.metrics.bugRate,         u: "%"   },
                  ].map((m, mi) => (
                    <div key={mi} style={{ fontSize: 14, fontWeight: 500, color: "var(--text-main)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {m.v}<span style={{ fontSize: 12, color: "var(--text-subtle)", marginLeft: 2 }}>{m.u}</span>
                    </div>
                  ))}

                  {/* Top insight */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className={`tag severity-${member.health}`} style={{
                      padding: "6px 12px", borderRadius: 6,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220,
                    }}>
                      <HIcon size={14} />
                      {member.topInsight?.title ?? "Healthy"}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </main>
    </div>
  );
}
