"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Mail, Github, ChevronDown, ChevronUp, Trash2, Shield, ShieldCheck, CreditCard, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Member = { id?: string; name: string; email: string };
type ScoreBreakdown = {
    commitFrequency: number;
    codeQuality: number;
    problemRelevance: number;
    innovation: number;
    total: number;
};
type CommitValidation = {
    rawCommitCount: number;
    countedCommitCount: number;
    leaderCommitCount: number;
    leaderCommitValidated: boolean;
    lastCommitSyncAt?: string | null;
};
type Team = {
    id: string;
    name: string;
    registrationMode: "ONLINE" | "SUPERADMIN" | string;
    memberCount: number;
    members: Member[];
    problemStatement: { id: string; title: string; category: string } | null;
    psStatus: string;
    repoUrl: string | null;
    registrationApproved: boolean;
    paymentVerified: boolean;
    avgScore: number | null;
    score: ScoreBreakdown | null;
    commitValidation?: CommitValidation;
};

export default function AdminTeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [scoreInputs, setScoreInputs] = useState<Record<string, Omit<ScoreBreakdown, "total">>>({});

    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createError, setCreateError] = useState("");
    const [createSuccess, setCreateSuccess] = useState("");
    const [syncError, setSyncError] = useState("");
    const [syncSuccess, setSyncSuccess] = useState("");
    const [form, setForm] = useState({
        teamName: "",
        collegeName: "",
        teamLeaderName: "",
        teamLeaderEmail: "",
        teamLeaderPhone: "",
        members: [{ name: "", email: "" }],
    });

    const fetchTeams = useCallback(() => {
        setLoading(true);
        setLoadError("");
        fetch("/api/admin/teams", { cache: "no-store" })
            .then(async (r) => {
                const body = await r.json().catch(() => ({}));
                if (!r.ok) throw new Error(body?.error || `Failed to load teams (HTTP ${r.status})`);
                return body;
            })
            .then((data) => {
                const rows = Array.isArray(data) ? data : [];
                setTeams(rows);
                setScoreInputs((prev) => {
                    const next = { ...prev };
                    for (const team of rows as Team[]) {
                        if (next[team.id] == null) {
                            next[team.id] = team.score
                                ? {
                                    commitFrequency: team.score.commitFrequency,
                                    codeQuality: team.score.codeQuality,
                                    problemRelevance: team.score.problemRelevance,
                                    innovation: team.score.innovation,
                                }
                                : {
                                    commitFrequency: 0,
                                    codeQuality: 0,
                                    problemRelevance: 0,
                                    innovation: 0,
                                };
                        }
                    }
                    return next;
                });
            })
            .catch((err: unknown) => {
                setTeams([]);
                setLoadError(err instanceof Error ? err.message : "Failed to load teams");
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchTeams(); }, [fetchTeams]);
    useEffect(() => {
        const interval = setInterval(fetchTeams, 15000);
        return () => clearInterval(interval);
    }, [fetchTeams]);

    useEffect(() => {
        fetch("/api/auth/session")
            .then((r) => (r.ok ? r.json() : null))
            .then((session) => {
                const role = session?.user?.role;
                setIsSuperAdmin(role === "SUPERADMIN");
            })
            .catch(() => setIsSuperAdmin(false));
    }, []);

    const updateMember = (index: number, field: "name" | "email", value: string) => {
        setForm((prev) => {
            const members = [...prev.members];
            members[index] = { ...members[index], [field]: value };
            return { ...prev, members };
        });
    };

    const addMember = () => {
        setForm((prev) => prev.members.length >= 3 ? prev : { ...prev, members: [...prev.members, { name: "", email: "" }] });
    };

    const removeMember = (index: number) => {
        setForm((prev) => prev.members.length <= 1 ? prev : { ...prev, members: prev.members.filter((_, i) => i !== index) });
    };

    const createTeamBySuperAdmin = async () => {
        setCreateError("");
        setCreateSuccess("");
        const normalizedPhone = form.teamLeaderPhone.replace(/\D/g, "").slice(0, 10);
        if (normalizedPhone.length !== 10) {
            setCreateError("Team leader phone must be exactly 10 digits.");
            return;
        }
        setActionLoading("create_team");
        try {
            const res = await fetch("/api/admin/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, teamLeaderPhone: normalizedPhone }),
            });
            const data = await res.json();
            if (!res.ok) {
                setCreateError(data.error || "Failed to register team");
                return;
            }
            setCreateSuccess(data.message || "Team registered");
            setForm({
                teamName: "",
                collegeName: "",
                teamLeaderName: "",
                teamLeaderEmail: "",
                teamLeaderPhone: "",
                members: [{ name: "", email: "" }],
            });
            setShowCreateForm(false);
            fetchTeams();
        } catch {
            setCreateError("Network error while registering team");
        }
        setActionLoading(null);
    };

    const toggleApproval = async (teamId: string, current: boolean) => {
        setActionLoading(teamId + "_reg");
        try {
            const res = await fetch(`/api/admin/teams/${teamId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ registrationApproved: !current }),
            });
            if (res.ok) {
                setTeams((prev) => prev.map((t) =>
                    t.id === teamId ? { ...t, registrationApproved: !current } : t
                ));
            }
        } catch { }
        setActionLoading(null);
    };

    const togglePayment = async (teamId: string, current: boolean) => {
        setActionLoading(teamId + "_pay");
        try {
            const res = await fetch(`/api/admin/teams/${teamId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ paymentVerified: !current }),
            });
            if (res.ok) {
                setTeams((prev) => prev.map((t) =>
                    t.id === teamId ? { ...t, paymentVerified: !current } : t
                ));
            }
        } catch { }
        setActionLoading(null);
    };

    const updateScoreInput = (teamId: string, key: keyof Omit<ScoreBreakdown, "total">, value: string) => {
        const n = Math.max(0, Math.min(25, Math.trunc(Number(value) || 0)));
        setScoreInputs((prev) => ({
            ...prev,
            [teamId]: {
                ...(prev[teamId] ?? { commitFrequency: 0, codeQuality: 0, problemRelevance: 0, innovation: 0 }),
                [key]: n,
            },
        }));
    };

    const scoreTotal = (x: Omit<ScoreBreakdown, "total"> | undefined) => {
        if (!x) return 0;
        return x.commitFrequency + x.codeQuality + x.problemRelevance + x.innovation;
    };

    const saveTeamScore = async (teamId: string) => {
        const current = scoreInputs[teamId] ?? { commitFrequency: 0, codeQuality: 0, problemRelevance: 0, innovation: 0 };

        setActionLoading(teamId + "_score");
        try {
            const res = await fetch("/api/scores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teamId,
                    commitFrequency: current.commitFrequency,
                    codeQuality: current.codeQuality,
                    problemRelevance: current.problemRelevance,
                    innovation: current.innovation,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setTeams((prev) => prev.map((t) =>
                    t.id === teamId
                        ? {
                            ...t,
                            avgScore: data.score?.total ?? scoreTotal(current),
                            score: data.score
                                ? {
                                    commitFrequency: data.score.commitFrequency,
                                    codeQuality: data.score.codeQuality,
                                    problemRelevance: data.score.problemRelevance,
                                    innovation: data.score.innovation,
                                    total: data.score.total,
                                }
                                : {
                                    ...current,
                                    total: scoreTotal(current),
                                },
                        }
                        : t
                ));
            } else {
                alert(data.error || "Failed to assign score");
            }
        } catch {
            alert("Network error while assigning score");
        }
        setActionLoading(null);
    };

    const clearTeamScore = async (teamId: string) => {
        setActionLoading(teamId + "_score_clear");
        try {
            const res = await fetch("/api/scores", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamId }),
            });
            const data = await res.json();
            if (res.ok) {
                setScoreInputs((prev) => ({
                    ...prev,
                    [teamId]: { commitFrequency: 0, codeQuality: 0, problemRelevance: 0, innovation: 0 },
                }));
                setTeams((prev) => prev.map((t) =>
                    t.id === teamId
                        ? {
                            ...t,
                            avgScore: null,
                            score: null,
                        }
                        : t
                ));
            } else {
                alert(data.error || "Failed to clear score");
            }
        } catch {
            alert("Network error while clearing score");
        }
        setActionLoading(null);
    };

    const deleteTeam = async (teamId: string, teamName: string) => {
        if (!confirm(`Are you sure you want to delete team "${teamName}"? This action cannot be undone.`)) return;
        setActionLoading(teamId + "_del");
        try {
            const res = await fetch(`/api/admin/teams/${teamId}`, { method: "DELETE" });
            if (res.ok) {
                setTeams((prev) => prev.filter((t) => t.id !== teamId));
            }
        } catch { }
        setActionLoading(null);
    };

    const syncCommitsNow = async () => {
        setSyncError("");
        setSyncSuccess("");
        setActionLoading("sync_commits");
        try {
            const res = await fetch("/api/admin/commits/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ force: true }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setSyncError(data.error || "Failed to sync commits");
                return;
            }
            const summary = data.summary;
            const synced = summary?.synced ?? 0;
            const skipped = summary?.skipped ?? 0;
            const failed = summary?.failed ?? 0;
            const hasRateLimit = Array.isArray(summary?.results)
                && summary.results.some((r: any) => r?.reason === "GITHUB_RATE_LIMIT");

            if (failed > 0 && hasRateLimit) {
                setSyncError(
                    `GitHub rate limit hit. Synced: ${synced}, skipped: ${skipped}, failed: ${failed}. Add GITHUB_TOKEN in .env to avoid reset attempts.`
                );
            } else {
                setSyncSuccess(
                    `Commit sync complete: ${synced} synced, ${skipped} skipped, ${failed} failed.`
                );
            }
            fetchTeams();
        } catch {
            setSyncError("Network error while syncing commits");
        }
        setActionLoading(null);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wider text-foreground">
                            Manage <span className="text-primary">Teams</span>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">{teams.length} teams registered</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {isSuperAdmin && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={syncCommitsNow}
                                disabled={actionLoading === "sync_commits"}
                                className="font-mono text-xs"
                            >
                                {actionLoading === "sync_commits" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                                Sync Commits Now
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={fetchTeams} disabled={loading} className="font-mono text-xs">
                            Refresh
                        </Button>
                    </div>
                </div>
            </motion.div>

            {syncError && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
                    {syncError}
                </div>
            )}
            {syncSuccess && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono">
                    {syncSuccess}
                </div>
            )}

            {isSuperAdmin && (
                <Card className="border-primary/30 bg-primary/[0.04]">
                    <CardHeader>
                        <div className="flex items-center justify-between gap-3">
                            <CardTitle className="font-mono uppercase text-xs tracking-wider text-muted-foreground">
                                Superadmin Team Registration (Reserved Slots)
                            </CardTitle>
                            <Button
                                size="sm"
                                onClick={() => setShowCreateForm((s) => !s)}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {showCreateForm ? "Close Form" : "Register Team"}
                            </Button>
                        </div>
                    </CardHeader>
                    {showCreateForm && (
                        <CardContent className="space-y-4">
                            {createError && (
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
                                    {createError}
                                </div>
                            )}
                            {createSuccess && (
                                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono">
                                    {createSuccess}
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Team Name</Label>
                                    <Input value={form.teamName} onChange={(e) => setForm((p) => ({ ...p, teamName: e.target.value }))} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">College Name</Label>
                                    <Input value={form.collegeName} onChange={(e) => setForm((p) => ({ ...p, collegeName: e.target.value }))} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Team Leader Name</Label>
                                    <Input value={form.teamLeaderName} onChange={(e) => setForm((p) => ({ ...p, teamLeaderName: e.target.value }))} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Team Leader Email</Label>
                                    <Input type="email" value={form.teamLeaderEmail} onChange={(e) => setForm((p) => ({ ...p, teamLeaderEmail: e.target.value }))} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Team Leader Phone</Label>
                                    <Input
                                        type="tel"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={10}
                                        value={form.teamLeaderPhone}
                                        onChange={(e) => {
                                            const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
                                            setForm((p) => ({ ...p, teamLeaderPhone: cleaned }));
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Additional Members</Label>
                                    <Button variant="outline" size="sm" onClick={addMember} disabled={form.members.length >= 3}>
                                        Add Member
                                    </Button>
                                </div>
                                {form.members.map((m, i) => (
                                    <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                                        <Input placeholder="Name" value={m.name} onChange={(e) => updateMember(i, "name", e.target.value)} />
                                        <Input placeholder="Email" type="email" value={m.email} onChange={(e) => updateMember(i, "email", e.target.value)} />
                                        <Button variant="ghost" size="sm" onClick={() => removeMember(i)} disabled={form.members.length <= 1}>Remove</Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                onClick={createTeamBySuperAdmin}
                                disabled={actionLoading === "create_team"}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                            >
                                {actionLoading === "create_team" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                Register In Superadmin Quota
                            </Button>
                        </CardContent>
                    )}
                </Card>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading teams...
                </div>
            ) : loadError ? (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
                    {loadError}
                </div>
            ) : teams.length === 0 ? (
                <div className="text-center py-16">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-bold text-foreground">No teams registered yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {teams.map((team, i) => (
                        <motion.div
                            key={team.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                        >
                            <Card className="border-border bg-card/50">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold font-mono text-sm shrink-0">
                                                {team.name[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate">{team.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{team.memberCount} members · {team.psStatus}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-mono ${team.registrationMode === "SUPERADMIN" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                                                {team.registrationMode === "SUPERADMIN" ? "SUPERADMIN SLOT" : "ONLINE"}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-7 text-[10px] font-mono gap-1 ${team.registrationApproved ? "text-neon-green hover:text-red-400" : "text-yellow-500 hover:text-neon-green"}`}
                                                onClick={() => toggleApproval(team.id, team.registrationApproved)}
                                                disabled={actionLoading === team.id + "_reg"}
                                            >
                                                {actionLoading === team.id + "_reg" ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : team.registrationApproved ? (
                                                    <><ShieldCheck className="w-3 h-3" /> Approved</>
                                                ) : (
                                                    <><Shield className="w-3 h-3" /> Approve</>
                                                )}
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-7 text-[10px] font-mono gap-1 ${team.paymentVerified ? "text-neon-green hover:text-red-400" : "text-yellow-500 hover:text-neon-green"}`}
                                                onClick={() => togglePayment(team.id, team.paymentVerified)}
                                                disabled={actionLoading === team.id + "_pay"}
                                            >
                                                {actionLoading === team.id + "_pay" ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : team.paymentVerified ? (
                                                    <><CreditCard className="w-3 h-3" /> Paid</>
                                                ) : (
                                                    <><CreditCard className="w-3 h-3" /> Verify Pay</>
                                                )}
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => setExpandedId(expandedId === team.id ? null : team.id)}
                                            >
                                                {expandedId === team.id
                                                    ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                                    : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedId === team.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-4 pt-4 border-t border-border space-y-4">
                                                    <div>
                                                        <p className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Members</p>
                                                        <div className="space-y-1.5">
                                                            {team.members.map((m, idx) => (
                                                                <div key={m.id ?? `${m.email}-${idx}`} className="flex items-center gap-2 text-xs">
                                                                    <span className="text-foreground font-bold">{m.name}</span>
                                                                    <span className="text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{m.email}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                                                        <div className="bg-muted/30 rounded-lg p-2.5 border border-border">
                                                            <p className="text-[10px] text-muted-foreground uppercase font-mono">Problem</p>
                                                            <p className="font-bold text-foreground truncate">{team.problemStatement?.title || "None"}</p>
                                                        </div>
                                                        <div className="bg-muted/30 rounded-lg p-2.5 border border-border">
                                                            <p className="text-[10px] text-muted-foreground uppercase font-mono">PS Status</p>
                                                            <p className="font-bold text-foreground">{team.psStatus}</p>
                                                        </div>
                                                        <div className="bg-muted/30 rounded-lg p-2.5 border border-border">
                                                            <p className="text-[10px] text-muted-foreground uppercase font-mono">Repo</p>
                                                            {team.repoUrl ? (
                                                                <a href={team.repoUrl} target="_blank" className="text-primary underline font-bold flex items-center gap-1 truncate">
                                                                    <Github className="w-3 h-3 shrink-0" /> View
                                                                </a>
                                                            ) : (
                                                                <p className="text-muted-foreground">Not linked</p>
                                                            )}
                                                        </div>
                                                        <div className="bg-muted/30 rounded-lg p-2.5 border border-border">
                                                            <p className="text-[10px] text-muted-foreground uppercase font-mono">Avg Score</p>
                                                            <p className="font-bold text-foreground">{team.avgScore ?? "—"}</p>
                                                        </div>
                                                        <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/20">
                                                            <p className="text-[10px] text-muted-foreground uppercase font-mono">Total Score</p>
                                                            <p className="font-bold text-primary">{team.score?.total ?? "—"}</p>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-3 space-y-2">
                                                        <p className="text-[10px] font-mono uppercase tracking-wider text-amber-500">Commit Validation</p>
                                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                                                            <div className="bg-background/50 border border-border rounded p-2">
                                                                <p className="text-[10px] text-muted-foreground uppercase font-mono">Raw Commits</p>
                                                                <p className="font-bold">{team.commitValidation?.rawCommitCount ?? 0}</p>
                                                            </div>
                                                            <div className="bg-background/50 border border-border rounded p-2">
                                                                <p className="text-[10px] text-muted-foreground uppercase font-mono">Counted (max 5)</p>
                                                                <p className="font-bold text-primary">{team.commitValidation?.countedCommitCount ?? 0}</p>
                                                            </div>
                                                            <div className="bg-background/50 border border-border rounded p-2">
                                                                <p className="text-[10px] text-muted-foreground uppercase font-mono">Leader Commits</p>
                                                                <p className="font-bold">{team.commitValidation?.leaderCommitCount ?? 0}</p>
                                                            </div>
                                                            <div className="bg-background/50 border border-border rounded p-2">
                                                                <p className="text-[10px] text-muted-foreground uppercase font-mono">Leader Email Check</p>
                                                                <p className={`font-bold ${team.commitValidation?.leaderCommitValidated ? "text-neon-green" : "text-destructive"}`}>
                                                                    {team.commitValidation?.leaderCommitValidated ? "VALID" : "NOT VALID"}
                                                                </p>
                                                            </div>
                                                            <div className="bg-background/50 border border-border rounded p-2">
                                                                <p className="text-[10px] text-muted-foreground uppercase font-mono">Last Sync</p>
                                                                <p className="font-bold">
                                                                    {team.commitValidation?.lastCommitSyncAt
                                                                        ? new Date(team.commitValidation.lastCommitSyncAt).toLocaleString()
                                                                        : "Never"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {isSuperAdmin && (
                                                        <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-3 space-y-2">
                                                            <p className="text-[10px] font-mono uppercase tracking-wider text-primary">Team Scoring (4 x 25 = 100)</p>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                                <div className="space-y-1">
                                                                    <Label className="text-[10px]">Commit Frequency</Label>
                                                                    <Input type="number" min={0} max={25} step={1} value={scoreInputs[team.id]?.commitFrequency ?? 0} onChange={(e) => updateScoreInput(team.id, "commitFrequency", e.target.value)} className="bg-background/60 h-8" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-[10px]">Code Quality</Label>
                                                                    <Input type="number" min={0} max={25} step={1} value={scoreInputs[team.id]?.codeQuality ?? 0} onChange={(e) => updateScoreInput(team.id, "codeQuality", e.target.value)} className="bg-background/60 h-8" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-[10px]">Problem Relevance</Label>
                                                                    <Input type="number" min={0} max={25} step={1} value={scoreInputs[team.id]?.problemRelevance ?? 0} onChange={(e) => updateScoreInput(team.id, "problemRelevance", e.target.value)} className="bg-background/60 h-8" />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-[10px]">Innovation</Label>
                                                                    <Input type="number" min={0} max={25} step={1} value={scoreInputs[team.id]?.innovation ?? 0} onChange={(e) => updateScoreInput(team.id, "innovation", e.target.value)} className="bg-background/60 h-8" />
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs text-muted-foreground">
                                                                    Total: <span className="font-bold text-primary">{scoreTotal(scoreInputs[team.id])}/100</span>
                                                                </p>
                                                                <div className="flex items-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => saveTeamScore(team.id)}
                                                                    disabled={actionLoading === team.id + "_score"}
                                                                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                                                                >
                                                                    {actionLoading === team.id + "_score" ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                                                    Save Score
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => clearTeamScore(team.id)}
                                                                    disabled={actionLoading === team.id + "_score_clear"}
                                                                >
                                                                    {actionLoading === team.id + "_score_clear" ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                                                    Clear
                                                                </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs gap-1"
                                                            onClick={() => deleteTeam(team.id, team.name)}
                                                            disabled={actionLoading === team.id + "_del"}
                                                        >
                                                            {actionLoading === team.id + "_del" ? (
                                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-3 h-3" />
                                                            )}
                                                            Delete Team
                                                        </Button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
