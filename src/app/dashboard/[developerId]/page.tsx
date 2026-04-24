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
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar developers={developers} activeDeveloperId={developerId} />

      <main className="flex-1 w-full md:ml-64 pt-16 md:pt-0">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          
          {/* Page Header */}
          <div className="mb-8 pb-6 border-b border-[var(--border-default)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-xl font-semibold text-[var(--text-primary)] shrink-0">
                  {developer?.avatar}
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight truncate">
                    {developer?.name}
                  </h1>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 items-center mt-1 text-sm text-[var(--text-secondary)]">
                    <span className="truncate">{developer?.role}</span>
                    <span className="text-[var(--border-light)] hidden sm:inline">|</span>
                    <span className="truncate">{developer?.team_name} Team</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-default)] w-fit">
                <RefreshCw size={14} />
                Synced Just Now
              </div>
            </div>
          </div>

          {/* ── INSIGHTS (primary) ──────────────────────────────── */}
          <section className="mb-10">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Active Insights</h2>
            </div>
            <div className="flex flex-col gap-4">
              {insights.map((insight, i) => (
                <div key={insight.id} className="w-full min-w-0">
                  <InsightCard insight={insight} developerId={developerId} index={i} />
                </div>
              ))}
            </div>
          </section>

          {/* ── METRICS GRID (secondary) ──────────────────────── */}
          <section className="mb-10">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">Metrics Overview</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {[
                { label: "Total Issues Closed",  value: metrics?.totalIssues,         icon: <CheckCircle2 size={16} /> },
                { label: "Avg PR Size",           value: metrics?.avgPRSize,           icon: <Layers size={16} /> },
                { label: "Avg Time to Review",    value: `${metrics?.avgReviewWait}h`, icon: <AlertCircle size={16} /> },
              ].map((stat) => (
                <div key={stat.label} className="premium-card p-5 flex items-center gap-4 w-full min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-muted)] flex items-center justify-center shrink-0">
                    {stat.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-[var(--text-secondary)] font-medium mb-1 truncate">
                      {stat.label}
                    </div>
                    <div className="font-mono text-xl font-semibold text-[var(--text-primary)] truncate">
                      {stat.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── RECOMMENDATIONS ──────────────────────────────────── */}
          {recommendations.length > 0 && (
            <section className="mb-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="p-1.5 bg-[var(--bg-tertiary)] rounded-md text-[var(--accent-primary)] shrink-0">
                  <Target size={20} />
                </div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] truncate">Recommendations</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="premium-card p-6 w-full min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <h3 className="text-base font-semibold text-[var(--text-primary)] break-words">{rec.title}</h3>
                      <div className="flex gap-2 shrink-0">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium badge-${rec.impact === 'high' ? 'danger' : rec.impact === 'medium' ? 'warning' : 'success'}`}>
                          Impact: {rec.impact}
                        </span>
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium badge-neutral border border-[var(--border-light)]">
                          Effort: {rec.effort}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">{rec.rationale}</p>
                    <ul className="flex flex-col gap-3 list-none">
                      {rec.actions.map((action, ai) => (
                        <li key={ai} className="flex items-start gap-3">
                          <ArrowRight size={16} className="text-[var(--text-muted)] mt-0.5 shrink-0" />
                          <span className="text-sm text-[var(--text-primary)] leading-relaxed">{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <div className="hidden md:block w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-default)]" />
      <main className="flex-1 w-full md:ml-64 pt-16 md:pt-0">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="h-14 w-64 bg-[var(--bg-tertiary)] rounded-lg mb-10" />
          {[1, 2].map(i => <div key={i} className="h-48 bg-[var(--bg-tertiary)] mb-4 rounded-2xl w-full" />)}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
            {[1,2,3,4,5].map(i => <div key={i} className="h-28 bg-[var(--bg-tertiary)] rounded-2xl w-full" />)}
          </div>
        </div>
      </main>
    </div>
  );
}
