import { NextResponse } from "next/server";
import { developers } from "@/lib/data/seed";
import { computeMetrics, computeTeamAverages } from "@/lib/engines/metrics";
import { runInsightEngine } from "@/lib/engines/insights";

export async function GET() {
  const teamAverages = computeTeamAverages();

  const memberSummaries = developers.map((dev) => {
    const metrics  = computeMetrics(dev.developer_id)!;
    const insights = runInsightEngine(metrics);
    const topInsight = insights[0];
    return {
      developer:    dev,
      metrics,
      topInsight:   topInsight ? { title: topInsight.title, severity: topInsight.severity, confidence: topInsight.confidence } : null,
      health:       topInsight?.severity ?? "healthy",
    };
  });

  const criticalCount = memberSummaries.filter((m) => m.health === "critical").length;
  const warningCount  = memberSummaries.filter((m) => m.health === "warning").length;
  const healthyCount  = memberSummaries.filter((m) => m.health === "healthy").length;

  return NextResponse.json({
    teamAverages,
    memberSummaries,
    summary: { criticalCount, warningCount, healthyCount, totalMembers: developers.length },
  });
}
