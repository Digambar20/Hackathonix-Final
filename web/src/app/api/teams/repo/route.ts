import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { COMMIT_COUNT_CAP, COMMIT_SYNC_INTERVAL_HOURS, syncTeamCommitValidation } from "@/lib/commit-validation";
import { getHackathonConfig } from "@/lib/hackathon-config";

const repoSchema = z.object({
    repoUrl: z.string().url().refine((url) => url.includes("github.com"), {
        message: "Must be a GitHub repository URL",
    }),
});

// Extract owner/repo from a GitHub URL
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    try {
        const parsed = new URL(url);
        const parts = parsed.pathname.split("/").filter(Boolean);
        if (parts.length >= 2) {
            return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
        }
    } catch { }
    return null;
}

// Fetch from GitHub API (unauthenticated or with optional token)
async function githubFetch(endpoint: string) {
    const headers: Record<string, string> = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Hackthonix-Dashboard",
    };
    const token = process.env.GITHUB_TOKEN;
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(`https://api.github.com${endpoint}`, { headers, next: { revalidate: 0 } });
}

// POST — Submit & verify repo
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (user.role !== "PARTICIPANT" || !user.teamId) {
        return NextResponse.json({ error: "Only participants can submit repos" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { repoUrl } = repoSchema.parse(body);

        const team = await prisma.team.findUnique({ where: { id: user.teamId } });
        if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
        if (team.psStatus !== "LOCKED") {
            return NextResponse.json({ error: "Lock your problem statement before submitting a repo" }, { status: 400 });
        }

        // Parse and verify the GitHub repo
        const parsed = parseGitHubUrl(repoUrl);
        if (!parsed) {
            return NextResponse.json({ error: "Invalid GitHub repository URL format" }, { status: 400 });
        }

        const repoRes = await githubFetch(`/repos/${parsed.owner}/${parsed.repo}`);

        if (repoRes.status === 404) {
            return NextResponse.json({
                error: "Repository not found. Make sure it exists and is public.",
            }, { status: 404 });
        }

        if (!repoRes.ok) {
            if (repoRes.status === 403) {
                return NextResponse.json(
                    { error: "GitHub API rate limit reached while verifying repository. Please try again shortly." },
                    { status: 429 }
                );
            }
            return NextResponse.json({ error: "Failed to verify repository with GitHub" }, { status: 502 });
        }

        const repoData = await repoRes.json();

        if (repoData.private) {
            return NextResponse.json({
                error: "Repository is private. Please make it public so judges can review your work.",
            }, { status: 400 });
        }

        // Save to DB
        await prisma.team.update({
            where: { id: user.teamId },
            data: { repoUrl },
        });

        const syncResult = await syncTeamCommitValidation(user.teamId, true);
        const teamAfterSync = await prisma.team.findUnique({
            where: { id: user.teamId },
            select: {
                rawCommitCount: true,
                countedCommitCount: true,
                leaderCommitCount: true,
                leaderCommitValidated: true,
                lastCommitSyncAt: true,
            },
        });

        const commitValidation = syncResult.ok
            ? (syncResult as any).data
            : {
                rawCommitCount: teamAfterSync?.rawCommitCount ?? 0,
                countedCommitCount: teamAfterSync?.countedCommitCount ?? 0,
                leaderCommitCount: teamAfterSync?.leaderCommitCount ?? 0,
                leaderCommitValidated: teamAfterSync?.leaderCommitValidated ?? false,
                cap: COMMIT_COUNT_CAP,
                intervalHours: COMMIT_SYNC_INTERVAL_HOURS,
                syncedAt: teamAfterSync?.lastCommitSyncAt?.toISOString?.() ?? null,
            };

        return NextResponse.json({
            success: true,
            message: "Repository verified and linked successfully!",
            verification: {
                name: repoData.full_name,
                isPublic: !repoData.private,
                description: repoData.description,
                language: repoData.language,
                stars: repoData.stargazers_count,
                defaultBranch: repoData.default_branch,
                createdAt: repoData.created_at,
            },
            commitValidation,
            syncWarning: syncResult.ok ? null : (syncResult as any).reason ?? "SYNC_FAILED",
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
        }
        console.error("Repo submit error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET — Fetch repo + commit-validation data from DB cache (no live GitHub calls)
export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.teamId) {
        return NextResponse.json({ error: "No team found" }, { status: 404 });
    }

    try {
        const [team, config] = await Promise.all([
            prisma.team.findUnique({
                where: { id: user.teamId },
                select: {
                    id: true,
                    repoUrl: true,
                    createdAt: true,
                    updatedAt: true,
                    rawCommitCount: true,
                    countedCommitCount: true,
                    leaderCommitCount: true,
                    leaderCommitValidated: true,
                    lastCommitSyncAt: true,
                },
            }),
            getHackathonConfig()
        ]);

        if (!team || !team.repoUrl) {
            return NextResponse.json({ error: "No repository linked" }, { status: 404 });
        }

        // Auto-sync in TESTING mode if due (6 mins)
        if (config.mode === "TESTING") {
            await syncTeamCommitValidation(team.id, false);
        }

        // Fetch again to get updated sync status
        const updatedTeam = config.mode === "TESTING" 
            ? await prisma.team.findUnique({ where: { id: team.id } }) 
            : team;

        const parsed = parseGitHubUrl(team.repoUrl);
        if (!parsed) {
            return NextResponse.json({ error: "Invalid stored repository URL" }, { status: 500 });
        }

        const repoName = `${parsed.owner}/${parsed.repo}`;

        return NextResponse.json({
            repoUrl: team.repoUrl,
            name: repoName,
            description: "Repository linked. Commit validation data is synced periodically.",
            isPublic: true,
            language: null,
            stars: 0,
            forks: 0,
            openIssues: 0,
            defaultBranch: "main",
            createdAt: team.createdAt.toISOString(),
            updatedAt: ((updatedTeam as any).lastCommitSyncAt ?? team.updatedAt).toISOString(),
            totalCommits: (updatedTeam as any).rawCommitCount ?? 0,
            recentCommits: [],
            offline: false,
            syncMode: "SCHEDULED",
            commitValidation: {
                rawCommitCount: (updatedTeam as any).rawCommitCount ?? 0,
                countedCommitCount: (updatedTeam as any).countedCommitCount ?? 0,
                leaderCommitCount: (updatedTeam as any).leaderCommitCount ?? 0,
                leaderCommitValidated: (updatedTeam as any).leaderCommitValidated ?? false,
                cap: COMMIT_COUNT_CAP,
                intervalHours: config.mode === "TESTING" ? 0.1 : COMMIT_SYNC_INTERVAL_HOURS,
                syncedAt: (updatedTeam as any).lastCommitSyncAt?.toISOString?.() ?? null,
            },
        });
    } catch (err) {
        console.error("Repo data fetch error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
