import { prisma } from "@/lib/prisma";
import { getHackathonConfig } from "@/lib/hackathon-config";

export const COMMIT_COUNT_CAP = 5;
export const COMMIT_SYNC_INTERVAL_HOURS = 2;
const SYNC_INTERVAL_MS = COMMIT_SYNC_INTERVAL_HOURS * 60 * 60 * 1000;
const TESTING_SYNC_INTERVAL_MS = 6 * 60 * 1000; // 6 minutes for testing

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
    }
  } catch {
    return null;
  }
  return null;
}

async function githubFetch(endpoint: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Hackthonix-CommitValidation",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(`https://api.github.com${endpoint}`, { headers, next: { revalidate: 0 } });
}

async function fetchRawCommitCount(owner: string, repo: string): Promise<number> {
  const res = await githubFetch(`/repos/${owner}/${repo}/commits?per_page=1`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = typeof body?.message === "string" ? body.message : "";
    throw new Error(`GITHUB_RAW_COMMITS_FETCH_FAILED_${res.status}_${message}`);
  }

  const linkHeader = res.headers.get("Link");
  if (linkHeader) {
    const lastMatch = linkHeader.match(/page=(\d+)>;\s*rel="last"/);
    if (lastMatch) return Number(lastMatch[1]) || 0;
  }

  const commits = await res.json().catch(() => []);
  return Array.isArray(commits) ? commits.length : 0;
}

async function fetchLeaderCommitCount(owner: string, repo: string, leaderEmail: string): Promise<number> {
  // Pull up to latest 100 commits and count exact leader email matches.
  const res = await githubFetch(`/repos/${owner}/${repo}/commits?per_page=100`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = typeof body?.message === "string" ? body.message : "";
    throw new Error(`GITHUB_LEADER_COMMITS_FETCH_FAILED_${res.status}_${message}`);
  }

  const commits = await res.json().catch(() => []);
  if (!Array.isArray(commits)) return 0;

  const leader = leaderEmail.trim().toLowerCase();
  let count = 0;

  for (const c of commits) {
    const authorEmail = (c?.commit?.author?.email || "").toString().trim().toLowerCase();
    const committerEmail = (c?.commit?.committer?.email || "").toString().trim().toLowerCase();
    if (authorEmail === leader || committerEmail === leader) {
      count += 1;
    }
  }

  return count;
}

export async function syncTeamCommitValidation(teamId: string, force = false) {
  const cfg = await getHackathonConfig();
  const isTesting = cfg.mode === "TESTING";
  const intervalMs = isTesting ? TESTING_SYNC_INTERVAL_MS : SYNC_INTERVAL_MS;
  const windowHours = isTesting ? 0.1 : COMMIT_SYNC_INTERVAL_HOURS;

  const db: any = prisma;
  const team = await db.team.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      name: true,
      repoUrl: true,
      teamLeaderEmail: true,
      lastCommitSyncAt: true,
    },
  });

  if (!team) return { ok: false, reason: "TEAM_NOT_FOUND" } as const;
  if (!team.repoUrl) return { ok: false, reason: "NO_REPO" } as const;

  const now = new Date();
  if (!force && team.lastCommitSyncAt && now.getTime() - team.lastCommitSyncAt.getTime() < intervalMs) {
    return { ok: true, skipped: true, reason: "SYNC_NOT_DUE" } as const;
  }

  const parsed = parseGitHubUrl(team.repoUrl);
  if (!parsed) return { ok: false, reason: "INVALID_REPO_URL" } as const;

  let rawCommitCount = 0;
  let leaderCommitCount = 0;
  try {
    [rawCommitCount, leaderCommitCount] = await Promise.all([
      fetchRawCommitCount(parsed.owner, parsed.repo),
      fetchLeaderCommitCount(parsed.owner, parsed.repo, team.teamLeaderEmail),
    ]);
  } catch (error) {
    console.error(`Commit sync skipped for team ${team.id} (${team.name}):`, error);
    const errorText = error instanceof Error ? error.message.toLowerCase() : "";
    if (errorText.includes("rate limit")) {
      return { ok: false, reason: "GITHUB_RATE_LIMIT" } as const;
    }
    return { ok: false, reason: "GITHUB_FETCH_FAILED" } as const;
  }

  const countedCommitCount = Math.min(COMMIT_COUNT_CAP, rawCommitCount);
  const leaderCommitValidated = leaderCommitCount > 0;

  await prisma.$transaction([
    db.team.update({
      where: { id: team.id },
      data: {
        rawCommitCount,
        countedCommitCount,
        leaderCommitCount,
        leaderCommitValidated,
        lastCommitSyncAt: now,
      },
    }),
    db.teamCommitSnapshot.create({
      data: {
        teamId: team.id,
        checkedAt: now,
        rawCommitCount,
        countedCommitCount,
        leaderEmail: team.teamLeaderEmail,
        leaderCommitCount,
        leaderCommitValidated,
        windowHours,
      },
    }),
  ]);

  return {
    ok: true,
    skipped: false,
    data: {
      rawCommitCount,
      countedCommitCount,
      leaderCommitCount,
      leaderCommitValidated,
      cap: COMMIT_COUNT_CAP,
      intervalHours: windowHours,
      syncedAt: now.toISOString(),
    },
  } as const;
}

export async function syncAllTeamsCommitValidation(force = false) {
  const db: any = prisma;
  const teams = await db.team.findMany({
    where: { repoUrl: { not: null } },
    select: { id: true },
  });

  const results = [] as Array<{ teamId: string; ok: boolean; skipped?: boolean; reason?: string }>;
  for (const t of teams) {
    const r = await syncTeamCommitValidation(t.id, force);
    results.push({
      teamId: t.id,
      ok: r.ok,
      skipped: (r as any).skipped,
      reason: (r as any).reason,
    });
  }

  return {
    total: teams.length,
    synced: results.filter((r) => r.ok && !r.skipped).length,
    skipped: results.filter((r) => r.skipped).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  };
}
