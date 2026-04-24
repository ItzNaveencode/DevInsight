"use client";

import { useEffect, useState, use } from "react";
import Sidebar from "@/components/Sidebar";
import MetricCard from "@/components/MetricCard";
import InsightCard from "@/components/InsightCard";
import {
  Clock, GitPullRequest, Rocket, Bug, Timer,
  RefreshCw, ChevronRight, ArrowRight, CheckCircle2,
  Layers, AlertCircle,
} from "lucide-react";
import type { ComputedMetrics } from "@/lib/engines/metrics";
import type { Insight }         from "@/lib/engines/insights";
import type { Recommendation }  from "@/lib/engines/recommendations";
import type { TrendDelta }      from "@/lib/engines/trends";
import type { Developer }       from "@/lib/data/seed";

const IMPACT_COLORS = { high: "#f43f5e", medium: "#f59e0b", low: "#10b981" };
const EFFORT_COLORS = { high: "#f43f5e", medium: "#f59e0b", low: "#10b981" };

export default function DashboardPage({ params }: { params: Promise<{ developerId: string }> }) {
  const { developerId } = use(params);

  const [developers,      setDevelopers]      = useState<Developer[]>([]);
  const [metrics,         setMetrics]         = useState<ComputedMetrics | null>(null);
  const [teamAverages,    setTeamAverages]     = useState<Record<string, number>>({});
  const [insights,        setInsights]         = useState<Insight[]>([]);
  const [recommendations, setRecommendations]  = useState<Recommendation[]>([]);
  const [deltas,          setDeltas]           = useState<TrendDelta[]>([]);
  const [loading,         setLoading]          = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/developers").then(r => r.json()),
      fetch(`/api/metrics/${developerId}`).then(r => r.json()),
      fetch(`/api/insights/${developerId}`).then(r => r.json()),
      fetch(`/api/recommendations/${developerId}`).then(r => r.json()),
      fetch(`/api/trends/${developerId}`).then(r => r.json()),
    ]).then(([devs, met, ins, rec, trn]) => {
      setDevelopers(devs.developers);
      setMetrics(met.metrics);
      setTeamAverages(met.teamAverages);
      setInsights(ins.insights);
      setRecommendations(rec.recommendations);
      setDeltas(trn.deltas);
      setLoading(false);
    });
  }, [developerId]);

  const developer = developers.find(d => d.developer_id === developerId);
  const getDelta = (key: string) => deltas.find(d => d.metric.toLowerCase().includes(key.toLowerCase()));

  if (loading || !metrics || !insights) return <LoadingSkeleton />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#09090b" }}>
      <Sidebar developers={developers} activeDeveloperId={developerId} />

      <main style={{ marginLeft: 260, flex: 1, padding: "32px 40px", maxWidth: "calc(100vw - 260px)" }}>
        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 800, color: "white",
                }}>
                  {developer?.avatar}
                </div>
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f4f4f5", letterSpacing: "-0.4px" }}>
                    {developer?.name}
                  </h1>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#71717a" }}>{developer?.role}</span>
                    <span style={{ color: "#3f3f46" }}>·</span>
                    <span style={{ fontSize: 13, color: "#71717a" }}>{developer?.team_name} Team</span>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: "#52525b" }}>
                Engineering intelligence report · 30-day rolling window
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: "rgba(16,185,129,0.1)", color: "#10b981",
                border: "1px solid rgba(16,185,129,0.2)",
              }}>
                <RefreshCw size={12} />
                Live · synced now
              </div>
            </div>
          </div>
        </div>

        {/* ── INSIGHTS (primary) ──────────────────────────────── */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f4f4f5" }}>Active Insights</h2>
              <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>
                {insights.length} insight{insights.length !== 1 ? "s" : ""} detected based on metric correlations
              </p>
            </div>
            <span style={{
              fontSize: 12, padding: "4px 12px", borderRadius: 99,
              background: insights.some(i => i.severity === "critical") ? "rgba(244,63,94,0.1)" : "rgba(16,185,129,0.1)",
              color: insights.some(i => i.severity === "critical") ? "#f43f5e" : "#10b981",
              border: `1px solid ${insights.some(i => i.severity === "critical") ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.2)"}`,
              fontWeight: 600,
            }}>
              {insights.some(i => i.severity === "critical") ? "⚠ Action Required" : "✓ No Critical Issues"}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {insights.map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} developerId={developerId} index={i} />
            ))}
          </div>
        </section>

        {/* ── METRICS GRID (secondary) ──────────────────────── */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f4f4f5" }}>Metrics</h2>
            <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>
              Computed over 30-day rolling window · compared against previous period
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
            <MetricCard
              label="Lead Time"
              value={metrics?.leadTime ?? 0}
              unit="h"
              delta={getDelta("lead")?.delta}
              deltaUnit="h"
              lowerIsBetter
              color="#8b5cf6"
              icon={<Clock size={14} color="#8b5cf6" />}
              subtitle={`Team avg: ${teamAverages.leadTime}h`}
            />
            <MetricCard
              label="Cycle Time"
              value={metrics?.cycleTime ?? 0}
              unit="h"
              delta={getDelta("cycle")?.delta}
              deltaUnit="h"
              lowerIsBetter
              color="#3b82f6"
              icon={<Timer size={14} color="#3b82f6" />}
              subtitle={`Team avg: ${teamAverages.cycleTime}h`}
            />
            <MetricCard
              label="PR Throughput"
              value={metrics?.prThroughput ?? 0}
              unit="PRs"
              delta={getDelta("throughput")?.delta}
              deltaUnit=""
              lowerIsBetter={false}
              color="#06b6d4"
              icon={<GitPullRequest size={14} color="#06b6d4" />}
              subtitle={`Team avg: ${teamAverages.prThroughput}`}
            />
            <MetricCard
              label="Deploy Freq."
              value={metrics?.deployFrequency ?? 0}
              unit="/30d"
              delta={getDelta("deploy")?.delta}
              deltaUnit=""
              lowerIsBetter={false}
              color="#10b981"
              icon={<Rocket size={14} color="#10b981" />}
              subtitle={`${metrics?.failedDeploys ?? 0} failed / rollback`}
            />
            <MetricCard
              label="Bug Rate"
              value={metrics?.bugRate ?? 0}
              unit="%"
              delta={getDelta("bug")?.delta}
              deltaUnit="%"
              lowerIsBetter
              color="#f43f5e"
              icon={<Bug size={14} color="#f43f5e" />}
              subtitle={`${metrics?.escapedBugs ?? 0} escaped to prod`}
            />
          </div>

          {/* Secondary stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginTop: 14 }}>
            {[
              { label: "Total Issues Closed",  value: metrics?.totalIssues,     icon: <CheckCircle2 size={14} color="#10b981" />, color: "#10b981" },
              { label: "Avg PR Size",           value: metrics?.avgPRSize,       icon: <Layers size={14} color="#f59e0b" />,      color: "#f59e0b" },
              { label: "Avg Time to Review",    value: `${metrics?.avgReviewWait}h`, icon: <AlertCircle size={14} color="#8b5cf6" />, color: "#8b5cf6" },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: "#141418", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12, padding: "16px 20px",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: `${stat.color}15`, border: `1px solid ${stat.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#f4f4f5", fontFamily: "'JetBrains Mono', monospace" }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── RECOMMENDATIONS ──────────────────────────────────── */}
        {recommendations.length > 0 && (
          <section>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f4f4f5" }}>Recommendations</h2>
              <p style={{ fontSize: 13, color: "#52525b", marginTop: 2 }}>
                Mapped from insights → prioritized by impact/effort ratio
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
              {recommendations.map((rec, i) => (
                <div key={rec.id} className="fade-in-up" style={{
                  animationDelay: `${i * 60}ms`,
                  background: "#141418", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14, padding: 20,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f4f4f5", lineHeight: 1.4 }}>{rec.title}</h3>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
                        background: `${IMPACT_COLORS[rec.impact]}15`, color: IMPACT_COLORS[rec.impact],
                        border: `1px solid ${IMPACT_COLORS[rec.impact]}30`,
                      }}>↑ {rec.impact}</span>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
                        background: "rgba(255,255,255,0.04)", color: "#71717a",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}>effort: {rec.effort}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "#a1a1aa", lineHeight: 1.6, marginBottom: 14 }}>{rec.rationale}</p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                    {rec.actions.map((action, ai) => (
                      <li key={ai} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                        <ArrowRight size={12} color="#8b5cf6" style={{ marginTop: 3, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: "#71717a", lineHeight: 1.5 }}>{action}</span>
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 11, color: "#52525b" }}>
                    Targets: <span style={{ color: "#8b5cf6" }}>{rec.metric}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#09090b" }}>
      <div style={{ width: 260, background: "#0d0d10", borderRight: "1px solid rgba(255,255,255,0.06)" }} />
      <main style={{ marginLeft: 260, flex: 1, padding: "32px 40px" }}>
        <div className="skeleton" style={{ height: 60, width: 300, marginBottom: 32 }} />
        {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 180, marginBottom: 16, borderRadius: 16 }} />)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginTop: 32 }}>
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 110 }} />)}
        </div>
      </main>
    </div>
  );
}
