import { NextResponse } from "next/server";
import { getHackathonConfig } from "@/lib/hackathon-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const cfg = await getHackathonConfig();
  return NextResponse.json({
    mode: cfg.mode,
    problemSelectionStartAt: cfg.problemSelectionStartAt.toISOString(),
    hackathonEndAt: cfg.hackathonEndAt.toISOString(),
    homepageCountdownTargetAt: cfg.homepageCountdownTargetAt.toISOString(),
    updatedAt: cfg.updatedAt.toISOString(),
  });
}
