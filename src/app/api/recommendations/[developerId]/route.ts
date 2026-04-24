import { NextResponse } from "next/server";
import { computeMetrics } from "@/lib/engines/metrics";
import { runInsightEngine } from "@/lib/engines/insights";
import { runRecommendationEngine } from "@/lib/engines/recommendations";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ developerId: string }> }
) {
  const { developerId } = await params;
  const metrics = computeMetrics(developerId);
  if (!metrics) return NextResponse.json({ error: "Developer not found" }, { status: 404 });
  const insights = runInsightEngine(metrics);
  const recommendations = runRecommendationEngine(insights);
  return NextResponse.json({ recommendations });
}
