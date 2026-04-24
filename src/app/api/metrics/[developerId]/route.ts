import { NextResponse } from "next/server";
import { computeMetrics, computeTeamAverages } from "@/lib/engines/metrics";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ developerId: string }> }
) {
  const { developerId } = await params;
  const metrics = computeMetrics(developerId);
  if (!metrics) return NextResponse.json({ error: "Developer not found" }, { status: 404 });
  const teamAverages = computeTeamAverages();
  return NextResponse.json({ metrics, teamAverages });
}
