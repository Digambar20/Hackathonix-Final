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
    if (user.role !== "JUDGE" && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Only judges can submit scores" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const data = scoreSchema.parse(body);
        const total = data.commitFrequency + data.codeQuality + data.problemRelevance + data.innovation;

        const score = await prisma.score.upsert({
            where: { teamId_judgeId: { teamId: data.teamId, judgeId: user.id } },
            update: { ...data, total },
            create: { ...data, judgeId: user.id, total },
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
    if (user.role !== "JUDGE" && user.role !== "ADMIN") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const teamId = req.nextUrl.searchParams.get("teamId");

    const scores = await prisma.score.findMany({
        where: teamId ? { teamId } : undefined,
        include: {
            team: { select: { name: true } },
            judge: { select: { name: true } },
        },
        orderBy: { total: "desc" },
    });

    return NextResponse.json(scores);
}
