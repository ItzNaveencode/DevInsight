import { type ComputedMetrics, computeTeamAverages } from "@/lib/engines/metrics";

export type InsightSeverity = "critical" | "warning" | "info" | "healthy";

export interface Signal {
  metric: string;
  value: number | string;
  direction: "up" | "down" | "neutral";
  unit?: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  severity: InsightSeverity;
  confidence: number;           // 0–1
  signals: Signal[];
  category: "bottleneck" | "quality" | "velocity" | "process";
  affectedMetrics: string[];
}

// ─── Threshold config (configurable per PRD) ──────────────────────────────────
const THRESHOLDS = {
  leadTime:        { high: 72,  normal: 48 },  // hours
  cycleTime:       { high: 80,  normal: 48 },  // hours
  prThroughput:    { low: 3,    normal: 4   },  // count / 30 days
  deployFrequency: { low: 2,    high: 4    },   // count / 30 days (≥4 = high freq)
  bugRate:         { high: 40,  normal: 20 },   // percent
  reviewWait:      { high: 24,  normal: 8  },   // hours
};

// ─── Helper evaluators ─────────────────────────────────────────────────────────
function isHigh(value: number, threshold: number) { return value > threshold; }
function isLow(value: number,  threshold: number) { return value < threshold; }
function isNormal(value: number, low: number, high: number) { return value >= low && value <= high; }

