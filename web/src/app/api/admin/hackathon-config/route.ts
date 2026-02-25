import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasSuperAdminAccess } from "@/lib/admin-access";
import { getHackathonConfig, updateHackathonConfig } from "@/lib/hackathon-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  if (!hasSuperAdminAccess(user)) {
    return NextResponse.json({ error: "Superadmin access required" }, { status: 403 });
  }

  const cfg = await getHackathonConfig();
  return NextResponse.json({
    mode: cfg.mode,
    problemSelectionStartAt: cfg.problemSelectionStartAt.toISOString(),
    hackathonEndAt: cfg.hackathonEndAt.toISOString(),
    testingHomepageCountdownTargetAt: cfg.testingHomepageCountdownTargetAt.toISOString(),
    homepageCountdownTargetAt: cfg.homepageCountdownTargetAt.toISOString(),
    updatedAt: cfg.updatedAt.toISOString(),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  if (!hasSuperAdminAccess(user)) {
    return NextResponse.json({ error: "Superadmin access required" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  try {
    const cfg = await updateHackathonConfig({
      mode: body?.mode,
      problemSelectionStartAt: body?.problemSelectionStartAt,
      hackathonEndAt: body?.hackathonEndAt,
      testingHomepageCountdownTargetAt: body?.testingHomepageCountdownTargetAt,
    });

    return NextResponse.json({
      success: true,
      mode: cfg.mode,
      problemSelectionStartAt: cfg.problemSelectionStartAt.toISOString(),
      hackathonEndAt: cfg.hackathonEndAt.toISOString(),
      testingHomepageCountdownTargetAt: cfg.testingHomepageCountdownTargetAt.toISOString(),
      homepageCountdownTargetAt: cfg.homepageCountdownTargetAt.toISOString(),
      updatedAt: cfg.updatedAt.toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    if (message === "INVALID_DATE") {
      return NextResponse.json({ error: "Invalid date values provided" }, { status: 400 });
    }
    if (message === "INVALID_TIMER_RANGE") {
      return NextResponse.json({ error: "Hackathon end time must be after problem selection start time" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update hackathon config" }, { status: 500 });
  }
}
