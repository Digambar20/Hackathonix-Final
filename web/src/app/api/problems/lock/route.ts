import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "PARTICIPANT" || !user.teamId) {
        return NextResponse.json({ error: "Only participants can lock problems" }, { status: 403 });
    }

    const team = await prisma.team.findUnique({ where: { id: user.teamId } });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    if (team.psStatus === "LOCKED") {
        return NextResponse.json({ error: "Already locked" }, { status: 400 });
    }
    if (!team.problemStatementId || team.psStatus !== "PENDING") {
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
