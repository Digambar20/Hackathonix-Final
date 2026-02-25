import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

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
            return NextResponse.json({ error: "Failed to verify repository with GitHub" }, { status: 502 });
        }

        const repoData = await repoRes.json();

        if (repoData.private) {
            return NextResponse.json({
                error: "Repository is private. Please make it public so judges can review your work.",
            }, { status: 400 });
        }

        // Fetch latest commits
        const commitsRes = await githubFetch(`/repos/${parsed.owner}/${parsed.repo}/commits?per_page=1`);
        let lastCommitDate = null;
        let lastCommitMessage = null;
        let totalCommits = 0;

        if (commitsRes.ok) {
            const commits = await commitsRes.json();
            if (commits.length > 0) {
                lastCommitDate = commits[0].commit?.committer?.date || commits[0].commit?.author?.date;
                lastCommitMessage = commits[0].commit?.message;
            }
            // Get total commit count from the Link header or contributors endpoint
            // Simple approach: use the repo's default branch commit count
        }

        // Save to DB
        await prisma.team.update({
            where: { id: user.teamId },
            data: { repoUrl },
        });

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
                lastCommitDate,
                lastCommitMessage,
            },
        });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
        }
        console.error("Repo submit error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET — Fetch real-time repo data for the authenticated team
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
        const team = await prisma.team.findUnique({ where: { id: user.teamId } });
        if (!team || !team.repoUrl) {
            return NextResponse.json({ error: "No repository linked" }, { status: 404 });
        }

        const parsed = parseGitHubUrl(team.repoUrl);
        if (!parsed) {
            return NextResponse.json({ error: "Invalid stored repository URL" }, { status: 500 });
        }

        // Fetch repo info
        const repoRes = await githubFetch(`/repos/${parsed.owner}/${parsed.repo}`);
        if (!repoRes.ok) {
            return NextResponse.json({
                repoUrl: team.repoUrl,
                error: "Could not fetch repo data from GitHub",
                offline: true,
            });
        }
        const repoData = await repoRes.json();

        // Fetch recent commits (last 5)
        const commitsRes = await githubFetch(`/repos/${parsed.owner}/${parsed.repo}/commits?per_page=5`);
        let commits: any[] = [];
        let totalCommits = 0;

        if (commitsRes.ok) {
            commits = await commitsRes.json();

            // Estimate total commits from Link header
            const linkHeader = commitsRes.headers.get("Link");
            if (linkHeader) {
                const lastMatch = linkHeader.match(/page=(\d+)>;\s*rel="last"/);
                if (lastMatch) {
                    totalCommits = parseInt(lastMatch[1], 10);
                }
            }
            // Fallback: if no pagination, it means all commits fit in one page
            if (totalCommits === 0) totalCommits = commits.length;
        }

        return NextResponse.json({
            repoUrl: team.repoUrl,
            name: repoData.full_name,
            description: repoData.description,
            isPublic: !repoData.private,
            language: repoData.language,
            stars: repoData.stargazers_count,
            forks: repoData.forks_count,
            openIssues: repoData.open_issues_count,
            defaultBranch: repoData.default_branch,
            createdAt: repoData.created_at,
            updatedAt: repoData.updated_at,
            totalCommits,
            recentCommits: commits.map((c: any) => ({
                sha: c.sha?.substring(0, 7),
                message: c.commit?.message?.split("\n")[0], // first line only
                author: c.commit?.author?.name,
                date: c.commit?.author?.date,
            })),
        });
    } catch (err) {
        console.error("Repo data fetch error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
