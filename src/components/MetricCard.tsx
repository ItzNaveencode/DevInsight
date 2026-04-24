"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaUnit?: string;
  lowerIsBetter?: boolean;
  icon?: React.ReactNode;
  color?: string; // We'll map this to standard if passed, but typically we can ignore it or use a default
  subtitle?: string;
}

export default function MetricCard({
  label, value, unit, delta, deltaUnit, lowerIsBetter = false,
  icon, subtitle,
}: MetricCardProps) {
  const isPositive = delta !== undefined
    ? (lowerIsBetter ? delta < 0 : delta > 0)
    : null;
  const isNeutral = delta === undefined || Math.abs(delta) < 0.5;

  return (
    <div className="professional-card" style={{ position: "relative", padding: "20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>
          {label}
        </span>
        {icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: "var(--bg-subtle)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: "var(--text-main)", letterSpacing: "-0.5px" }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>{unit}</span>
        )}
      </div>

      {/* Delta */}
      {delta !== undefined && !isNeutral && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 500,
          background: isPositive ? "var(--status-healthy-bg)" : "var(--status-critical-bg)",
          color: isPositive ? "var(--status-healthy-fg)" : "var(--status-critical-fg)",
        }}>
          {isPositive ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
          {Math.abs(delta).toFixed(1)}{deltaUnit} vs prev
        </div>
      )}
      {isNeutral && delta !== undefined && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 500,
          background: "var(--bg-subtle)", color: "var(--text-muted)",
        }}>
          <Minus size={14} /> Stable
        </div>
      )}

      {subtitle && (
        <div style={{ fontSize: 12, color: "var(--text-subtle)", marginTop: 8 }}>{subtitle}</div>
      )}
    </div>
  );
}
