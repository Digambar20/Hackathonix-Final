"use client";

import { useState, useEffect, useCallback } from "react";

export type Problem = {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    description: string;
    tags: string[];
    teamCount?: number;
};

export type RepoCommit = {
    sha: string;
    message: string;
    author: string;
    date: string;
};

export type RepoData = {
    repoUrl: string;
    name: string;
    description: string | null;
    isPublic: boolean;
    language: string | null;
    stars: number;
    forks: number;
    openIssues: number;
    defaultBranch: string;
    createdAt: string;
    updatedAt: string;
    totalCommits: number;
    recentCommits: RepoCommit[];
    offline?: boolean;
    error?: string;
    syncMode?: "SCHEDULED" | string;
    commitValidation?: {
        rawCommitCount: number;
        countedCommitCount: number;
        leaderCommitCount: number;
        leaderCommitValidated: boolean;
        cap?: number;
        intervalHours?: number;
        syncedAt?: string | null;
    };
};

export type TeamStatus = {
    id: string;
    name: string;
    registrationApproved: boolean;
    paymentVerified: boolean;
    psStatus: string;
    repoUrl: string | null;
    memberCount: number;
    members: { id: string; name: string; email: string }[];
    problemStatement: { id: string; title: string; category: string } | null;
};

export type TeamNotification = {
    id: string;
    title: string;
    message: string;
    type: "INFO" | "SUCCESS" | "WARNING" | "ERROR" | string;
    isRead: boolean;
    createdAt: string;
};

const REPO_POLL_INTERVAL = 120000; // 2 minutes
const NOTIFICATION_POLL_INTERVAL = 15000; // 15 seconds
const DEFAULT_PROBLEM_SELECTION_START_ISO = "2026-03-09T04:00:00.000Z"; // 09:30 IST
const DEFAULT_HACKATHON_END_ISO = "2026-03-09T14:00:00.000Z"; // 19:30 IST

type HackathonEventConfig = {
    mode: "TESTING" | "LIVE";
    problemSelectionStartAt: string;
    hackathonEndAt: string;
    updatedAt?: string;
};

