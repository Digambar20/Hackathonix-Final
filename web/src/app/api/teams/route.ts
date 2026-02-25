import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// GET — Fetch authenticated user's team status
export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.teamId) {
        return NextResponse.json({ error: "No team found" }, { status: 404 });
    }

    const team = await prisma.team.findUnique({
        where: { id: user.teamId },
        include: {
            members: { select: { id: true, name: true, email: true } },
            problemStatement: { select: { id: true, title: true, category: true } },
        },
    });

    if (!team) {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({
        id: team.id,
        name: team.name,
        collegeName: team.collegeName,
        teamLeaderName: team.teamLeaderName,
        teamLeaderEmail: team.teamLeaderEmail,
        teamLeaderPhone: team.teamLeaderPhone,
        registrationApproved: team.registrationApproved,
        paymentVerified: team.paymentVerified,
        psStatus: team.psStatus,
        repoUrl: team.repoUrl,
        memberCount: team.members.length,
        members: team.members,
        problemStatement: team.problemStatement,
    });
}

interface MemberData {
    name: string;
    email: string;
}

const registerSchema = z.object({
    teamName: z.string().min(2).max(50),
    collegeName: z.string().min(2).max(100),
    teamLeaderName: z.string().min(2).max(50),
    teamLeaderEmail: z.string().email("Valid email required"),
    teamLeaderPhone: z.string().regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
    members: z.array(z.object({
        name: z.string().min(2),
        email: z.string().email(),
    })).min(1).max(3), // 1-3 additional members + 1 team leader = 2-4 total
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const data = registerSchema.parse(body);
        const leaderEmail = data.teamLeaderEmail.trim().toLowerCase();
        const memberEmails = data.members.map((m: MemberData) => m.email.trim().toLowerCase());
        const allEmails = [leaderEmail, ...memberEmails];

        // Prevent duplicate emails inside the same registration payload.
        if (new Set(allEmails).size !== allEmails.length) {
            return NextResponse.json(
                { error: "Duplicate email detected in team members. Each member must use a unique email." },
                { status: 400 }
            );
        }

        // Registration window: Feb 26, 2026 7 AM to Mar 6, 2026 12 AM
        const now = new Date();
        const registrationStart = new Date(2026, 1, 26, 7, 0, 0); // Feb 26, 7 AM
        const registrationEnd = new Date(2026, 2, 6, 0, 0, 0); // Mar 6, 12 AM
        const registrationLimit = 90;

        // TESTING MODE: Registration window check DISABLED for testing
        // Uncomment below to enable registration window validation
        /*
        if (now < registrationStart) {
            return NextResponse.json(
                { error: "Registration has not started yet. Opens on February 26, 2026 at 7:00 AM" },
                { status: 403 }
            );
        }

        if (now >= registrationEnd) {
            return NextResponse.json(
                { error: "Registration period has ended. Thank you for your interest!" },
                { status: 403 }
            );
        }
        */

        // Check if registration limit reached
        const totalRegistered = await prisma.team.count();
        if (totalRegistered >= registrationLimit) {
            return NextResponse.json(
                { error: `Registration limit (${registrationLimit} teams) has been reached. Thank you for your interest!` },
                { status: 409 }
            );
        }

        // Check if team name already exists
        const existing = await prisma.team.findUnique({ where: { name: data.teamName } });
        if (existing) {
            return NextResponse.json({ error: "Team name already taken" }, { status: 409 });
        }

        // Check if team leader email already exists
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

        // Create team and team leader user in a transaction
        const team = await prisma.team.create({
            data: {
                name: data.teamName,
                collegeName: data.collegeName,
                teamLeaderName: data.teamLeaderName,
                teamLeaderEmail: leaderEmail,
                teamLeaderPhone: data.teamLeaderPhone,
                members: {
                    create: [
                        // Create team leader as first member
                        {
                            name: data.teamLeaderName,
                            email: leaderEmail,
                            role: "PARTICIPANT",
                        },
                        // Create additional members
                        ...data.members.map((m: MemberData) => ({
                            name: m.name,
                            email: m.email.trim().toLowerCase(),
                            role: "PARTICIPANT",
                        })),
                    ],
                },
            },
            include: { members: true },
        });

        return NextResponse.json({
            success: true,
            team: { id: team.id, name: team.name, teamLeaderEmail: team.teamLeaderEmail },
            message: `Team registered successfully! Login with your email (${team.teamLeaderEmail}) and Team ID: ${team.id}`,
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
        console.error("Registration error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
