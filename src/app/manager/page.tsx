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
  critical: { color: "#f43f5e", bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.25)", label: "Critical",  Icon: AlertTriangle },
  warning:  { color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", label: "Warning",  Icon: Zap           },
  healthy:  { color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", label: "Healthy",  Icon: CheckCircle   },
  info:     { color: "#60a5fa", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", label: "Info",     Icon: CheckCircle   },
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
    <div style={{ display: "flex", minHeight: "100vh", background: "#09090b" }}>
      <div style={{ width: 260, background: "#0d0d10", borderRight: "1px solid rgba(255,255,255,0.06)" }} />
      <main style={{ marginLeft: 260, flex: 1, padding: "32px 40px" }}>
        <div className="skeleton" style={{ height: 48, width: 300, marginBottom: 32 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 32 }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 90 }} />)}
        </div>
        {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12, borderRadius: 12 }} />)}
      </main>
    </div>
  );

  const { teamAverages, memberSummaries, summary } = data;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#09090b" }}>
      <Sidebar developers={developers} activeDeveloperId={developers[0]?.developer_id ?? ""} />
      <main style={{ marginLeft: 260, flex: 1, padding: "32px 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "linear-gradient(135deg, #06b6d4, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Users size={18} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f4f4f5", letterSpacing: "-0.4px" }}>
                Manager Summary
              </h1>
              <p style={{ fontSize: 13, color: "#52525b" }}>Team-level metrics · bottleneck overview · RBAC view</p>
            </div>
          </div>
        </div>

        {/* Team health overview */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 36 }}>
          {[
            { label: "Total Members",   value: summary.totalMembers, color: "#8b5cf6", Icon: Users         },
            { label: "Critical Issues", value: summary.criticalCount, color: "#f43f5e", Icon: AlertTriangle },
            { label: "Warnings",        value: summary.warningCount,  color: "#f59e0b", Icon: Zap           },
            { label: "Healthy",         value: summary.healthyCount,  color: "#10b981", Icon: CheckCircle   },
          ].map(({ label, value, color, Icon }) => (
            <div key={label} style={{
              background: "#141418", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 14, padding: "20px 22px",
              display: "flex", alignItems: "center", gap: 16,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${color}15`, border: `1px solid ${color}30`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon size={20} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#f4f4f5", fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
                <div style={{ fontSize: 12, color: "#52525b", fontWeight: 600 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Team averages */}
        <div style={{
          background: "#141418", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, padding: 24, marginBottom: 28,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <BarChart2 size={16} color="#8b5cf6" />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f4f4f5" }}>Team Averages (30-day)</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 20 }}>
            {[
              { label: "Lead Time",    value: teamAverages.leadTime,        unit: "h",   color: "#8b5cf6" },
              { label: "Cycle Time",   value: teamAverages.cycleTime,       unit: "h",   color: "#3b82f6" },
              { label: "PR Throughput",value: teamAverages.prThroughput,    unit: " PRs",color: "#06b6d4" },
              { label: "Deploy Freq.", value: teamAverages.deployFrequency, unit: "/30d",color: "#10b981" },
              { label: "Bug Rate",     value: teamAverages.bugRate,         unit: "%",   color: "#f43f5e" },
            ].map(m => (
              <div key={m.label}>
                <div style={{ fontSize: 11, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 6 }}>{m.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: m.color, fontFamily: "'JetBrains Mono', monospace" }}>
                  {m.value}{m.unit}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member table */}
        <div style={{
          background: "#141418", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16, overflow: "hidden",
        }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f4f4f5" }}>Developer Breakdown</h2>
            <p style={{ fontSize: 12, color: "#52525b", marginTop: 2 }}>Click any developer to view their full dashboard</p>
          </div>

          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 2fr",
            padding: "10px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)",
            fontSize: 11, fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em",
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
                  className="fade-in-up"
                  style={{
                    display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 2fr",
                    padding: "16px 24px", alignItems: "center",
                    borderBottom: i < memberSummaries.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    cursor: "pointer", transition: "background 0.15s",
                    animationDelay: `${i * 60}ms`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Developer */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                      background: "linear-gradient(135deg, #8b5cf680, #3b82f680)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, color: "white",
                    }}>
                      {member.developer.avatar}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#f4f4f5" }}>{member.developer.name}</div>
                      <div style={{ fontSize: 11, color: "#52525b" }}>{member.developer.team_name} · {member.developer.role}</div>
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
                    <div key={mi} style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7", fontFamily: "'JetBrains Mono', monospace" }}>
                      {m.v}{m.u}
                    </div>
                  ))}

                  {/* Top insight */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200,
                    }}>
                      <HIcon size={12} />
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
