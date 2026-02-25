import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasAdminAccess } from "@/lib/admin-access";
import { z } from "zod";
import { getHackathonConfig } from "@/lib/hackathon-config";

function createSchemaForMode(isTestingMode: boolean) {
    return z.object({
        title: z.string().trim().min(isTestingMode ? 1 : 3),
        description: z.string().trim().min(isTestingMode ? 1 : 10),
        category: z.string().trim().min(isTestingMode ? 1 : 2),
        difficulty: z.preprocess(
            (v) => (typeof v === "string" ? v.toUpperCase().trim() : v),
            z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM")
        ),
        tags: z.preprocess((v) => {
            if (Array.isArray(v)) return v;
            if (typeof v === "string") {
                return v.split(",").map((x) => x.trim()).filter(Boolean);
            }
            return [];
        }, z.array(z.string()).default([])),
    });
}

async function requireAdmin() {
    const session = await auth();
    if (!session?.user) return null;
    const user = session.user as any;
    if (!hasAdminAccess(user)) return null;
    return user;
}

// POST — Create a new problem statement
export async function POST(req: NextRequest) {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    try {
        const cfg = await getHackathonConfig();
        const schema = createSchemaForMode(cfg.mode === "TESTING");
        const body = await req.json();
        const data = schema.parse(body);

        const ps = await prisma.problemStatement.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                difficulty: data.difficulty,
                tags: JSON.stringify(data.tags),
            },
        });

        return NextResponse.json({ success: true, id: ps.id }, { status: 201 });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: "Validation failed",
                    details: err.issues,
                    firstIssue: err.issues[0]?.message ?? "Invalid input",
                },
                { status: 400 }
            );
        }
        console.error("Create PS error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE — Delete a problem statement by id (query param)
export async function DELETE(req: NextRequest) {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id param" }, { status: 400 });

    try {
        // Check if any teams are using this PS
        const teamsUsing = await prisma.team.count({ where: { problemStatementId: id } });
        if (teamsUsing > 0) {
            return NextResponse.json({ error: `Cannot delete: ${teamsUsing} team(s) are using this problem statement` }, { status: 409 });
        }

        await prisma.problemStatement.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Problem statement not found" }, { status: 404 });
    }
}
