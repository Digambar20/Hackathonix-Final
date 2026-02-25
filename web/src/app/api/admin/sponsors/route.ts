import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasSuperAdminAccess } from "@/lib/admin-access";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const sponsorSchema = z.object({
  name: z.string().min(2).max(120),
  tier: z.string().min(2).max(60),
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

export async function GET() {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Superadmin access required" }, { status: 403 });

  const sponsors = await prisma.sponsor.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(sponsors, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function POST(req: NextRequest) {
  const user = await requireSuperAdmin();
  if (!user) return NextResponse.json({ error: "Superadmin access required" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = sponsorSchema.parse(body);

    const sponsor = await prisma.sponsor.create({
      data: {
        name: parsed.name.trim(),
        tier: parsed.tier.trim(),
        websiteUrl: parsed.websiteUrl ? parsed.websiteUrl.trim() : null,
        isVisible: parsed.isVisible ?? true,
        displayOrder: parsed.displayOrder ?? 999,
      },
    });

    return NextResponse.json({ success: true, sponsor }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
    }
    console.error("Sponsor POST error:", err);
    return NextResponse.json({ error: "Failed to add sponsor" }, { status: 500 });
  }
}
