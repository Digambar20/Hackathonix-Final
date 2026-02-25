"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, FileCode, CheckCircle, CreditCard, Activity, Shield, BarChart3, Database, Download, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type Team = {
    id: string;
    name: string;
    memberCount: number;
    registrationApproved: boolean;
    paymentVerified: boolean;
    psStatus: string;
    repoUrl: string | null;
    avgScore: number | null;
};

export default function AdminDashboardPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [configLoading, setConfigLoading] = useState(false);
    const [configSaving, setConfigSaving] = useState(false);
    const [configError, setConfigError] = useState("");
    const [configSuccess, setConfigSuccess] = useState("");
    const [eventMode, setEventMode] = useState<"TESTING" | "LIVE">("LIVE");
    const [selectionStartInput, setSelectionStartInput] = useState("");
    const [hackathonEndInput, setHackathonEndInput] = useState("");

    const toInputValue = (iso: string) => {
        const d = new Date(iso);
        const pad = (n: number) => String(n).padStart(2, "0");
        const y = d.getFullYear();
        const m = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const h = pad(d.getHours());
        const min = pad(d.getMinutes());
        return `${y}-${m}-${day}T${h}:${min}`;
    };

    const fetchEventConfig = async () => {
        setConfigLoading(true);
        setConfigError("");
        try {
            const res = await fetch("/api/admin/hackathon-config", { cache: "no-store" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setConfigError(data.error || "Failed to load event config");
                return;
            }
            setEventMode(data.mode === "TESTING" ? "TESTING" : "LIVE");
            setSelectionStartInput(toInputValue(data.problemSelectionStartAt));
            setHackathonEndInput(toInputValue(data.hackathonEndAt));
        } catch {
            setConfigError("Failed to load event config");
        } finally {
            setConfigLoading(false);
        }
    };

    useEffect(() => {
        const fetchTeams = () => {
            setLoadError("");
            fetch("/api/admin/teams", { cache: "no-store" })
                .then(async (r) => {
                    const body = await r.json().catch(() => ({}));
                    if (!r.ok) throw new Error(body?.error || `Failed to load teams (HTTP ${r.status})`);
                    return body;
                })
                .then((data) => setTeams(Array.isArray(data) ? data : []))
                .catch((err: unknown) => {
                    setTeams([]);
                    setLoadError(err instanceof Error ? err.message : "Failed to load teams");
                })
                .finally(() => setLoading(false));
        };

        fetchTeams();
        const interval = setInterval(fetchTeams, 15000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetch("/api/auth/session")
            .then((r) => (r.ok ? r.json() : null))
            .then((session) => {
                const superAdmin = session?.user?.role === "SUPERADMIN";
                setIsSuperAdmin(superAdmin);
                if (superAdmin) {
                    fetchEventConfig();
                }
            })
            .catch(() => setIsSuperAdmin(false));
    }, []);

    const saveEventConfig = async () => {
        setConfigSaving(true);
        setConfigError("");
        setConfigSuccess("");
        try {
            const res = await fetch("/api/admin/hackathon-config", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: eventMode,
                    problemSelectionStartAt: selectionStartInput ? new Date(selectionStartInput).toISOString() : null,
                    hackathonEndAt: hackathonEndInput ? new Date(hackathonEndInput).toISOString() : null,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setConfigError(data.error || "Failed to save event config");
                return;
            }
            setConfigSuccess("Event mode and timers updated successfully.");
            setEventMode(data.mode === "TESTING" ? "TESTING" : "LIVE");
            setSelectionStartInput(toInputValue(data.problemSelectionStartAt));
            setHackathonEndInput(toInputValue(data.hackathonEndAt));
        } catch {
            setConfigError("Failed to save event config");
        } finally {
            setConfigSaving(false);
        }
    };

    const totalTeams = teams.length;
    const totalMembers = teams.reduce((s, t) => s + t.memberCount, 0);
    const approvedTeams = teams.filter(t => t.registrationApproved).length;
    const paidTeams = teams.filter(t => t.paymentVerified).length;
    const lockedTeams = teams.filter(t => t.psStatus === "LOCKED").length;
    const repoLinked = teams.filter(t => !!t.repoUrl).length;
    const scoredTeams = teams.filter(t => t.avgScore !== null).length;
    const averageTotalScore = scoredTeams > 0
        ? Math.round(teams.filter(t => t.avgScore !== null).reduce((sum, t) => sum + (t.avgScore ?? 0), 0) / scoredTeams)
        : 0;

    const stats = [
        { icon: Users, label: "Total Teams", value: totalTeams, color: "text-primary" },
        { icon: Users, label: "Participants", value: totalMembers, color: "text-blue-400" },
        { icon: Shield, label: "Approved", value: `${approvedTeams} / ${totalTeams}`, color: "text-neon-green" },
        { icon: CreditCard, label: "Payment Verified", value: `${paidTeams} / ${totalTeams}`, color: "text-neon-green" },
        { icon: FileCode, label: "PS Locked", value: lockedTeams, color: "text-yellow-500" },
        { icon: Activity, label: "Repo Linked", value: repoLinked, color: "text-blue-400" },
        { icon: BarChart3, label: "Scored", value: scoredTeams, color: "text-purple-400" },
        { icon: BarChart3, label: "Avg Total Score", value: `${averageTotalScore} / 100`, color: "text-primary" },
        { icon: CheckCircle, label: "Pending Approvals", value: totalTeams - approvedTeams, color: totalTeams - approvedTeams > 0 ? "text-destructive" : "text-neon-green" },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wider text-foreground">
                    Admin <span className="text-primary">Dashboard</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Real-time hackathon overview</p>
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">Loading...</div>
            ) : loadError ? (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
                    {loadError}
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                            >
                                <Card className="border-border bg-card/50">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{stat.label}</CardTitle>
                                        <stat.icon className={`w-4 h-4 ${stat.color}`} />
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <Card className="border-border bg-card/50">
                        <CardHeader>
                            <CardTitle className="font-mono uppercase text-xs tracking-wider text-muted-foreground">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <Link
                                    href="/admin/teams"
                                    className="block p-4 rounded-lg border border-border bg-muted/20 hover:border-primary/30 hover:bg-primary/[0.04] transition-all text-center"
                                >
                                    <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                                    <p className="text-sm font-bold text-foreground">Manage Teams</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">Approve, verify payments, delete</p>
                                </Link>
                                <Link
                                    href="/admin/problems"
                                    className="block p-4 rounded-lg border border-border bg-muted/20 hover:border-primary/30 hover:bg-primary/[0.04] transition-all text-center"
                                >
                                    <FileCode className="w-6 h-6 mx-auto mb-2 text-primary" />
                                    <p className="text-sm font-bold text-foreground">Problem Statements</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">Add, remove, manage</p>
                                </Link>
                                <div className="p-4 rounded-lg border border-border bg-muted/20 text-center">
                                    <BarChart3 className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm font-bold text-foreground">Scoring</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">{scoredTeams} teams scored so far</p>
                                </div>
                                <Link
                                    href="/admin/admins"
                                    className="block p-4 rounded-lg border border-border bg-muted/20 hover:border-primary/30 hover:bg-primary/[0.04] transition-all text-center"
                                >
                                    <ShieldAlert className="w-6 h-6 mx-auto mb-2 text-primary" />
                                    <p className="text-sm font-bold text-foreground">Manage Admins</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">Superadmin-only admin controls</p>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {isSuperAdmin && (
                        <Card className="border-primary/30 bg-primary/[0.04]">
                            <CardHeader>
                                <CardTitle className="font-mono uppercase text-xs tracking-wider text-muted-foreground">Superadmin Event Control</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {configError && (
                                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
                                        {configError}
                                    </div>
                                )}
                                {configSuccess && (
                                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono">
                                        {configSuccess}
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <Button
                                        variant={eventMode === "LIVE" ? "default" : "outline"}
                                        className={eventMode === "LIVE" ? "bg-primary text-primary-foreground" : ""}
                                        onClick={() => setEventMode("LIVE")}
                                        disabled={configLoading || configSaving}
                                    >
                                        Live Published Mode
                                    </Button>
                                    <Button
                                        variant={eventMode === "TESTING" ? "default" : "outline"}
                                        className={eventMode === "TESTING" ? "bg-primary text-primary-foreground" : ""}
                                        onClick={() => setEventMode("TESTING")}
                                        disabled={configLoading || configSaving}
                                    >
                                        Testing Mode
                                    </Button>
                                    <Button variant="outline" onClick={fetchEventConfig} disabled={configLoading || configSaving}>
                                        {configLoading ? "Loading..." : "Reload Config"}
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Problem Selection Start</Label>
                                        <Input
                                            type="datetime-local"
                                            value={selectionStartInput}
                                            onChange={(e) => setSelectionStartInput(e.target.value)}
                                            disabled={configLoading || configSaving}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Hackathon End Time</Label>
                                        <Input
                                            type="datetime-local"
                                            value={hackathonEndInput}
                                            onChange={(e) => setHackathonEndInput(e.target.value)}
                                            disabled={configLoading || configSaving}
                                        />
                                    </div>
                                </div>
                                <Button onClick={saveEventConfig} disabled={configLoading || configSaving} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                                    {configSaving ? "Saving..." : "Save Event Settings"}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Database Export */}
                    <Card className="border-border bg-card/50">
                        <CardHeader>
                            <CardTitle className="font-mono uppercase text-xs tracking-wider text-muted-foreground">Database Export</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-border bg-muted/20">
                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Database className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Download All Tables</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Exports Teams, Users, Problem Statements, Scores, and Notifications in Excel format.
                                        </p>
                                    </div>
                                </div>
                                <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                                    <a href="/api/admin/export">
                                        <Download className="w-4 h-4 mr-2" />
                                        Export Excel
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Teams */}
                    <Card className="border-border bg-card/50">
                        <CardHeader>
                            <CardTitle className="font-mono uppercase text-xs tracking-wider text-muted-foreground">Recent Registrations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {teams.slice(0, 5).map(team => (
                                    <div key={team.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold font-mono text-xs">
                                                {team.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">{team.name}</p>
                                                <p className="text-[10px] text-muted-foreground">{team.memberCount} members</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${team.registrationApproved ? "bg-neon-green/10 text-neon-green" : "bg-yellow-500/10 text-yellow-500"}`}>
                                                {team.registrationApproved ? "Approved" : "Pending"}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${team.paymentVerified ? "bg-neon-green/10 text-neon-green" : "bg-yellow-500/10 text-yellow-500"}`}>
                                                {team.paymentVerified ? "Paid" : "Unpaid"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {teams.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-6">No teams registered yet.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
