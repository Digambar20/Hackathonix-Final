"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, FileCode, CheckCircle, CreditCard, Activity, Shield, BarChart3, Database, Download } from "lucide-react";
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

    useEffect(() => {
        fetch("/api/admin/teams")
            .then(r => r.json())
            .then(data => setTeams(Array.isArray(data) ? data : []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const totalTeams = teams.length;
    const totalMembers = teams.reduce((s, t) => s + t.memberCount, 0);
    const approvedTeams = teams.filter(t => t.registrationApproved).length;
    const paidTeams = teams.filter(t => t.paymentVerified).length;
    const lockedTeams = teams.filter(t => t.psStatus === "LOCKED").length;
    const repoLinked = teams.filter(t => !!t.repoUrl).length;
    const scoredTeams = teams.filter(t => t.avgScore !== null).length;

    const stats = [
        { icon: Users, label: "Total Teams", value: totalTeams, color: "text-primary" },
        { icon: Users, label: "Participants", value: totalMembers, color: "text-blue-400" },
        { icon: Shield, label: "Approved", value: `${approvedTeams} / ${totalTeams}`, color: "text-neon-green" },
        { icon: CreditCard, label: "Payment Verified", value: `${paidTeams} / ${totalTeams}`, color: "text-neon-green" },
        { icon: FileCode, label: "PS Locked", value: lockedTeams, color: "text-yellow-500" },
        { icon: Activity, label: "Repo Linked", value: repoLinked, color: "text-blue-400" },
        { icon: BarChart3, label: "Scored", value: scoredTeams, color: "text-purple-400" },
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
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                            </div>
                        </CardContent>
                    </Card>

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
