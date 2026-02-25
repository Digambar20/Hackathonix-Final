import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

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
        const body = await req.json();
        const { problemStatementId } = selectSchema.parse(body);

        // Check if team already locked a PS
        const team = await prisma.team.findUnique({ where: { id: user.teamId } });
        if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
        if (team.psStatus === "LOCKED") {
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
