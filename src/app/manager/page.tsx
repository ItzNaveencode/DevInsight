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
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <div style={{ width: 260, background: "var(--bg-secondary)", borderRight: "1px solid var(--border-default)" }} />
      <main style={{ marginLeft: 260, flex: 1, padding: "40px" }}>
        <div style={{ height: 48, width: 300, background: "var(--bg-tertiary)", marginBottom: 32, borderRadius: 8 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: 110, background: "var(--bg-tertiary)", borderRadius: 16 }} />)}
        </div>
      </main>
    </div>
  );

  const { teamAverages, memberSummaries, summary } = data;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Sidebar developers={developers} activeDeveloperId={developers[0]?.developer_id ?? ""} />
      <main style={{ marginLeft: 260, flex: 1, padding: "40px", maxWidth: "calc(100vw - 260px)" }}>

        {/* Header */}
        <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: "1px solid var(--border-default)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 12,
              background: "var(--bg-tertiary)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Users size={24} color="var(--text-primary)" />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
                Manager Summary
              </h1>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
                Team-level metrics and bottleneck overview
              </p>
            </div>
          </div>
        </div>

        {/* Team health overview */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Total Members",   value: summary.totalMembers, color: "var(--text-primary)",  badgeClass: "badge-neutral", Icon: Users         },
            { label: "Critical Issues", value: summary.criticalCount, color: "var(--semantic-danger)", badgeClass: "badge-danger",  Icon: AlertTriangle },
            { label: "Warnings",        value: summary.warningCount,  color: "var(--semantic-warning)",badgeClass: "badge-warning", Icon: Zap           },
            { label: "Healthy",         value: summary.healthyCount,  color: "var(--semantic-success)",badgeClass: "badge-success", Icon: CheckCircle   },
          ].map(({ label, value, color, badgeClass, Icon }) => (
            <div key={label} className="premium-card" style={{ padding: "24px", display: "flex", alignItems: "center", gap: 16 }}>
              <div className={badgeClass} style={{
                width: 48, height: 48, borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div className="font-mono" style={{ fontSize: 32, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, marginTop: 6 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Team averages */}
        <div className="premium-card" style={{ padding: 32, marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <BarChart2 size={20} color="var(--accent-primary)" />
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>Team Averages (30-day)</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 24 }}>
            {[
              { label: "Lead Time",    value: teamAverages.leadTime,        unit: "h" },
              { label: "Cycle Time",   value: teamAverages.cycleTime,       unit: "h" },
              { label: "PR Throughput",value: teamAverages.prThroughput,    unit: " PRs" },
              { label: "Deploy Freq.", value: teamAverages.deployFrequency, unit: "/30d" },
              { label: "Bug Rate",     value: teamAverages.bugRate,         unit: "%" },
            ].map(m => (
              <div key={m.label}>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 8 }}>{m.label}</div>
                <div className="font-mono" style={{ fontSize: 24, fontWeight: 600, color: "var(--text-primary)" }}>
                  {m.value}<span style={{ fontSize: 14, color: "var(--text-muted)", marginLeft: 2, fontFamily: "Inter" }}>{m.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member table */}
        <div className="premium-card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "24px", borderBottom: "1px solid var(--border-default)" }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>Developer Breakdown</h2>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 2fr",
            padding: "16px 24px", borderBottom: "1px solid var(--border-default)",
            fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em",
            backgroundColor: "var(--bg-tertiary)",
          }}>
            {["Developer", "Lead", "Cycle", "PRs", "Deploys", "Bugs", "Top Insight"].map(h => (
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
                    borderBottom: i < memberSummaries.length - 1 ? "1px solid var(--border-default)" : "none",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-tertiary)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: "var(--bg-tertiary)", border: "1px solid var(--border-light)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 600, color: "var(--text-primary)",
                    }}>
                      {member.developer.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{member.developer.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{member.developer.team_name} · {member.developer.role}</div>
                    </div>
                  </div>

                  {[
                    { v: member.metrics.leadTime,        u: "h" },
                    { v: member.metrics.cycleTime,       u: "h" },
                    { v: member.metrics.prThroughput,    u: "" },
                    { v: member.metrics.deployFrequency, u: "" },
                    { v: member.metrics.bugRate,         u: "%" },
                  ].map((m, mi) => (
                    <div key={mi} className="font-mono" style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
                      {m.v}<span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 2, fontFamily: "Inter" }}>{m.u}</span>
                    </div>
                  ))}

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className={cfg.badge} style={{
                      padding: "6px 12px", borderRadius: 6, fontSize: 13, fontWeight: 500,
                      display: "flex", alignItems: "center", gap: 6,
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
