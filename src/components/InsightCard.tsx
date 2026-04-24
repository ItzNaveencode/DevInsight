"use client";
import Link from "next/link";
import { AlertTriangle, CheckCircle, Info, Zap, ChevronRight, Shield } from "lucide-react";
import type { Insight } from "@/lib/engines/insights";

interface InsightCardProps {
  insight: Insight;
  developerId: string;
  index?: number;
}

const SEVERITY_CONFIG = {
  critical: { icon: AlertTriangle, badge: "badge-danger",  color: "var(--semantic-danger)" },
  warning:  { icon: Zap,           badge: "badge-warning", color: "var(--semantic-warning)" },
  info:     { icon: Info,          badge: "badge-neutral", color: "var(--text-secondary)" },
  healthy:  { icon: CheckCircle,   badge: "badge-success", color: "var(--semantic-success)" },
};

const DIRECTION_ICONS: Record<string, string> = { up: "↑", down: "↓", neutral: "→" };

export default function InsightCard({ insight, developerId, index = 0 }: InsightCardProps) {
  const cfg = SEVERITY_CONFIG[insight.severity];
  const Icon = cfg.icon;
  const isHero = index === 0;

  return (
    <div className={`w-full min-w-0 p-6 md:p-[24px] flex flex-col ${isHero ? "hero-insight-card" : "premium-card"}`}>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 md:gap-[16px] mb-4 md:mb-[16px]">
        <div className="w-11 h-11 md:w-[44px] md:h-[44px] rounded-xl flex-shrink-0 bg-[var(--bg-tertiary)] flex items-center justify-center" style={{ color: cfg.color }}>
          <Icon size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 md:mb-[6px] flex-wrap">
            <span className="text-[13px] font-medium text-[var(--text-muted)] uppercase tracking-[0.05em]">
              Insight
            </span>
          </div>
          <h3 className="text-[18px] font-semibold text-[var(--text-primary)] leading-[1.4] break-words">
            {insight.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-[14px] text-[var(--text-secondary)] leading-[1.6] mb-5 md:mb-[20px] break-words">
        {insight.description}
      </p>

      {/* Signals */}
      <div className="mb-6 md:mb-[24px]">
        <div className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-[10px]">
          Supporting Signals
        </div>
        <div className="flex flex-wrap gap-[8px]">
          {insight.signals.map((signal, i) => {
            const isUp = signal.direction === "up";
            const isDown = signal.direction === "down";
            const isPositive = isDown; 
            const isNegative = isUp;
            const fgClass = isNegative ? "var(--semantic-danger)" : isPositive ? "var(--semantic-success)" : "var(--text-secondary)";
            const bgClass = isNegative ? "var(--semantic-danger-bg)" : isPositive ? "var(--semantic-success-bg)" : "var(--bg-tertiary)";
            
            return (
              <div key={i} className="flex items-center gap-[6px] rounded-[6px] px-[12px] py-[6px]" style={{ background: bgClass }}>
                <span className="text-[13px] text-[var(--text-secondary)] font-medium max-w-[150px] truncate sm:max-w-none">{signal.metric}</span>
                <span className="font-mono text-[13px] font-semibold whitespace-nowrap" style={{ color: fgClass }}>
                  {DIRECTION_ICONS[signal.direction]} {signal.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confidence */}
      <div className="mb-6 md:mb-[24px]">
        <div className="flex justify-between items-center mb-[8px]">
          <div className="flex items-center gap-[6px]">
            <Shield size={14} color="var(--text-muted)" />
            <span className="text-[13px] font-medium text-[var(--text-muted)]">
              Confidence Score
            </span>
          </div>
          <span className="font-mono text-[14px] font-semibold text-[var(--text-primary)]">
            {insight.confidence.toFixed(2)}
          </span>
        </div>
        <div className="confidence-bar">
          <div className="confidence-fill" style={{ width: `${insight.confidence * 100}%` }} />
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto">
        <Link
          href={`/insights/${developerId}/${insight.id}`}
          className="btn-primary w-full sm:w-auto justify-center"
        >
          View Recommendations
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
