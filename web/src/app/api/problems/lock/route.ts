import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getHackathonConfig } from "@/lib/hackathon-config";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "PARTICIPANT" || !user.teamId) {
        return NextResponse.json({ error: "Only participants can lock problems" }, { status: 403 });
    }

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
            { error: `Problem locking has not started yet. It opens on ${startLabel}.` },
            { status: 403 }
        );
    }

    const body = await req.json().catch(() => ({} as any));
    const requestedProblemId = typeof body?.problemId === "string" ? body.problemId : null;

    const team = await prisma.team.findUnique({ where: { id: user.teamId } });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    if (TESTING_MODE && requestedProblemId) {
        const ps = await prisma.problemStatement.findUnique({ where: { id: requestedProblemId } });
        if (!ps) {
            return NextResponse.json({ error: "Problem statement not found" }, { status: 404 });
        }

        const updated = await prisma.team.update({
            where: { id: user.teamId },
            data: {
                problemStatementId: requestedProblemId,
                psStatus: "LOCKED",
                psSelectedAt: team.psSelectedAt ?? new Date(),
                psLockedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            message: "Problem statement locked (testing mode).",
            psLockedAt: updated.psLockedAt,
            problemStatementId: updated.problemStatementId,
        });
    }

    if (team.psStatus === "LOCKED") {
        if (TESTING_MODE) {
            return NextResponse.json({
                success: true,
                message: "Already locked (testing mode)",
                psLockedAt: team.psLockedAt,
            });
        }
        return NextResponse.json({ error: "Already locked" }, { status: 400 });
    }
    if (!team.problemStatementId) {
        return NextResponse.json({ error: "No problem statement selected" }, { status: 400 });
    }
    if (!TESTING_MODE && team.psStatus !== "PENDING") {
        return NextResponse.json({ error: "No problem statement selected" }, { status: 400 });
    }

    const updated = await prisma.team.update({
        where: { id: user.teamId },
        data: {
            psStatus: "LOCKED",
            psLockedAt: new Date(),
        },
    });

    return NextResponse.json({
        success: true,
        message: "Problem statement locked! Good luck!",
        psLockedAt: updated.psLockedAt,
    });
}
