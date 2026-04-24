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
      <div className="hidden md:block w-[260px] bg-[var(--bg-secondary)] border-r border-[var(--border-default)]" />
      <main className="flex-1 w-full pt-20 px-4 md:pt-[40px] md:px-[40px] md:ml-[260px]">
        <div className="h-[24px] w-[200px] bg-[var(--bg-tertiary)] rounded-md mb-[32px]" />
        <div className="h-[280px] bg-[var(--bg-tertiary)] rounded-[16px] mb-[24px] w-full" />
        <div className="h-[200px] bg-[var(--bg-tertiary)] rounded-[16px] w-full" />
      </main>
    </div>
  );

  if (!insight) return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar developers={developers} activeDeveloperId={developerId} />
      <main className="flex-1 w-full md:ml-[260px] pt-20 md:pt-0 flex flex-col items-center justify-center p-8">
        <div className="text-[48px] mb-[16px]">🔍</div>
        <h2 className="text-[20px] font-semibold text-[var(--text-primary)] mb-[8px] text-center">Insight not found</h2>
        <Link href={`/dashboard/${developerId}`} className="text-[var(--accent-primary)] text-[14px] font-medium hover:underline">
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
      
      <main className="flex-1 w-full pt-20 px-4 pb-10 md:pt-[40px] md:px-[40px] md:pb-[40px] md:ml-[260px] md:max-w-[calc(100vw-260px)] min-w-0">

        {/* Breadcrumb */}
        <Link href={`/dashboard/${developerId}`} className="inline-flex items-center gap-[6px] text-[14px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-[32px]">
          <ChevronLeft size={16} />
          <span className="truncate">Back to {developer?.name}'s Dashboard</span>
        </Link>

        {/* Insight hero card */}
        <div className="hero-insight-card p-6 md:p-[40px] mb-[40px] w-full min-w-0">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-5 md:gap-[20px] mb-8 md:mb-[32px]">
            <div className={`${cfg.badge} w-[56px] h-[56px] rounded-[12px] shrink-0 flex items-center justify-center`}>
              <SevIcon size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-[12px] mb-[12px]">
                <span className={`${cfg.badge} px-[10px] py-[4px] rounded-[6px] text-[12px] font-medium`}>{cfg.label}</span>
                <span className="px-[10px] py-[4px] rounded-[6px] text-[12px] font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-light)]">
                  {insight.category}
                </span>
              </div>
              <h1 className="text-[28px] font-semibold text-[var(--text-primary)] tracking-[-0.5px] leading-[1.3] break-words">
                {insight.title}
              </h1>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border-light)] rounded-[12px] p-[24px] mb-[32px]">
            <div className="text-[13px] font-semibold text-[var(--text-primary)] mb-[12px]">
              Explanation
            </div>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.6] break-words">
              {insight.description}
            </p>
          </div>

          {/* Two-column: signals + confidence */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">

            {/* Signals */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[12px] p-[24px] w-full min-w-0">
              <div className="flex items-center gap-[8px] mb-[20px]">
                <Layers size={18} className="text-[var(--text-muted)] shrink-0" />
                <span className="text-[15px] font-semibold text-[var(--text-primary)] truncate">
                  Supporting Signals
                </span>
              </div>
              <div className="flex flex-col gap-[12px]">
                {insight.signals.map((s, i) => {
                  const isUp = s.direction === "up";
                  const isDown = s.direction === "down";
                  const dirColor = isUp ? "var(--semantic-danger)" : isDown ? "var(--semantic-success)" : "var(--text-secondary)";
                  const bgClass = isUp ? "var(--semantic-danger-bg)" : isDown ? "var(--semantic-success-bg)" : "var(--bg-tertiary)";
                  return (
                    <div key={i} className="flex items-center justify-between gap-[16px] px-[16px] py-[12px] rounded-[8px]" style={{ background: bgClass }}>
                      <span className="text-[14px] text-[var(--text-primary)] font-medium truncate">{s.metric}</span>
                      <span className="font-mono text-[15px] font-semibold shrink-0" style={{ color: dirColor }}>
                        {DIRECTION_ICONS[s.direction]} {s.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confidence */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-[12px] p-[24px] w-full min-w-0">
              <div className="flex items-center gap-[8px] mb-[20px]">
                <Shield size={18} className="text-[var(--text-muted)] shrink-0" />
                <span className="text-[15px] font-semibold text-[var(--text-primary)] truncate">
                  Confidence Analysis
                </span>
              </div>
              <div className="mb-[24px]">
                <div className="flex justify-between items-center mb-[10px]">
                  <span className="text-[14px] text-[var(--text-secondary)] font-medium truncate">Confidence Score</span>
                  <span className="font-mono text-[22px] font-semibold text-[var(--text-primary)] shrink-0">
                    {insight.confidence.toFixed(2)}
                  </span>
                </div>
                <div className="confidence-bar w-full">
                  <div className="confidence-fill" style={{ width: `${insight.confidence * 100}%` }} />
                </div>
              </div>
              <div className="text-[14px] text-[var(--text-muted)] leading-[1.6] break-words">
                Confidence is derived from the deviation magnitude of each signal from the team baseline and historical average. Scores above 0.8 indicate a well-corroborated pattern.
              </div>
              <div className="mt-[24px]">
                <div className="text-[13px] font-semibold text-[var(--text-primary)] mb-[12px]">
                  Affected Metrics
                </div>
                <div className="flex flex-wrap gap-[8px]">
                  {insight.affectedMetrics.length > 0
                    ? insight.affectedMetrics.map(m => (
                        <span key={m} className="text-[12px] font-medium px-[12px] py-[6px] rounded-[6px] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border-light)] truncate max-w-full">
                          {m}
                        </span>
                      ))
                    : <span className="text-[13px] text-[var(--text-muted)] truncate">All metrics within healthy range</span>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="w-full min-w-0">
            <div className="flex items-center gap-[10px] mb-[24px]">
              <div className="p-[6px] bg-[var(--bg-tertiary)] rounded-[6px] text-[var(--accent-primary)] shrink-0">
                <Target size={20} />
              </div>
              <h2 className="text-[20px] font-semibold text-[var(--text-primary)] truncate">
                Recommendations ({recommendations.length})
              </h2>
            </div>
            <div className="flex flex-col gap-[20px]">
              {recommendations.map((rec) => (
                <div key={rec.id} className="premium-card p-6 md:p-[32px] w-full min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-[16px] mb-[16px]">
                    <h3 className="text-[18px] font-semibold text-[var(--text-primary)] break-words">{rec.title}</h3>
                    <div className="flex gap-[8px] shrink-0">
                      <span className={`px-[10px] py-[4px] rounded-[6px] text-[12px] font-medium badge-${rec.impact === 'high' ? 'danger' : rec.impact === 'medium' ? 'warning' : 'success'}`}>
                        Impact: {rec.impact}
                      </span>
                      <span className="px-[10px] py-[4px] rounded-[6px] text-[12px] font-medium badge-neutral border border-[var(--border-light)]">
                        Effort: {rec.effort}
                      </span>
                    </div>
                  </div>
                  <p className="text-[15px] text-[var(--text-secondary)] leading-[1.6] mb-[24px] break-words">{rec.rationale}</p>
                  <div className="text-[13px] font-semibold text-[var(--text-primary)] uppercase tracking-[0.05em] mb-[16px]">
                    Action Steps
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-[16px]">
                    {rec.actions.map((action, ai) => (
                      <div key={ai} className="flex items-start gap-[12px] p-[16px] rounded-[8px] bg-[var(--bg-tertiary)] border border-[var(--border-light)] w-full min-w-0">
                        <ArrowRight size={16} className="text-[var(--text-muted)] mt-[2px] shrink-0" />
                        <span className="text-[14px] text-[var(--text-primary)] leading-[1.5] font-medium break-words">{action}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-[32px] pt-[16px] border-t border-[var(--border-default)] text-[14px] text-[var(--text-secondary)] flex flex-wrap gap-2 truncate">
                    Target metric: <span className="text-[var(--accent-primary)] font-semibold truncate">{rec.metric}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
