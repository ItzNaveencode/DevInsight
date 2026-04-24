"use client";

import { useEffect, useState, use } from "react";
import Sidebar from "@/components/Sidebar";
import MetricCard from "@/components/MetricCard";
import InsightCard from "@/components/InsightCard";
import {
  Clock, GitPullRequest, Rocket, Bug, Timer,
  RefreshCw, CheckCircle2, Layers, AlertCircle, Target, ArrowRight
} from "lucide-react";
import type { ComputedMetrics } from "@/lib/engines/metrics";
import type { Insight }         from "@/lib/engines/insights";
import type { Recommendation }  from "@/lib/engines/recommendations";
import type { TrendDelta }      from "@/lib/engines/trends";
import type { Developer }       from "@/lib/data/seed";

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
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Sidebar developers={developers} activeDeveloperId={developerId} />

      <main style={{ marginLeft: 260, flex: 1, padding: "40px", maxWidth: "calc(100vw - 260px)" }}>
        {/* Page Header (Top Bar substitute) */}
        <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: "1px solid var(--border-default)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                background: "var(--bg-tertiary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 600, color: "var(--text-primary)",
              }}>
                {developer?.avatar}
              </div>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
                  {developer?.name}
                </h1>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
                  <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{developer?.role}</span>
                  <span style={{ color: "var(--border-light)" }}>|</span>
                  <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>{developer?.team_name} Team</span>
                </div>
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
              background: "var(--bg-secondary)", color: "var(--text-secondary)",
              border: "1px solid var(--border-default)",
            }}>
              <RefreshCw size={14} />
              Synced Just Now
            </div>
          </div>
        </div>

        {/* ── INSIGHTS (primary) ──────────────────────────────── */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)" }}>Active Insights</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {insights.map((insight, i) => (
              <InsightCard key={insight.id} insight={insight} developerId={developerId} index={i} />
            ))}
          </div>
        </section>

        {/* ── METRICS GRID (secondary) ──────────────────────── */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)" }}>Metrics Overview</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
            <MetricCard
              label="Lead Time"
              value={metrics?.leadTime ?? 0}
              unit="h"
              delta={getDelta("lead")?.delta}
              deltaUnit="h"
              lowerIsBetter
              icon={<Clock size={16} />}
              subtitle={`Team avg: ${teamAverages.leadTime}h`}
            />
            <MetricCard
              label="Cycle Time"
              value={metrics?.cycleTime ?? 0}
              unit="h"
              delta={getDelta("cycle")?.delta}
              deltaUnit="h"
              lowerIsBetter
              icon={<Timer size={16} />}
              subtitle={`Team avg: ${teamAverages.cycleTime}h`}
            />
            <MetricCard
              label="PR Throughput"
              value={metrics?.prThroughput ?? 0}
              unit="PRs"
              delta={getDelta("throughput")?.delta}
              deltaUnit=""
              lowerIsBetter={false}
              icon={<GitPullRequest size={16} />}
              subtitle={`Team avg: ${teamAverages.prThroughput}`}
            />
            <MetricCard
              label="Deploy Freq."
              value={metrics?.deployFrequency ?? 0}
              unit="/30d"
              delta={getDelta("deploy")?.delta}
              deltaUnit=""
              lowerIsBetter={false}
              icon={<Rocket size={16} />}
              subtitle={`${metrics?.failedDeploys ?? 0} failed deploys`}
            />
            <MetricCard
              label="Bug Rate"
              value={metrics?.bugRate ?? 0}
              unit="%"
              delta={getDelta("bug")?.delta}
              deltaUnit="%"
              lowerIsBetter
              icon={<Bug size={16} />}
              subtitle={`${metrics?.escapedBugs ?? 0} escaped bugs`}
            />
          </div>

          {/* Secondary stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 16 }}>
            {[
              { label: "Total Issues Closed",  value: metrics?.totalIssues,         icon: <CheckCircle2 size={16} /> },
              { label: "Avg PR Size",           value: metrics?.avgPRSize,           icon: <Layers size={16} /> },
              { label: "Avg Time to Review",    value: `${metrics?.avgReviewWait}h`, icon: <AlertCircle size={16} /> },
            ].map((stat) => (
              <div key={stat.label} className="premium-card" style={{ padding: "20px", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8,
                  background: "var(--bg-tertiary)", color: "var(--text-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {stat.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500, marginBottom: 4 }}>
                    {stat.label}
                  </div>
                  <div className="font-mono" style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)" }}>
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
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ padding: 6, background: "var(--bg-tertiary)", borderRadius: 6, color: "var(--accent-primary)" }}>
                <Target size={20} />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)" }}>Recommendations</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {recommendations.map((rec) => (
                <div key={rec.id} className="premium-card" style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>{rec.title}</h3>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <span className={`badge-${rec.impact === 'high' ? 'danger' : rec.impact === 'medium' ? 'warning' : 'success'}`} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                        Impact: {rec.impact}
                      </span>
                      <span className="badge-neutral" style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                        Effort: {rec.effort}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>{rec.rationale}</p>
                  <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                    {rec.actions.map((action, ai) => (
                      <li key={ai} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <ArrowRight size={16} color="var(--text-muted)" style={{ marginTop: 2, flexShrink: 0 }} />
                        <span style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.5 }}>{action}</span>
                      </li>
                    ))}
                  </ul>
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
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-primary)" }}>
      <div style={{ width: 260, background: "var(--bg-secondary)", borderRight: "1px solid var(--border-default)" }} />
      <main style={{ marginLeft: 260, flex: 1, padding: "40px" }}>
        <div style={{ height: 60, width: 300, background: "var(--bg-tertiary)", borderRadius: 8, marginBottom: 40 }} />
        {[1, 2].map(i => <div key={i} style={{ height: 180, background: "var(--bg-tertiary)", marginBottom: 16, borderRadius: 16 }} />)}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginTop: 32 }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ height: 110, background: "var(--bg-tertiary)", borderRadius: 16 }} />)}
        </div>
      </main>
    </div>
  );
}
