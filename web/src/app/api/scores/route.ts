import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const scoreSchema = z.object({
    teamId: z.string(),
    commitFrequency: z.number().min(0).max(25),
    codeQuality: z.number().min(0).max(25),
    problemRelevance: z.number().min(0).max(25),
    innovation: z.number().min(0).max(25),
});

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "JUDGE" && user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
        return NextResponse.json({ error: "Only judges/admins can submit scores" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const data = scoreSchema.parse(body);
        const total = data.commitFrequency + data.codeQuality + data.problemRelevance + data.innovation;
        const team = await prisma.team.findUnique({
            where: { id: data.teamId },
            select: { name: true },
        });
        if (!team) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        const score = await prisma.score.upsert({
            where: { teamId: data.teamId },
            update: { ...data, total, teamName: team.name },
            create: { ...data, total, teamName: team.name },
        });

        return NextResponse.json({ success: true, score });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
        }
        console.error("Score error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "JUDGE" && user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const teamId = req.nextUrl.searchParams.get("teamId");

    const scores = await prisma.score.findMany({
        where: teamId ? { teamId } : undefined,
        include: {
            team: { select: { name: true } },
        },
        orderBy: { total: "desc" },
    });

    return NextResponse.json(scores);
}

export async function DELETE(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    const teamId = body?.teamId;
    if (typeof teamId !== "string" || !teamId.trim()) {
        return NextResponse.json({ error: "teamId is required" }, { status: 400 });
    }

    await prisma.score.deleteMany({ where: { teamId: teamId.trim() } });
    return NextResponse.json({ success: true });
}
