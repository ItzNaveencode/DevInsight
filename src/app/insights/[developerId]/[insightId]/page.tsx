"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import {
  AlertTriangle, CheckCircle, Zap, Info, ChevronLeft,
  Shield, ArrowRight, Target, Layers,
} from "lucide-react";
import type { Insight }        from "@/lib/engines/insights";
import type { Recommendation } from "@/lib/engines/recommendations";
import type { Developer }      from "@/lib/data/seed";

const SEVERITY_CFG = {
  critical: { Icon: AlertTriangle, label: "Critical", badge: "badge-danger" },
  warning:  { Icon: Zap,           label: "Warning",  badge: "badge-warning" },
  info:     { Icon: Info,          label: "Info",     badge: "badge-neutral" },
  healthy:  { Icon: CheckCircle,   label: "Healthy",  badge: "badge-success" },
};

export default function InsightDetailPage({
  params,
}: {
  params: Promise<{ developerId: string; insightId: string }>;
}) {
  const { developerId, insightId } = use(params);

  const [developers,     setDevelopers]     = useState<Developer[]>([]);
  const [insight,        setInsight]        = useState<Insight | null>(null);
  const [recommendations,setRecommendations]= useState<Recommendation[]>([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/developers").then(r => r.json()),
      fetch(`/api/insights/${developerId}`).then(r => r.json()),
      fetch(`/api/recommendations/${developerId}`).then(r => r.json()),
    ]).then(([devs, ins, rec]) => {
      setDevelopers(devs.developers);
      const found = (ins.insights as Insight[]).find(i => i.id === insightId);
      setInsight(found ?? null);
      const linked = (rec.recommendations as Recommendation[]).filter(r => r.linkedInsightId === insightId);
      setRecommendations(linked);
      setLoading(false);
    });
  }, [developerId, insightId]);

  const developer = developers.find(d => d.developer_id === developerId);

  if (loading) return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <div className="hidden md:block w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-default)]" />
      <main className="flex-1 w-full md:ml-64 pt-16 md:pt-0">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <div className="h-6 w-48 bg-[var(--bg-tertiary)] rounded-md mb-8" />
          <div className="h-64 bg-[var(--bg-tertiary)] rounded-2xl mb-6 w-full" />
          <div className="h-48 bg-[var(--bg-tertiary)] rounded-2xl w-full" />
        </div>
      </main>
    </div>
  );

  if (!insight) return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar developers={developers} activeDeveloperId={developerId} />
      <main className="flex-1 w-full md:ml-64 pt-16 md:pt-0 flex flex-col items-center justify-center p-8">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4 text-center">Insight not found</h2>
        <Link href={`/dashboard/${developerId}`} className="text-[var(--accent-primary)] text-sm font-medium hover:underline">
          &larr; Back to dashboard
        </Link>
      </main>
    </div>
  );

  const cfg = SEVERITY_CFG[insight.severity];
  const SevIcon = cfg.Icon;
  const DIRECTION_ICONS: Record<string, string>  = { up: "↑", down: "↓", neutral: "→" };

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar developers={developers} activeDeveloperId={developerId} />
      
      <main className="flex-1 w-full md:ml-64 pt-16 md:pt-0">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

          {/* Breadcrumb */}
          <Link href={`/dashboard/${developerId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-8">
            <ChevronLeft size={16} />
            <span className="truncate">Back to {developer?.name}'s Dashboard</span>
          </Link>

          {/* Insight hero card */}
          <div className="hero-insight-card p-6 sm:p-10 mb-10 w-full min-w-0">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 mb-8">
              <div className={`${cfg.badge} w-14 h-14 rounded-xl shrink-0 flex items-center justify-center`}>
                <SevIcon size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-3 mb-3">
                  <span className={`${cfg.badge} px-2.5 py-1 rounded-md text-xs font-medium`}>{cfg.label}</span>
                  <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-light)]">
                    {insight.category}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] tracking-tight leading-snug break-words">
                  {insight.title}
                </h1>
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-xl p-6 mb-8">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                Explanation
              </div>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed break-words">
                {insight.description}
              </p>
            </div>

            {/* Two-column: signals + confidence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Signals */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 w-full min-w-0">
                <div className="flex items-center gap-2 mb-5">
                  <Layers size={18} className="text-[var(--text-muted)] shrink-0" />
                  <span className="text-base font-semibold text-[var(--text-primary)] truncate">
                    Supporting Signals
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {insight.signals.map((s, i) => {
                    const isUp = s.direction === "up";
                    const isDown = s.direction === "down";
                    const dirColor = isUp ? "var(--semantic-danger)" : isDown ? "var(--semantic-success)" : "var(--text-secondary)";
                    const bgClass = isUp ? "var(--semantic-danger-bg)" : isDown ? "var(--semantic-success-bg)" : "var(--bg-tertiary)";
                    return (
                      <div key={i} className="flex items-center justify-between gap-4 p-3 rounded-lg" style={{ background: bgClass }}>
                        <span className="text-sm text-[var(--text-primary)] font-medium truncate">{s.metric}</span>
                        <span className="font-mono text-sm sm:text-base font-semibold shrink-0" style={{ color: dirColor }}>
                          {DIRECTION_ICONS[s.direction]} {s.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Confidence */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 w-full min-w-0">
                <div className="flex items-center gap-2 mb-5">
                  <Shield size={18} className="text-[var(--text-muted)] shrink-0" />
                  <span className="text-base font-semibold text-[var(--text-primary)] truncate">
                    Confidence Analysis
                  </span>
                </div>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-sm text-[var(--text-secondary)] font-medium truncate">Confidence Score</span>
                    <span className="font-mono text-2xl font-semibold text-[var(--text-primary)] shrink-0">
                      {insight.confidence.toFixed(2)}
                    </span>
                  </div>
                  <div className="confidence-bar w-full">
                    <div className="confidence-fill" style={{ width: `${insight.confidence * 100}%` }} />
                  </div>
                </div>
                <div className="text-sm text-[var(--text-muted)] leading-relaxed break-words">
                  Confidence is derived from the deviation magnitude of each signal from the team baseline and historical average. Scores above 0.8 indicate a well-corroborated pattern.
                </div>
                <div className="mt-6">
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                    Affected Metrics
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {insight.affectedMetrics.length > 0
                      ? insight.affectedMetrics.map(m => (
                          <span key={m} className="text-xs font-medium px-3 py-1.5 rounded-md bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-light)] truncate max-w-full">
                            {m}
                          </span>
                        ))
                      : <span className="text-sm text-[var(--text-muted)] truncate">All metrics within healthy range</span>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="w-full min-w-0">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="p-1.5 bg-[var(--bg-tertiary)] rounded-md text-[var(--accent-primary)] shrink-0">
                  <Target size={20} />
                </div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] truncate">
                  Recommendations ({recommendations.length})
                </h2>
              </div>
              <div className="flex flex-col gap-5">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="premium-card p-6 sm:p-8 w-full min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] break-words">{rec.title}</h3>
                      <div className="flex gap-2 shrink-0">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium badge-${rec.impact === 'high' ? 'danger' : rec.impact === 'medium' ? 'warning' : 'success'}`}>
                          Impact: {rec.impact}
                        </span>
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium badge-neutral border border-[var(--border-light)]">
                          Effort: {rec.effort}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed mb-6 break-words">{rec.rationale}</p>
                    <div className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-4">
                      Action Steps
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {rec.actions.map((action, ai) => (
                        <div key={ai} className="flex items-start gap-3 p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-light)] w-full min-w-0">
                          <ArrowRight size={16} className="text-[var(--text-muted)] mt-0.5 shrink-0" />
                          <span className="text-sm text-[var(--text-primary)] leading-relaxed break-words">{action}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 pt-4 border-t border-[var(--border-default)] text-sm text-[var(--text-secondary)] flex flex-wrap gap-2 truncate">
                      Target metric: <span className="text-[var(--accent-primary)] font-semibold truncate">{rec.metric}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
