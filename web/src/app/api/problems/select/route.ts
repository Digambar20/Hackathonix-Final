import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { getHackathonConfig } from "@/lib/hackathon-config";

const selectSchema = z.object({
    problemStatementId: z.string(),
});

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "PARTICIPANT" || !user.teamId) {
        return NextResponse.json({ error: "Only participants can select problems" }, { status: 403 });
    }

    try {
        const cfg = await getHackathonConfig();
        const TESTING_MODE = cfg.mode === "TESTING";
        const selectionStart = cfg.problemSelectionStartAt;
        if (!TESTING_MODE && new Date() < selectionStart) {
            const startLabel = selectionStart.toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
            return NextResponse.json(
                { error: `Problem selection has not started yet. It opens on ${startLabel}.` },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { problemStatementId } = selectSchema.parse(body);

        // Check if team already locked a PS
        const team = await prisma.team.findUnique({ where: { id: user.teamId } });
        if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
        if (!TESTING_MODE && team.psStatus === "LOCKED") {
            return NextResponse.json({ error: "Your problem statement is already locked" }, { status: 400 });
        }

        // Verify PS exists
        const ps = await prisma.problemStatement.findUnique({ where: { id: problemStatementId } });
        if (!ps) return NextResponse.json({ error: "Problem statement not found" }, { status: 404 });

        // Update team selection
        const updated = await prisma.team.update({
            where: { id: user.teamId },
            data: {
                problemStatementId,
                psStatus: "PENDING",
                psSelectedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: "Problem selected! You have 10 minutes to finalize or change.",
            psSelectedAt: updated.psSelectedAt,
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
        }
        console.error("Select error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
