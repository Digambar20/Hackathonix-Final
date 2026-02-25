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

const REPO_POLL_INTERVAL = 10000; // 10 seconds
const NOTIFICATION_POLL_INTERVAL = 15000; // 15 seconds

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
    const [submitting, setSubmitting] = useState(false);
    const [teamStatus, setTeamStatus] = useState<TeamStatus | null>(null);
    const [notifications, setNotifications] = useState<TeamNotification[]>([]);

    // Timer phases:
    // - Before start: countdown to Mar 9, 2026 9:30 AM
    // - During hackathon: countdown to Mar 9, 2026 7:30 PM
    // - After end: 00:00:00
    const [timeLeft, setTimeLeft] = useState("10:00:00");
    const [timerPhase, setTimerPhase] = useState<"PRE_EVENT" | "HACKATHON" | "ENDED">("PRE_EVENT");

    useEffect(() => {
        const startTime = new Date(2026, 2, 9, 9, 30, 0); // Mar 9, 2026 9:30 AM
        const endTime = new Date(2026, 2, 9, 19, 30, 0); // Mar 9, 2026 7:30 PM

        const timer = setInterval(() => {
            const now = new Date();
            let targetTime = startTime;

            if (now < startTime) {
                setTimerPhase("PRE_EVENT");
                targetTime = startTime;
            } else if (now < endTime) {
                setTimerPhase("HACKATHON");
                targetTime = endTime;
            } else {
                setTimerPhase("ENDED");
                setTimeLeft("00:00:00");
                clearInterval(timer);
                return;
            }

            const diff = targetTime.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft("00:00:00");
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

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
            const res = await fetch("/api/teams");
            if (res.ok) {
                const data = await res.json();
                setTeamStatus(data);
                // Determine status from team data
                if (data.repoUrl) {
                    setStatus("SUBMITTED");
                    setRepoUrl(data.repoUrl);
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

    const selectProblem = (id: string) => {
        setSelectedProblemId(id);
    };

    const lockProblem = async () => {
        if (!selectedProblemId) return;
        try {
            const res = await fetch("/api/problems/lock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ problemId: selectedProblemId }),
            });
            if (res.ok) {
                setStatus("LOCKED");
                setLockTime(new Date());
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
        repoData,
        repoLoading,
        repoError,
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
