"use client";

import { useHackathon } from "@/hooks/use-hackathon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Github, CheckCircle, GitCommit, Star, GitFork, ExternalLink, Clock, Code, RefreshCw, Loader2, XCircle, ShieldCheck, CreditCard, AlertTriangle, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// ─── iOS-style DigitReel (adapted from ios-style-timer) ────────────────────
function DigitReel({ value, size = "lg" }: { value: string; size?: "lg" | "sm" }) {
    const dim = size === "lg" ? "w-14 h-20 text-5xl" : "w-8 h-12 text-2xl";

    return (
        <div className={`relative ${size === "lg" ? "w-14 h-20" : "w-8 h-12"} overflow-hidden`}>
            <div className="absolute top-0 left-0 right-0 h-6 z-10 bg-gradient-to-b from-background to-transparent pointer-events-none" />
            <div className="relative h-full flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={value}
                        initial={{ y: -40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 40, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className={`absolute ${dim} flex items-center justify-center font-mono font-bold text-primary`}
                    >
                        {value}
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-6 z-10 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </div>
    );
}

function CountdownTimer({ timeStr }: { timeStr: string }) {
    const parts = timeStr.split(":");
    const h = parts[0] || "00";
    const m = parts[1] || "00";
    const s = parts[2] || "00";

    return (
        <div className="flex items-center justify-center gap-1">
            <div className="flex items-center gap-0.5">
                <DigitReel value={h[0]} />
                <DigitReel value={h[1]} />
            </div>
            <span className="text-3xl font-mono text-primary/60 animate-pulse mx-0.5">:</span>
            <div className="flex items-center gap-0.5">
                <DigitReel value={m[0]} />
                <DigitReel value={m[1]} />
            </div>
            <span className="text-3xl font-mono text-primary/60 animate-pulse mx-0.5">:</span>
            <div className="flex items-center gap-0.5">
                <DigitReel value={s[0]} />
                <DigitReel value={s[1]} />
            </div>
        </div>
    );
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}d ago`;
}

export default function DashboardPage() {
    const {
        status, selectedProblemId, timeLeft, timerPhase,
        repoData, repoLoading, repoError, submitting, teamStatus, notifications,
        submitRepo, fetchRepoData, problems
    } = useHackathon();
    const [repoInput, setRepoInput] = useState("");
    const [now, setNow] = useState(new Date());

    const selectedProblem = problems.find(p => p.id === selectedProblemId);

    // Live clock
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const isRegApproved = teamStatus?.registrationApproved ?? false;
    const isPayVerified = teamStatus?.paymentVerified ?? false;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">

            {/* iOS-Style Timer Banner */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.04] via-background to-primary/[0.02] p-6"
            >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(var(--primary-rgb,120,80,255),0.08),transparent_50%)]" />
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="text-center lg:text-left">
                        <p className="text-[10px] font-mono text-primary uppercase tracking-[0.2em] mb-1">Time Remaining</p>
                        <CountdownTimer timeStr={timeLeft} />
                        <p className="text-xs text-muted-foreground mt-2">
                            {timerPhase === "PRE_EVENT"
                                ? "Hackathon starts at 09:30 AM"
                                : timerPhase === "HACKATHON"
                                    ? "Hackathon ends at 07:30 PM"
                                    : "Hackathon has ended"}{" "}
                            · {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST
                        </p>
                    </div>
                    <div className="flex flex-col items-center lg:items-end gap-1">
                        <div className="text-xl font-display font-bold uppercase text-foreground">
                            {status === "CHOOSING" ? "Problem Selection" : status === "LOCKED" ? "Development" : "Active Sprint"}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${status === "SUBMITTED" ? "bg-neon-green" : "bg-primary"} animate-pulse`} />
                            <span className="text-xs text-muted-foreground font-mono">
                                {status === "CHOOSING" ? "Select & lock a problem" : status === "LOCKED" ? "Link your GitHub repo" : "Commit frequently"}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Status Cards Row */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {/* Registration Status */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <Card className={`border-border bg-card/50 ${isRegApproved ? "border-neon-green/30" : "border-yellow-500/30"}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Registration</CardTitle>
                            <ShieldCheck className={`h-4 w-4 ${isRegApproved ? "text-neon-green" : "text-yellow-500"}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-lg font-bold font-display uppercase ${isRegApproved ? "text-neon-green" : "text-yellow-500"}`}>
                                {isRegApproved ? "Confirmed" : "Pending"}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                {isRegApproved ? "Approved by admin" : "Awaiting admin approval"}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Payment Status */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className={`border-border bg-card/50 ${isPayVerified ? "border-neon-green/30" : "border-yellow-500/30"}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Payment</CardTitle>
                            <CreditCard className={`h-4 w-4 ${isPayVerified ? "text-neon-green" : "text-yellow-500"}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-lg font-bold font-display uppercase ${isPayVerified ? "text-neon-green" : "text-yellow-500"}`}>
                                {isPayVerified ? "Verified" : "Pending"}
                            </div>
                            {isPayVerified ? (
                                <p className="text-[10px] text-muted-foreground mt-1">Payment confirmed by admin</p>
                            ) : (
                                <Button
                                    size="sm"
                                    className="mt-2 h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-bold gap-1"
                                    onClick={() => window.open("https://pay.google.com", "_blank")}
                                >
                                    <CreditCard className="w-3 h-3" /> Pay Now
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Git Status */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Card className={`border-border bg-card/50 ${status === "SUBMITTED" ? "border-neon-green/30" : ""}`}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Git Status</CardTitle>
                            <Github className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold font-display uppercase text-foreground">
                                {status === "SUBMITTED" ? "Connected" : "Not Linked"}
                            </div>
                            {status === "SUBMITTED" && (
                                <p className="text-[10px] text-neon-green mt-1 flex items-center gap-1">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                                    Live · refreshes every 10s
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
                {(status === "LOCKED" || status === "SUBMITTED") && selectedProblem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        <div className="lg:col-span-2 space-y-4">
                            {/* Active Objective */}
                            <Card className="border-primary/30 bg-primary/[0.04]">
                                <CardHeader>
                                    <CardTitle className="font-display uppercase tracking-wider text-lg flex items-center gap-2 text-foreground">
                                        <CheckCircle className="text-primary w-5 h-5" />
                                        Active Objective
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <h3 className="text-2xl font-bold text-foreground">{selectedProblem.title}</h3>
                                    <p className="text-muted-foreground">{selectedProblem.description}</p>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {selectedProblem.tags.map(tag => (
                                            <span key={tag} className="px-2 py-1 bg-muted/50 rounded text-xs font-mono border border-border text-muted-foreground">{tag}</span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Repo Submission */}
                            <Card className="border-border bg-card/50">
                                <CardHeader>
                                    <CardTitle className="font-mono uppercase text-xs tracking-wider text-muted-foreground">Repository Submission</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {status === "SUBMITTED" ? (
                                        <Alert className="bg-neon-green/[0.06] border-neon-green/20">
                                            <CheckCircle className="h-4 w-4 text-neon-green" />
                                            <AlertTitle className="text-neon-green font-bold">Repository Verified & Linked</AlertTitle>
                                            <AlertDescription className="text-neon-green/80 text-sm">
                                                System is tracking commits from{" "}
                                                <a
                                                    href={repoData?.repoUrl || repoInput}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-mono underline underline-offset-2 hover:text-neon-green"
                                                >
                                                    {repoData?.name || repoInput}
                                                </a>
                                            </AlertDescription>
                                        </Alert>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex flex-col sm:flex-row gap-3 items-end">
                                                <div className="grid gap-2 flex-1 w-full">
                                                    <Label htmlFor="repo" className="text-xs text-muted-foreground">GitHub Repository URL</Label>
                                                    <Input
                                                        id="repo"
                                                        placeholder="https://github.com/username/repo"
                                                        value={repoInput}
                                                        onChange={(e) => { setRepoInput(e.target.value); }}
                                                        className="bg-muted/50 border-border"
                                                        disabled={submitting}
                                                    />
                                                </div>
                                                <Button
                                                    onClick={() => submitRepo(repoInput)}
                                                    disabled={!repoInput || submitting}
                                                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shrink-0"
                                                >
                                                    {submitting ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Verifying...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Github className="w-4 h-4 mr-2" />
                                                            Link Repo
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                            {repoError && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <Alert className="bg-destructive/[0.06] border-destructive/20">
                                                        <XCircle className="h-4 w-4 text-destructive" />
                                                        <AlertTitle className="text-destructive font-bold text-sm">Verification Failed</AlertTitle>
                                                        <AlertDescription className="text-destructive/80 text-sm">
                                                            {repoError}
                                                        </AlertDescription>
                                                    </Alert>
                                                </motion.div>
                                            )}
                                            <p className="text-[10px] text-muted-foreground font-mono">
                                                ⚡ Repo will be verified via GitHub API — must be public with at least 1 commit
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Real-Time Repo Data Panel */}
                            {status === "SUBMITTED" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <Card className="border-border bg-card/50">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle className="font-mono uppercase text-xs tracking-wider text-muted-foreground">Live Repository Data</CardTitle>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={fetchRepoData}
                                                disabled={repoLoading}
                                                className="h-7 text-xs text-muted-foreground hover:text-foreground"
                                            >
                                                <RefreshCw className={`w-3 h-3 mr-1 ${repoLoading ? "animate-spin" : ""}`} />
                                                Refresh
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            {repoLoading && !repoData ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                                    <span className="ml-2 text-sm text-muted-foreground">Fetching repo data...</span>
                                                </div>
                                            ) : repoData ? (
                                                <div className="space-y-4">
                                                    {/* Repo Stats Grid */}
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                        <div className="bg-muted/30 rounded-lg p-3 border border-border">
                                                            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-mono uppercase mb-1">
                                                                <GitCommit className="w-3 h-3" /> Commits
                                                            </div>
                                                            <div className="text-xl font-bold font-mono text-foreground">{repoData.totalCommits}</div>
                                                        </div>
                                                        <div className="bg-muted/30 rounded-lg p-3 border border-border">
                                                            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-mono uppercase mb-1">
                                                                <Star className="w-3 h-3" /> Stars
                                                            </div>
                                                            <div className="text-xl font-bold font-mono text-foreground">{repoData.stars}</div>
                                                        </div>
                                                        <div className="bg-muted/30 rounded-lg p-3 border border-border">
                                                            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-mono uppercase mb-1">
                                                                <GitFork className="w-3 h-3" /> Forks
                                                            </div>
                                                            <div className="text-xl font-bold font-mono text-foreground">{repoData.forks}</div>
                                                        </div>
                                                        <div className="bg-muted/30 rounded-lg p-3 border border-border">
                                                            <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-mono uppercase mb-1">
                                                                <Code className="w-3 h-3" /> Language
                                                            </div>
                                                            <div className="text-lg font-bold font-mono text-foreground truncate">{repoData.language || "—"}</div>
                                                        </div>
                                                    </div>

                                                    {/* Repo meta */}
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${repoData.isPublic ? "bg-neon-green/10 text-neon-green border border-neon-green/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`}>
                                                            {repoData.isPublic ? "PUBLIC" : "PRIVATE"}
                                                        </span>
                                                        <span className="font-mono">{repoData.defaultBranch}</span>
                                                        <span>·</span>
                                                        <span>Created {timeAgo(repoData.createdAt)}</span>
                                                        <a
                                                            href={repoData.repoUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="ml-auto inline-flex items-center gap-1 text-primary hover:underline"
                                                        >
                                                            <ExternalLink className="w-3 h-3" /> Open on GitHub
                                                        </a>
                                                    </div>

                                                    {/* Recent Commits */}
                                                    {repoData.recentCommits && repoData.recentCommits.length > 0 && (
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Recent Commits</p>
                                                            <div className="space-y-1.5">
                                                                {repoData.recentCommits.map((commit) => (
                                                                    <div
                                                                        key={commit.sha}
                                                                        className="flex items-start gap-3 text-xs border-l-2 border-primary/30 pl-3 py-1.5 hover:border-primary transition-colors"
                                                                    >
                                                                        <code className="text-primary font-mono shrink-0">{commit.sha}</code>
                                                                        <span className="text-foreground truncate flex-1">{commit.message}</span>
                                                                        <span className="text-muted-foreground shrink-0 flex items-center gap-1">
                                                                            <Clock className="w-2.5 h-2.5" />
                                                                            {timeAgo(commit.date)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground py-4 text-center">No repo data available</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </div>

                        {/* Activity Sidebar */}
                        <div className="space-y-4">
                            <Card className="border-border bg-card/50">
                                <CardHeader>
                                    <CardTitle className="font-mono uppercase text-xs tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Bell className="w-3.5 h-3.5" />
                                        Admin Notifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {notifications.length === 0 ? (
                                        <p className="text-xs text-muted-foreground">No notifications yet.</p>
                                    ) : (
                                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                            {notifications.slice(0, 8).map((n) => (
                                                <div
                                                    key={n.id}
                                                    className={`rounded-lg border p-2.5 ${n.type === "SUCCESS"
                                                        ? "border-neon-green/30 bg-neon-green/5"
                                                        : n.type === "WARNING"
                                                            ? "border-yellow-500/30 bg-yellow-500/5"
                                                            : "border-border bg-muted/20"
                                                        }`}
                                                >
                                                    <p className="text-xs font-bold text-foreground">{n.title}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                                                    <p className="text-[10px] text-muted-foreground/80 mt-1">{timeAgo(n.createdAt)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-border bg-card/50">
                                <CardHeader>
                                    <CardTitle className="font-mono uppercase text-xs tracking-wider text-muted-foreground">Live Activity</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-neon-green" />
                                        <span className="text-muted-foreground">System Online</span>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-mono text-muted-foreground uppercase">Recent Events</p>
                                        <div className="space-y-2">
                                            {status === "SUBMITTED" && repoData && repoData.recentCommits?.[0] && (
                                                <div className="text-xs border-l-2 border-neon-green/50 pl-3 py-1">
                                                    <span className="text-neon-green font-bold font-mono">{timeAgo(repoData.recentCommits[0].date)}</span>
                                                    <span className="text-muted-foreground ml-2">Latest commit pushed</span>
                                                </div>
                                            )}
                                            {status === "SUBMITTED" && (
                                                <div className="text-xs border-l-2 border-primary pl-3 py-1">
                                                    <span className="text-primary font-bold font-mono">LIVE</span>
                                                    <span className="text-muted-foreground ml-2">Repo linked</span>
                                                </div>
                                            )}
                                            {isRegApproved && (
                                                <div className="text-xs border-l-2 border-neon-green/50 pl-3 py-1">
                                                    <span className="text-neon-green font-bold font-mono">✓</span>
                                                    <span className="text-muted-foreground ml-2">Registration approved</span>
                                                </div>
                                            )}
                                            {isPayVerified && (
                                                <div className="text-xs border-l-2 border-neon-green/50 pl-3 py-1">
                                                    <span className="text-neon-green font-bold font-mono">✓</span>
                                                    <span className="text-muted-foreground ml-2">Payment verified</span>
                                                </div>
                                            )}
                                            <div className="text-xs border-l-2 border-primary pl-3 py-1">
                                                <span className="text-primary font-bold font-mono">
                                                    {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                                </span>
                                                <span className="text-muted-foreground ml-2">Problem Locked</span>
                                            </div>
                                            <div className="text-xs border-l-2 border-border pl-3 py-1 text-muted-foreground">
                                                <span className="text-foreground font-mono">09:30 AM</span>
                                                <span className="ml-2">Event Started</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {/* When no problem locked yet — show a prompt */}
                {status === "CHOOSING" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-12 gap-4"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <AlertTriangle className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-xl font-display font-bold uppercase text-foreground">No Problem Selected</h2>
                        <p className="text-sm text-muted-foreground text-center max-w-md">
                            Head to the <a href="/dashboard/problemstatements" className="text-primary underline underline-offset-2">Problem Statements</a> page to select and lock a problem to start your sprint.
                        </p>
                        <Button asChild className="bg-primary text-primary-foreground font-bold mt-2">
                            <a href="/dashboard/problemstatements">Browse Problem Statements →</a>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
