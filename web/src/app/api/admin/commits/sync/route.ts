import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasSuperAdminAccess } from "@/lib/admin-access";
import { syncAllTeamsCommitValidation } from "@/lib/commit-validation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;
  if (!hasSuperAdminAccess(user)) {
    return NextResponse.json({ error: "Superadmin access required" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const force = body?.force === true;

  try {
    const summary = await syncAllTeamsCommitValidation(force);
    return NextResponse.json({ success: true, summary });
  } catch (err) {
    console.error("Commit sync error:", err);
    return NextResponse.json({ error: "Failed to sync commits" }, { status: 500 });
  }
}
