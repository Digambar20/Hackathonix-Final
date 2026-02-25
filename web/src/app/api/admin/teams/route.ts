import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAllowedAdminEmail } from "@/lib/admin-access";

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "ADMIN" || !isAllowedAdminEmail(user.email)) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const teams = await prisma.team.findMany({
        include: {
            members: { select: { id: true, name: true, email: true } },
            problemStatement: { select: { id: true, title: true, category: true } },
            scores: {
                include: { judge: { select: { name: true } } },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    const formatted = teams.map((team) => ({
        id: team.id,
        name: team.name,
        memberCount: team.members.length,
        members: team.members,
        problemStatement: team.problemStatement,
        psStatus: team.psStatus,
        repoUrl: team.repoUrl,
        registrationApproved: team.registrationApproved,
        paymentVerified: team.paymentVerified,
        avgScore: team.scores.length > 0
            ? Math.round(team.scores.reduce((sum, s) => sum + s.total, 0) / team.scores.length)
            : null,
        scores: team.scores,
        createdAt: team.createdAt,
    }));

    return NextResponse.json(formatted);
}
