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
  color?: string;
  subtitle?: string;
}

export default function MetricCard({
  label, value, unit, delta, deltaUnit, lowerIsBetter = false,
  icon, color = "#8b5cf6", subtitle,
}: MetricCardProps) {
  const isPositive = delta !== undefined
    ? (lowerIsBetter ? delta < 0 : delta > 0)
    : null;
  const isNeutral = delta === undefined || Math.abs(delta) < 0.5;

  return (
    <div className="metric-card" style={{ position: "relative" }}>
      {/* Color strip */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: color, borderRadius: "14px 14px 0 0", opacity: 0.7,
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </span>
        {icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${color}18`,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `1px solid ${color}30`,
          }}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: "#f4f4f5", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "-1px" }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 14, color: "#71717a", fontWeight: 500 }}>{unit}</span>
        )}
      </div>

      {/* Delta */}
      {delta !== undefined && !isNeutral && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600,
          background: isPositive ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
          color: isPositive ? "#10b981" : "#f43f5e",
          border: `1px solid ${isPositive ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.25)"}`,
        }}>
          {isPositive ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
          {Math.abs(delta).toFixed(1)}{deltaUnit} vs prev period
        </div>
      )}
      {isNeutral && delta !== undefined && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 500,
          background: "rgba(255,255,255,0.05)", color: "#71717a",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <Minus size={12} /> Stable
        </div>
      )}

      {subtitle && (
        <div style={{ fontSize: 11, color: "#52525b", marginTop: 6 }}>{subtitle}</div>
      )}
    </div>
  );
}
