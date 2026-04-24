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
  critical: { icon: AlertTriangle, label: "Critical"  },
  warning:  { icon: Zap,           label: "Warning"   },
  info:     { icon: Info,          label: "Info"      },
  healthy:  { icon: CheckCircle,   label: "Healthy"   },
};

const DIRECTION_ICONS: Record<string, string> = { up: "↑", down: "↓", neutral: "→" };

export default function InsightCard({ insight, developerId, index = 0 }: InsightCardProps) {
  const cfg = SEVERITY_CONFIG[insight.severity];
  const Icon = cfg.icon;

  return (
    <div
      className="professional-card"
      style={{
        padding: 24,
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
        <div className={`severity-${insight.severity}`} style={{
          width: 44, height: 44, borderRadius: 8, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={20} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span className={`tag severity-${insight.severity}`}>
              {cfg.label}
            </span>
            <span style={{
              fontSize: 12, color: "var(--text-muted)", background: "var(--bg-subtle)",
              padding: "2px 8px", borderRadius: 6,
            }}>
              {insight.category}
            </span>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-main)", lineHeight: 1.4 }}>
            {insight.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
        {insight.description}
      </p>

      {/* Signals */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 10 }}>
          Supporting Signals
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {insight.signals.map((signal, i) => {
            const isUp = signal.direction === "up";
            const isDown = signal.direction === "down";
            const dirColor = isUp ? "var(--status-critical-fg)" : isDown ? "var(--status-healthy-fg)" : "var(--text-muted)";
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "var(--bg-subtle)", borderRadius: 6, padding: "6px 12px",
              }}>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{signal.metric}</span>
                <span style={{
                  fontSize: 13, fontWeight: 600, color: dirColor,
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
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
            <Shield size={14} color="var(--text-subtle)" />
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>
              Confidence Score
            </span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)", fontFamily: "'JetBrains Mono', monospace" }}>
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
        className={`severity-${insight.severity}`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500,
          textDecoration: "none", transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
      >
        View Recommendations
        <ChevronRight size={14} />
      </Link>
    </div>
  );
}
