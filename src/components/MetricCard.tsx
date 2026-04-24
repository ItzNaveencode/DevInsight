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
    <div className="premium-card" style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>
          {label}
        </span>
        {icon && (
          <div style={{ color: "var(--text-muted)" }}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 12 }}>
        <span style={{ fontSize: 32, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>{unit}</span>
        )}
      </div>

      {/* Delta */}
      {delta !== undefined && !isNeutral && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 8px", borderRadius: 6, fontSize: 13, fontWeight: 500,
          background: isPositive ? "var(--semantic-success-bg)" : "var(--semantic-danger-bg)",
          color: isPositive ? "var(--semantic-success)" : "var(--semantic-danger)",
        }}>
          {isPositive ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
          {Math.abs(delta).toFixed(1)}{deltaUnit} vs prev
        </div>
      )}
      {isNeutral && delta !== undefined && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "4px 8px", borderRadius: 6, fontSize: 13, fontWeight: 500,
          background: "var(--bg-tertiary)", color: "var(--text-secondary)",
        }}>
          <Minus size={14} /> Stable
        </div>
      )}

      {subtitle && (
        <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 12 }}>{subtitle}</div>
      )}
    </div>
  );
}
