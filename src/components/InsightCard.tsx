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
    <div className={`w-full min-w-0 flex flex-col p-6 ${isHero ? "hero-insight-card" : "premium-card"}`}>
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
        <div className="w-11 h-11 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center shrink-0" style={{ color: cfg.color }}>
          <Icon size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              Insight
            </span>
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] leading-snug break-words">
            {insight.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 break-words">
        {insight.description}
      </p>

      {/* Grid container for Signals & Confidence to stack on mobile, row on tablet+ */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-6">
        {/* Signals */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2.5">
            Supporting Signals
          </div>
          <div className="flex flex-wrap gap-2">
            {insight.signals.map((signal, i) => {
              const isUp = signal.direction === "up";
              const isDown = signal.direction === "down";
              const isPositive = isDown; // Assuming lower is better mostly
              const isNegative = isUp;
              
              const fgClass = isNegative ? "var(--semantic-danger)" : isPositive ? "var(--semantic-success)" : "var(--text-secondary)";
              const bgClass = isNegative ? "var(--semantic-danger-bg)" : isPositive ? "var(--semantic-success-bg)" : "var(--bg-tertiary)";
              
              return (
                <div key={i} className="flex items-center gap-1.5 rounded-md px-3 py-1.5" style={{ background: bgClass }}>
                  <span className="text-sm text-[var(--text-secondary)] font-medium truncate max-w-[120px] sm:max-w-none">{signal.metric}</span>
                  <span className="font-mono text-sm font-semibold whitespace-nowrap" style={{ color: fgClass }}>
                    {DIRECTION_ICONS[signal.direction]} {signal.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confidence */}
        <div className="w-full lg:w-48 shrink-0">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
              <Shield size={14} />
              <span className="text-xs font-medium">Confidence</span>
            </div>
            <span className="font-mono text-sm font-semibold text-[var(--text-primary)]">
              {insight.confidence.toFixed(2)}
            </span>
          </div>
          <div className="confidence-bar w-full">
            <div className="confidence-fill" style={{ width: `${insight.confidence * 100}%` }} />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-auto pt-2">
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
