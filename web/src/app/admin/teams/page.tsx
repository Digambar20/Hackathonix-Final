"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, Github, ChevronDown, ChevronUp, Trash2, Shield, ShieldCheck, CreditCard, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Member = { id: string; name: string; email: string };
type Team = {
    id: string;
    name: string;
    memberCount: number;
    members: Member[];
    problemStatement: { id: string; title: string; category: string } | null;
    psStatus: string;
    repoUrl: string | null;
    registrationApproved: boolean;
    paymentVerified: boolean;
    avgScore: number | null;
};

export default function AdminTeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchTeams = useCallback(() => {
        setLoading(true);
        fetch("/api/admin/teams")
            .then(r => r.json())
            .then(data => setTeams(Array.isArray(data) ? data : []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchTeams(); }, [fetchTeams]);

    const toggleApproval = async (teamId: string, current: boolean) => {
        setActionLoading(teamId + "_reg");
        try {
            const res = await fetch(`/api/admin/teams/${teamId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ registrationApproved: !current }),
            });
            if (res.ok) {
                setTeams(prev => prev.map(t =>
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
                setTeams(prev => prev.map(t =>
                    t.id === teamId ? { ...t, paymentVerified: !current } : t
                ));
            }
        } catch { }
        setActionLoading(null);
    };

    const deleteTeam = async (teamId: string, teamName: string) => {
        if (!confirm(`Are you sure you want to delete team "${teamName}"? This action cannot be undone.`)) return;
        setActionLoading(teamId + "_del");
        try {
            const res = await fetch(`/api/admin/teams/${teamId}`, { method: "DELETE" });
            if (res.ok) {
                setTeams(prev => prev.filter(t => t.id !== teamId));
            }
        } catch { }
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
                    <Button variant="outline" size="sm" onClick={fetchTeams} disabled={loading} className="font-mono text-xs">
                        Refresh
                    </Button>
                </div>
            </motion.div>

            {loading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading teams...
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
                                    {/* Top Row */}
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
                                            {/* Approval Toggle */}
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

                                            {/* Payment Toggle */}
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

                                            {/* Expand */}
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

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {expandedId === team.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-4 pt-4 border-t border-border space-y-4">
                                                    {/* Members */}
                                                    <div>
                                                        <p className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Members</p>
                                                        <div className="space-y-1.5">
                                                            {team.members.map(m => (
                                                                <div key={m.id} className="flex items-center gap-2 text-xs">
                                                                    <span className="text-foreground font-bold">{m.name}</span>
                                                                    <span className="text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{m.email}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Details Grid */}
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
                                                    </div>

                                                    {/* Delete */}
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
