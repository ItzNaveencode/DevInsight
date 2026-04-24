import { NextResponse } from "next/server";
import { developers } from "@/lib/data/seed";

export async function GET() {
  return NextResponse.json({ developers });
}
