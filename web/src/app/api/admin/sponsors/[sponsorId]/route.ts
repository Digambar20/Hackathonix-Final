import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasSuperAdminAccess } from "@/lib/admin-access";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  tier: z.string().min(2).max(60).optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  isVisible: z.boolean().optional(),
  displayOrder: z.number().int().min(0).max(9999).optional(),
});

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user) return null;
  const user = session.user as any;
  if (!hasSuperAdminAccess(user)) return null;
  return user;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ sponsorId: string }> }) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Superadmin access required" }, { status: 403 });

  try {
    const { sponsorId } = await params;
    const body = await req.json();
    const parsed = updateSchema.parse(body);

    const data: any = {};
    if (parsed.name !== undefined) data.name = parsed.name.trim();
    if (parsed.tier !== undefined) data.tier = parsed.tier.trim();
    if (parsed.websiteUrl !== undefined) data.websiteUrl = parsed.websiteUrl ? parsed.websiteUrl.trim() : null;
    if (parsed.isVisible !== undefined) data.isVisible = parsed.isVisible;
    if (parsed.displayOrder !== undefined) data.displayOrder = parsed.displayOrder;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const sponsor = await prisma.sponsor.update({
      where: { id: sponsorId },
      data,
    });

    return NextResponse.json({ success: true, sponsor });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
    }
    console.error("Sponsor PATCH error:", err);
    return NextResponse.json({ error: "Failed to update sponsor" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ sponsorId: string }> }) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Superadmin access required" }, { status: 403 });

  try {
    const { sponsorId } = await params;
    await prisma.sponsor.delete({ where: { id: sponsorId } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === "P2025") {
      return NextResponse.json({ error: "Sponsor not found" }, { status: 404 });
    }
    console.error("Sponsor DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete sponsor" }, { status: 500 });
  }
}
