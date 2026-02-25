import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasAdminAccess, hasSuperAdminAccess } from "@/lib/admin-access";
import { ONLINE_TEAM_LIMIT, TOTAL_TEAM_LIMIT } from "@/lib/registration-config";
import { Prisma } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface MemberData {
    name: string;
    email: string;
}

const registerSchema = z.object({
    teamName: z.string().min(2).max(50),
    collegeName: z.string().min(2).max(100),
    teamLeaderName: z.string().min(2).max(50),
    teamLeaderEmail: z.string().email("Valid email required"),
    teamLeaderPhone: z
        .string()
        .transform((v) => v.replace(/\D/g, ""))
        .refine((v) => v.length === 10, "Phone number must be 10 digits"),
    members: z.array(z.object({
        name: z.string().min(2),
        email: z.string().email(),
    })).min(1).max(3),
});

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = session.user as any;
        if (!hasAdminAccess(user)) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const [teams, scoreRows] = await Promise.all([
            prisma.team.findMany({
                include: {
                    members: { select: { id: true, name: true, email: true } },
                    problemStatement: { select: { id: true, title: true, category: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.score.findMany({
                select: {
                    teamId: true,
                    commitFrequency: true,
                    codeQuality: true,
                    problemRelevance: true,
                    innovation: true,
                    total: true,
                },
            }),
        ]);

        const scoreByTeamId = new Map(
            scoreRows.map((row) => [
                row.teamId,
                {
                    commitFrequency: row.commitFrequency,
                    codeQuality: row.codeQuality,
                    problemRelevance: row.problemRelevance,
                    innovation: row.innovation,
                    total: row.total,
                },
            ])
        );

        const formatted = teams.map((team: any) => {
            const scoreMeta = scoreByTeamId.get(team.id);
            return {
                id: team.id,
                name: team.name,
                registrationMode: team.registrationMode,
                superadminScore: team.superadminScore,
                superadminScoredBy: team.superadminScoredBy,
                superadminScoredAt: team.superadminScoredAt,
                memberCount: team.members.length,
                members: team.members,
                problemStatement: team.problemStatement,
                psStatus: team.psStatus,
                repoUrl: team.repoUrl,
                registrationApproved: team.registrationApproved,
                paymentVerified: team.paymentVerified,
                avgScore: scoreMeta?.total ?? null,
                scoresCount: scoreMeta ? 1 : 0,
                score: scoreMeta ?? null,
                commitValidation: {
                    rawCommitCount: team.rawCommitCount,
                    countedCommitCount: team.countedCommitCount,
                    leaderCommitCount: team.leaderCommitCount,
                    leaderCommitValidated: team.leaderCommitValidated,
                    lastCommitSyncAt: team.lastCommitSyncAt,
                },
                createdAt: team.createdAt,
            };
        });

        return NextResponse.json(formatted, {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                Pragma: "no-cache",
                Expires: "0",
            },
        });
    } catch (err) {
        console.error("Admin teams GET error:", err);
        return NextResponse.json({ error: "Failed to load teams" }, { status: 500 });
    }
}

// POST — Superadmin manual registration (counts against total, not online)
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (!hasSuperAdminAccess(user)) {
        return NextResponse.json({ error: "Superadmin access required" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const data = registerSchema.parse(body);
        const leaderEmail = data.teamLeaderEmail.trim().toLowerCase();
        const memberEmails = data.members.map((m: MemberData) => m.email.trim().toLowerCase());
        const allEmails = [leaderEmail, ...memberEmails];

        if (new Set(allEmails).size !== allEmails.length) {
            return NextResponse.json(
                { error: "Duplicate email detected in team members. Each member must use a unique email." },
                { status: 400 }
            );
        }

        const [totalRegistered, onlineRegistered] = await Promise.all([
            prisma.team.count(),
            prisma.team.count({ where: { registrationMode: "ONLINE" } }),
        ]);

        if (totalRegistered >= TOTAL_TEAM_LIMIT) {
            return NextResponse.json(
                { error: `Total registration limit (${TOTAL_TEAM_LIMIT} teams) has been reached.` },
                { status: 409 }
            );
        }

        const superadminSlotsUsed = totalRegistered - onlineRegistered;
        const superadminSlotsRemaining = TOTAL_TEAM_LIMIT - ONLINE_TEAM_LIMIT - superadminSlotsUsed;
        if (superadminSlotsRemaining <= 0) {
            return NextResponse.json(
                { error: "Superadmin registration slots are full." },
                { status: 409 }
            );
        }

        const existing = await prisma.team.findUnique({ where: { name: data.teamName } });
        if (existing) {
            return NextResponse.json({ error: "Team name already taken" }, { status: 409 });
        }

        const existingEmailUsers = await prisma.user.findMany({
            where: { email: { in: allEmails } },
            select: { email: true },
        });
        if (existingEmailUsers.length > 0) {
            return NextResponse.json(
                {
                    error: "One or more emails are already registered. Please use different email addresses.",
                    emails: existingEmailUsers.map((u) => u.email),
                },
                { status: 409 }
            );
        }

        const team = await prisma.team.create({
            data: {
                name: data.teamName,
                collegeName: data.collegeName,
                teamLeaderName: data.teamLeaderName,
                teamLeaderEmail: leaderEmail,
                teamLeaderPhone: data.teamLeaderPhone,
                registrationSource: "SUPERADMIN",
                registrationMode: "SUPERADMIN",
                members: {
                    create: [
                        {
                            name: data.teamLeaderName,
                            email: leaderEmail,
                            role: "PARTICIPANT",
                            teamName: data.teamName,
                            registrationMode: "SUPERADMIN",
                        },
                        ...data.members.map((m: MemberData) => ({
                            name: m.name,
                            email: m.email.trim().toLowerCase(),
                            role: "PARTICIPANT",
                            teamName: data.teamName,
                            registrationMode: "SUPERADMIN",
                        })),
                    ],
                },
            },
            include: { members: true },
        });

        return NextResponse.json({
            success: true,
            team: {
                id: team.id,
                name: team.name,
                teamLeaderEmail: team.teamLeaderEmail,
                registrationMode: team.registrationMode,
            },
            message: "Team registered by superadmin successfully.",
        }, { status: 201 });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
        }
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
            return NextResponse.json(
                { error: "Email or team name already exists. Please use unique values." },
                { status: 409 }
            );
        }
        console.error("Superadmin team registration error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
