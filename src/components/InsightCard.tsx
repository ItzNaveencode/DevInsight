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
    <div
      className={isHero ? "hero-insight-card" : "premium-card"}
      style={{
        padding: 24,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: "var(--bg-tertiary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: cfg.color
        }}>
          <Icon size={20} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Insight
            </span>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>
            {insight.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
        {insight.description}
      </p>

      {/* Signals */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
          Supporting Signals
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {insight.signals.map((signal, i) => {
            const isUp = signal.direction === "up";
            const isDown = signal.direction === "down";
            // Map signals to strict semantic colors
            const isPositive = isDown; // Assuming lower is better mostly
            const isNegative = isUp;
            const fgClass = isNegative ? "var(--semantic-danger)" : isPositive ? "var(--semantic-success)" : "var(--text-secondary)";
            const bgClass = isNegative ? "var(--semantic-danger-bg)" : isPositive ? "var(--semantic-success-bg)" : "var(--bg-tertiary)";
            
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: bgClass, borderRadius: 6, padding: "6px 12px",
              }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 500 }}>{signal.metric}</span>
                <span className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: fgClass }}>
                  {DIRECTION_ICONS[signal.direction]} {signal.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confidence */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Shield size={14} color="var(--text-muted)" />
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>
              Confidence Score
            </span>
          </div>
          <span className="font-mono" style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            {insight.confidence.toFixed(2)}
          </span>
        </div>
        <div className="confidence-bar">
          <div className="confidence-fill" style={{ width: `${insight.confidence * 100}%` }} />
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/insights/${developerId}/${insight.id}`}
        className="btn-primary"
      >
        View Recommendations
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
