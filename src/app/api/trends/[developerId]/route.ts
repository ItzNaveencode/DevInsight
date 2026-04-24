import { NextResponse } from "next/server";
import { computeTrends, computeTrendDeltas } from "@/lib/engines/trends";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ developerId: string }> }
) {
  const { developerId } = await params;
  const trendPoints = computeTrends(developerId);
  if (!trendPoints.length) return NextResponse.json({ error: "Developer not found" }, { status: 404 });
  const deltas = computeTrendDeltas(developerId);
  return NextResponse.json({ trendPoints, deltas });
}
