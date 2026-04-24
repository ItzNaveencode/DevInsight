import { computeMetrics, getBaseline } from "@/lib/engines/metrics";

export interface TrendPoint {
  week: string;
  leadTime: number;
  cycleTime: number;
  prThroughput: number;
  deployFrequency: number;
  bugRate: number;
}

export interface TrendDelta {
  metric: string;
  current: number;
  previous: number;
  delta: number;
  deltaPercent: number;
  direction: "improved" | "regressed" | "stable";
  unit: string;
}

// ─── Generate synthetic 8-week trend data ─────────────────────────────────────
// In production this would query historical metric snapshots from DB
export function computeTrends(developerId: string): TrendPoint[] {
  const current = computeMetrics(developerId);
  if (!current) return [];

  // Build 8 weeks of data interpolating from baseline to current
  const baseline = getBaseline(developerId);
  if (!baseline) return [];

  const weeks: TrendPoint[] = [];
  for (let w = 7; w >= 0; w--) {
    const t = (7 - w) / 7; // 0 = baseline, 1 = current
    const lerp = (a: number, b: number) => +(a + (b - a) * t + (Math.random() - 0.5) * (b - a) * 0.15).toFixed(1);

    const weekLabel = new Date(Date.now() - w * 7 * 24 * 60 * 60 * 1000)
      .toLocaleDateString("en-US", { month: "short", day: "numeric" });

    weeks.push({
      week:            weekLabel,
      leadTime:        Math.max(0, lerp(baseline.leadTime,        current.leadTime)),
      cycleTime:       Math.max(0, lerp(baseline.cycleTime,       current.cycleTime)),
      prThroughput:    Math.max(0, Math.round(lerp(baseline.prThroughput,    current.prThroughput / (30 / 7)))),
      deployFrequency: Math.max(0, Math.round(lerp(baseline.deployFrequency, current.deployFrequency / (30 / 7)))),
      bugRate:         Math.max(0, lerp(baseline.bugRate,         current.bugRate)),
    });
  }
  return weeks;
}

// ─── Period-over-period delta ──────────────────────────────────────────────────
export function computeTrendDeltas(developerId: string): TrendDelta[] {
  const current  = computeMetrics(developerId);
  const baseline = getBaseline(developerId);
  if (!current || !baseline) return [];

  const makeEntry = (
    metric: string,
    curr: number,
    prev: number,
    unit: string,
    lowerIsBetter: boolean
  ): TrendDelta => {
    const delta        = +(curr - prev).toFixed(1);
    const deltaPercent = prev !== 0 ? +((delta / prev) * 100).toFixed(1) : 0;
    const improved     = lowerIsBetter ? delta < -2 : delta > 0.5;
    const regressed    = lowerIsBetter ? delta > 2  : delta < -0.5;
    return {
      metric,
      current: curr,
      previous: prev,
      delta,
      deltaPercent,
      direction: improved ? "improved" : regressed ? "regressed" : "stable",
      unit,
    };
  };

  return [
    makeEntry("Lead Time",          current.leadTime,        baseline.leadTime,        "h",   true),
    makeEntry("Cycle Time",         current.cycleTime,       baseline.cycleTime,       "h",   true),
    makeEntry("PR Throughput",      current.prThroughput,    baseline.prThroughput,    "PRs", false),
    makeEntry("Deployment Freq.",   current.deployFrequency, baseline.deployFrequency, "dep", false),
    makeEntry("Bug Rate",           current.bugRate,         baseline.bugRate,         "%",   true),
  ];
}