// ─── Insight Engine ───────────────────────────────────────────────────────────
export function runInsightEngine(metrics: ComputedMetrics): Insight[] {
  const insights: Insight[] = [];
  const team = computeTeamAverages();

  const { leadTime, cycleTime, prThroughput, deployFrequency, bugRate, avgReviewWait } = metrics;

  // ── Rule 1: Development Bottleneck
  //    High Cycle Time + Low PR Throughput → developer is getting stuck on tasks
  if (
    isHigh(cycleTime, THRESHOLDS.cycleTime.high) &&
    isLow(prThroughput, THRESHOLDS.prThroughput.low)
  ) {
    const confidence = Math.min(
      0.95,
      0.5 +
        (cycleTime - THRESHOLDS.cycleTime.high) / 100 +
        (THRESHOLDS.prThroughput.normal - prThroughput) / 10
    );
    insights.push({
      id:          "ins-dev-bottleneck",
      title:       "Development Bottleneck Detected",
      description: `Your cycle time (${cycleTime}h avg) is well above the team average (${team.cycleTime}h) and PR throughput (${prThroughput} PRs) is below the healthy threshold. Tasks are taking significantly longer to complete, which is compressing delivery capacity. This pattern often indicates large task scope, insufficient incremental commits, or complex feature work without task decomposition.`,
      severity:    "critical",
      confidence:  +confidence.toFixed(2),
      signals: [
        { metric: "Cycle Time",    value: `${cycleTime}h`,    direction: "up",   unit: "hours" },
        { metric: "PR Throughput", value: prThroughput,       direction: "down", unit: "PRs"   },
        { metric: "Team Avg CT",   value: `${team.cycleTime}h`, direction: "neutral" },
      ],
      category:        "bottleneck",
      affectedMetrics: ["Cycle Time", "PR Throughput"],
    });
  }

  // ── Rule 2: Review / Deployment Delay
  //    High Lead Time + Normal Cycle Time → code is ready but sitting idle
  if (
    isHigh(leadTime, THRESHOLDS.leadTime.high) &&
    isNormal(cycleTime, 0, THRESHOLDS.cycleTime.normal)
  ) {
    const reviewSignal = isHigh(avgReviewWait, THRESHOLDS.reviewWait.high);
    const confidence = Math.min(0.93, 0.62 + (leadTime - THRESHOLDS.leadTime.high) / 120 + (reviewSignal ? 0.12 : 0));
    insights.push({
      id:          "ins-review-delay",
      title:       "Review / Deployment Delay",
      description: `Your lead time (${leadTime}h) is elevated while cycle time remains healthy (${cycleTime}h). This gap indicates that work is completed promptly but then waits for code review or deployment pipeline slots. Average time-to-first-review is ${avgReviewWait}h. The bottleneck exists post-development — in the review and deployment stages.`,
      severity:    "warning",
      confidence:  +confidence.toFixed(2),
      signals: [
        { metric: "Lead Time",     value: `${leadTime}h`,       direction: "up",     unit: "hours" },
        { metric: "Cycle Time",    value: `${cycleTime}h`,      direction: "neutral"               },
        { metric: "Review Wait",   value: `${avgReviewWait}h`,  direction: reviewSignal ? "up" : "neutral", unit: "hours" },
      ],
      category:        "process",
      affectedMetrics: ["Lead Time", "Cycle Time"],
    });
  }

  // ── Rule 3: Quality Issues
  //    High Bug Rate + High Deployment Frequency → shipping too fast without quality gates
  if (
    isHigh(bugRate, THRESHOLDS.bugRate.high) &&
    isHigh(deployFrequency, THRESHOLDS.deployFrequency.high)
  ) {
    const confidence = Math.min(0.97, 0.55 + (bugRate / 100) * 0.3 + (deployFrequency / 20) * 0.15);
    insights.push({
      id:          "ins-quality-debt",
      title:       "Quality Degradation Under High Velocity",
      description: `A ${bugRate}% bug escape rate combined with ${deployFrequency} deployments in the past 30 days suggests that shipping velocity has outpaced testing rigor. ${metrics.escapedBugs} bugs escaped to production in this window. High deployment cadence without proportional test coverage expansion creates compounding quality debt.`,
      severity:    "critical",
      confidence:  +confidence.toFixed(2),
      signals: [
        { metric: "Bug Rate",         value: `${bugRate}%`,    direction: "up",  unit: "%"     },
        { metric: "Deploy Frequency", value: deployFrequency,  direction: "up",  unit: "deploys" },
        { metric: "Escaped Bugs",     value: metrics.escapedBugs, direction: "up" },
      ],
      category:        "quality",
      affectedMetrics: ["Bug Rate", "Deployment Frequency"],
    });
  }

  // ── Rule 4: Deployment Failures
  //    High failed/rollback deploys
  if (metrics.failedDeploys > 0 && metrics.totalDeploys > 0) {
    const failRate = metrics.failedDeploys / metrics.totalDeploys;
    if (failRate >= 0.25) {
      insights.push({
        id:          "ins-deploy-failures",
        title:       "Elevated Deployment Failure Rate",
        description: `${metrics.failedDeploys} out of ${metrics.totalDeploys} deployments resulted in failures or rollbacks (${(failRate * 100).toFixed(0)}% failure rate). This is significantly above the acceptable threshold of 10% and indicates instability in the release pipeline or insufficient pre-deployment validation.`,
        severity:    "warning",
        confidence:  +(0.70 + failRate * 0.2).toFixed(2),
        signals: [
          { metric: "Failed Deploys", value: metrics.failedDeploys, direction: "up"     },
          { metric: "Total Deploys",  value: metrics.totalDeploys,  direction: "neutral" },
          { metric: "Failure Rate",   value: `${(failRate * 100).toFixed(0)}%`, direction: "up" },
        ],
        category:        "quality",
        affectedMetrics: ["Deployment Frequency"],
      });
    }
  }

  // ── Rule 5: Healthy developer
  //    All metrics within healthy range
  if (insights.length === 0) {
    insights.push({
      id:          "ins-healthy",
      title:       "Workflow is Healthy",
      description: `All metrics are within healthy ranges. Lead time (${leadTime}h), cycle time (${cycleTime}h), PR throughput (${prThroughput}), and bug rate (${bugRate}%) are all tracking well against team averages. Keep maintaining small PRs and consistent review cadence.`,
      severity:    "healthy",
      confidence:  0.91,
      signals: [
        { metric: "Lead Time",    value: `${leadTime}h`,    direction: "neutral" },
        { metric: "Cycle Time",   value: `${cycleTime}h`,   direction: "neutral" },
        { metric: "Bug Rate",     value: `${bugRate}%`,     direction: "neutral" },
        { metric: "PR Throughput",value: prThroughput,      direction: "neutral" },
      ],
      category:        "velocity",
      affectedMetrics: [],
    });
  }

  // Sort: critical first, then warning, info, healthy
  const order: Record<InsightSeverity, number> = { critical: 0, warning: 1, info: 2, healthy: 3 };
  return insights.sort((a, b) => order[a.severity] - order[b.severity]);
}
