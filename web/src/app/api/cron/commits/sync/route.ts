import { NextRequest, NextResponse } from "next/server";
import { syncAllTeamsCommitValidation } from "@/lib/commit-validation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET;
  if (!secret) return false;

  const bearer = req.headers.get("authorization");
  if (bearer === `Bearer ${secret}`) return true;

  const headerSecret = req.headers.get("x-cron-secret");
  if (headerSecret === secret) return true;

  return false;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
  }

  const force = req.nextUrl.searchParams.get("force") === "1";

  try {
    const summary = await syncAllTeamsCommitValidation(force);
    return NextResponse.json({
      success: true,
      force,
      syncedAt: new Date().toISOString(),
      summary,
    });
  } catch (error) {
    console.error("Cron commit sync failed:", error);
    return NextResponse.json({ error: "Cron sync failed" }, { status: 500 });
  }
}
