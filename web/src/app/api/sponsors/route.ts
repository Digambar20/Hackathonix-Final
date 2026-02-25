import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const sponsors = await prisma.sponsor.findMany({
      where: { isVisible: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        tier: true,
        websiteUrl: true,
      },
    });

    return NextResponse.json(sponsors, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (err) {
    console.error("Sponsors GET error:", err);
    return NextResponse.json({ error: "Failed to load sponsors" }, { status: 500 });
  }
}
