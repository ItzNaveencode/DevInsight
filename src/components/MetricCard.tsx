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
    <div className="premium-card p-6 md:p-[24px] w-full min-w-0 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 md:mb-[12px] gap-2">
        <span className="text-[14px] font-medium text-[var(--text-secondary)] truncate">
          {label}
        </span>
        {icon && (
          <div className="text-[var(--text-muted)] flex-shrink-0">
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-[4px] mb-3 md:mb-[12px] truncate">
        <span className="text-[32px] font-semibold text-[var(--text-primary)] tracking-tight truncate">
          {value}
        </span>
        {unit && (
          <span className="text-[14px] font-medium text-[var(--text-muted)] shrink-0">{unit}</span>
        )}
      </div>

      {/* Delta */}
      <div className="flex items-center flex-wrap gap-2">
        {delta !== undefined && !isNeutral && (
          <div className="inline-flex items-center gap-[6px] px-[8px] py-[4px] rounded-[6px] text-[13px] font-medium shrink-0" 
            style={{
              background: isPositive ? "var(--semantic-success-bg)" : "var(--semantic-danger-bg)",
              color: isPositive ? "var(--semantic-success)" : "var(--semantic-danger)",
            }}>
            {isPositive ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
            <span className="truncate">{Math.abs(delta).toFixed(1)}{deltaUnit} vs prev</span>
          </div>
        )}
        {isNeutral && delta !== undefined && (
          <div className="inline-flex items-center gap-[6px] px-[8px] py-[4px] rounded-[6px] text-[13px] font-medium shrink-0"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
            <Minus size={14} /> 
            <span>Stable</span>
          </div>
        )}
      </div>

      {subtitle && (
        <div className="text-[13px] text-[var(--text-muted)] mt-3 md:mt-[12px] truncate">{subtitle}</div>
      )}
    </div>
  );
}
