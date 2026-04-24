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
  critical: { icon: AlertTriangle, color: "#f43f5e", bg: "rgba(244,63,94,0.08)", border: "rgba(244,63,94,0.2)",  label: "Critical"  },
  warning:  { icon: Zap,           color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", label: "Warning"   },
  info:     { icon: Info,           color: "#60a5fa", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", label: "Info"      },
  healthy:  { icon: CheckCircle,    color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", label: "Healthy"   },
};

const DIRECTION_ICONS: Record<string, string> = { up: "↑", down: "↓", neutral: "→" };
const DIRECTION_COLORS: Record<string, string> = { up: "#f43f5e", down: "#10b981", neutral: "#71717a" };

export default function InsightCard({ insight, developerId, index = 0 }: InsightCardProps) {
  const cfg = SEVERITY_CONFIG[insight.severity];
  const Icon = cfg.icon;

  return (
    <div
      className="fade-in-up"
      style={{
        background: "#141418",
        border: `1px solid ${cfg.border}`,
        borderRadius: 16,
        padding: 24,
        animationDelay: `${index * 80}ms`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: -40, right: -40,
        width: 120, height: 120, borderRadius: "50%",
        background: cfg.color, opacity: 0.04,
        filter: "blur(40px)", pointerEvents: "none",
      }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: cfg.bg, border: `1px solid ${cfg.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={18} color={cfg.color} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span className={`tag severity-${insight.severity}`}>
              {cfg.label}
            </span>
            <span style={{
              fontSize: 11, color: "#52525b", background: "rgba(255,255,255,0.04)",
              padding: "2px 8px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.07)",
            }}>
              {insight.category}
            </span>
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f4f4f5", lineHeight: 1.3 }}>
            {insight.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.65, marginBottom: 20 }}>
        {insight.description}
      </p>

      {/* Signals */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>
          Supporting Signals
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {insight.signals.map((signal, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "6px 12px",
            }}>
              <span style={{ fontSize: 12, color: "#71717a" }}>{signal.metric}</span>
              <span style={{
                fontSize: 13, fontWeight: 700, color: DIRECTION_COLORS[signal.direction],
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {DIRECTION_ICONS[signal.direction]} {signal.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Shield size={12} color="#71717a" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Confidence Score
            </span>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#f4f4f5", fontFamily: "'JetBrains Mono', monospace" }}>
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
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          background: cfg.bg, color: cfg.color,
          border: `1px solid ${cfg.border}`,
          textDecoration: "none", transition: "all 0.15s",
        }}
      >
        View Recommendations
        <ChevronRight size={14} />
      </Link>
    </div>
  );
}
