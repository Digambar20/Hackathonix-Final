"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, ShieldAlert, Users } from "lucide-react";

type Team = {
    id: string;
    name: string;
    memberCount: number;
    registrationApproved: boolean;
    createdAt: string;
};

export default function AdminApprovalsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [customMessages, setCustomMessages] = useState<Record<string, string>>({});

    const pendingTeams = useMemo(
        () => teams.filter((team) => !team.registrationApproved),
        [teams]
    );

    const fetchTeams = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/teams");
            const data = await res.json();
            setTeams(Array.isArray(data) ? data : []);
        } catch {
            setTeams([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const approveTeam = async (team: Team) => {
        setActionLoading(team.id);
        try {
            const custom = customMessages[team.id]?.trim();
            const res = await fetch(`/api/admin/teams/${team.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    registrationApproved: true,
                    notificationMessage: custom || `Congratulations ${team.name}! Your registration has been approved.`,
                }),
            });
            if (res.ok) {
                setTeams((prev) =>
                    prev.map((t) => (t.id === team.id ? { ...t, registrationApproved: true } : t))
                );
            }
        } catch { }
        setActionLoading(null);
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wider text-foreground">
                    Team <span className="text-primary">Approvals</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Approve registrations and send notifications to team dashboards.
                </p>
            </motion.div>

            <Card className="border-border bg-card/50">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-mono uppercase tracking-wider text-muted-foreground">
                        Pending Registrations
                    </CardTitle>
                    <Button variant="outline" size="sm" className="font-mono text-xs" onClick={fetchTeams} disabled={loading}>
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-10 text-muted-foreground">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading teams...
                        </div>
                    ) : pendingTeams.length === 0 ? (
                        <div className="text-center py-10">
                            <CheckCircle2 className="w-10 h-10 text-neon-green mx-auto mb-3" />
                            <p className="text-lg font-bold text-foreground">No pending approvals</p>
                            <p className="text-sm text-muted-foreground mt-1">All currently registered teams are approved.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingTeams.map((team, i) => (
                                <motion.div
                                    key={team.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="rounded-xl border border-border bg-background/40 p-4 space-y-3"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-foreground truncate">{team.name}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <Users className="w-3 h-3" />
                                                {team.memberCount} members
                                            </p>
                                        </div>
                                        <div className="px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-mono uppercase flex items-center gap-1 shrink-0">
                                            <ShieldAlert className="w-3 h-3" />
                                            Pending
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor={`msg-${team.id}`} className="text-[10px] font-mono uppercase text-muted-foreground">
                                            Notification Message
                                        </Label>
                                        <Input
                                            id={`msg-${team.id}`}
                                            value={customMessages[team.id] ?? ""}
                                            onChange={(e) => setCustomMessages((prev) => ({ ...prev, [team.id]: e.target.value }))}
                                            placeholder="Optional custom message to team dashboard"
                                            className="h-9 bg-muted/40 border-border"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            onClick={() => approveTeam(team)}
                                            disabled={actionLoading === team.id}
                                            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs"
                                        >
                                            {actionLoading === team.id ? (
                                                <>
                                                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                                    Approving...
                                                </>
                                            ) : (
                                                <>Approve & Notify</>
                                            )}
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