export function useHackathon() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [problemsLoading, setProblemsLoading] = useState(true);
    const [status, setStatus] = useState<"CHOOSING" | "LOCKED" | "SUBMITTED">("CHOOSING");
    const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
    const [repoUrl, setRepoUrl] = useState("");
    const [lockTime, setLockTime] = useState<Date | null>(null);
    const [repoData, setRepoData] = useState<RepoData | null>(null);
    const [repoLoading, setRepoLoading] = useState(false);
    const [repoError, setRepoError] = useState<string | null>(null);
    const [selectionError, setSelectionError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [teamStatus, setTeamStatus] = useState<TeamStatus | null>(null);
    const [notifications, setNotifications] = useState<TeamNotification[]>([]);
    const [eventConfig, setEventConfig] = useState<HackathonEventConfig>({
        mode: "LIVE",
        problemSelectionStartAt: DEFAULT_PROBLEM_SELECTION_START_ISO,
        hackathonEndAt: DEFAULT_HACKATHON_END_ISO,
    });

    // Timer phases:
    // - Before start: countdown to Mar 9, 2026 9:30 AM
    // - During hackathon: countdown to Mar 9, 2026 7:30 PM
    // - After end: 00:00:00
    const [timeLeft, setTimeLeft] = useState("10:00:00 IST");
    const [timerPhase, setTimerPhase] = useState<"PRE_EVENT" | "HACKATHON" | "ENDED">("PRE_EVENT");
    const isTestingMode = eventConfig.mode === "TESTING";

    const fetchEventConfig = useCallback(async () => {
        try {
            const res = await fetch("/api/hackathon/config", { cache: "no-store" });
            if (!res.ok) return;
            const data = await res.json();
            if (data?.mode && data?.problemSelectionStartAt && data?.hackathonEndAt) {
                setEventConfig({
                    mode: data.mode === "TESTING" ? "TESTING" : "LIVE",
                    problemSelectionStartAt: data.problemSelectionStartAt,
                    hackathonEndAt: data.hackathonEndAt,
                    updatedAt: data.updatedAt,
                });
            }
        } catch { }
    }, []);

    useEffect(() => {
        fetchEventConfig();
    }, [fetchEventConfig]);

    useEffect(() => {
        const cfgPoll = setInterval(fetchEventConfig, 30000);
        return () => clearInterval(cfgPoll);
    }, [fetchEventConfig]);

    useEffect(() => {
        const selectionStart = new Date(eventConfig.problemSelectionStartAt);
        const hackathonEnd = new Date(eventConfig.hackathonEndAt);
        const timer = setInterval(() => {
            const now = new Date();
            let targetTime = selectionStart;

            if (now < selectionStart) {
                setTimerPhase("PRE_EVENT");
                targetTime = selectionStart;
            } else if (now < hackathonEnd) {
                setTimerPhase("HACKATHON");
                targetTime = hackathonEnd;
            } else {
                setTimerPhase("ENDED");
                setTimeLeft("00:00:00 IST");
                clearInterval(timer);
                return;
            }

            const diff = targetTime.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft("00:00:00 IST");
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} IST`);
        }, 1000);

        return () => clearInterval(timer);
    }, [eventConfig.problemSelectionStartAt, eventConfig.hackathonEndAt]);

    // Fetch real problems from API
    useEffect(() => {
        setProblemsLoading(true);
        fetch("/api/problems")
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setProblems(data);
            })
            .catch(() => { })
            .finally(() => setProblemsLoading(false));
    }, []);

    // Fetch team status
    const fetchTeamStatus = useCallback(async () => {
        try {
            const res = await fetch("/api/teams", { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setTeamStatus(data);
                // Determine status from team data
                if (data.repoUrl) {
                    setStatus("SUBMITTED");
                    setRepoUrl(data.repoUrl);
                } else if (data.psStatus === "PENDING") {
                    setStatus("CHOOSING");
                    if (data.problemStatement) {
                        setSelectedProblemId(data.problemStatement.id);
                    }
                } else if (data.psStatus === "LOCKED") {
                    setStatus("LOCKED");
                    if (data.problemStatement) {
                        setSelectedProblemId(data.problemStatement.id);
                    }
                }
            }
        } catch { }
    }, []);

    useEffect(() => {
        fetchTeamStatus();
    }, [fetchTeamStatus]);

    // Fetch real-time repo data
    const fetchRepoData = useCallback(async () => {
        try {
            setRepoLoading(true);
            const res = await fetch("/api/teams/repo");
            if (res.status === 404) {
                setRepoData(null);
                return;
            }
            if (!res.ok) {
                throw new Error("Failed to fetch repo data");
            }
            const data = await res.json();
            setRepoData(data);
            setRepoError(null);
        } catch {
            // Silent fail on poll — keep last data
        } finally {
            setRepoLoading(false);
        }
    }, []);

    // Auto-poll repo data when submitted — every 10 seconds
    useEffect(() => {
        if (status !== "SUBMITTED") return;

        fetchRepoData();
        const interval = setInterval(fetchRepoData, REPO_POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [status, fetchRepoData]);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch("/api/notifications");
            if (!res.ok) return;
            const data = await res.json();
            setNotifications(Array.isArray(data) ? data : []);
        } catch { }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, NOTIFICATION_POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const selectProblem = async (id: string) => {
        setSelectionError(null);
        // Testing mode: unlock UI flow immediately, then sync best-effort.
        if (isTestingMode) {
            setSelectedProblemId(id);
            setStatus("CHOOSING");
        }
        try {
            const res = await fetch("/api/problems/select", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ problemStatementId: id }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                if (!isTestingMode) {
                    setSelectionError(data.error || "Failed to select problem statement");
                }
                return;
            }
            setSelectedProblemId(id);
            setStatus("CHOOSING");
            await fetchTeamStatus();
        } catch {
            setSelectionError("Network error while selecting problem statement");
        }
    };

    const lockProblem = async (problemId?: string) => {
        const targetProblemId = problemId ?? selectedProblemId;
        if (!targetProblemId) return;
        try {
            const res = await fetch("/api/problems/lock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ problemId: targetProblemId }),
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok) {
                setSelectedProblemId(data.problemStatementId ?? targetProblemId);
                setStatus("LOCKED");
                setLockTime(new Date());
                await fetchTeamStatus();
            }
        } catch { }
    };

    const submitRepo = async (url: string) => {
        setSubmitting(true);
        setRepoError(null);

        try {
            const res = await fetch("/api/teams/repo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoUrl: url }),
            });

            const data = await res.json();

            if (!res.ok) {
                setRepoError(data.error || "Failed to verify repository");
                return;
            }

            setRepoUrl(url);
            setStatus("SUBMITTED");
            await fetchRepoData();
        } catch {
            setRepoError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return {
        problems,
        problemsLoading,
        status,
        selectedProblemId,
        repoUrl,
        lockTime,
        timeLeft,
        timerPhase,
        canSelectProblems: isTestingMode || timerPhase !== "PRE_EVENT",
        isTestingMode,
        eventConfig,
        repoData,
        repoLoading,
        repoError,
        selectionError,
        submitting,
        teamStatus,
        notifications,
        selectProblem,
        lockProblem,
        submitRepo,
        fetchRepoData,
        fetchTeamStatus,
        fetchNotifications,
    };
}
