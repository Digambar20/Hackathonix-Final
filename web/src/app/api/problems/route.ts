import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const problems = await prisma.problemStatement.findMany({
        include: {
            teams: { select: { id: true } },
        },
        orderBy: { title: "asc" },
    });

    const formatted = problems.map((ps) => ({
        id: ps.id,
        title: ps.title,
        description: ps.description,
        category: ps.category,
        difficulty: ps.difficulty,
        tags: JSON.parse(ps.tags),
        teamCount: ps.teams.length,
    }));

    return NextResponse.json(formatted);
}
