"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, FileCode, Github, ExternalLink, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function JudgeDashboardPage() {
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/teams")
            .then(r => r.json())
            .then(data => { setTeams(Array.isArray(data) ? data : []); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const scoredCount = teams.filter(t => (typeof t.scoresCount === "number" ? t.scoresCount > 0 : t.avgScore !== null)).length;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-display font-bold uppercase tracking-wider">
                    Judge <span className="text-primary">Dashboard</span>
                </h1>
                <p className="text-muted-foreground mt-1">Evaluate participating teams.</p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass-card border-border/50">
                    <CardContent className="pt-6">
                        <div className="text-xs font-mono text-muted-foreground uppercase">Total Teams</div>
                        <div className="text-3xl font-bold font-mono mt-1">{teams.length}</div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-primary/30 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="text-xs font-mono text-primary uppercase">Evaluated</div>
                        <div className="text-3xl font-bold font-mono mt-1 text-primary">{scoredCount}</div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-[#ffa500]/30 bg-[#ffa500]/5">
                    <CardContent className="pt-6">
                        <div className="text-xs font-mono text-[#ffa500] uppercase">Remaining</div>
                        <div className="text-3xl font-bold font-mono mt-1 text-[#ffa500]">{teams.length - scoredCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Teams List */}
            <Card className="glass-card border-border/50">
                <CardHeader>
                    <CardTitle className="font-mono uppercase text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        Assigned Teams
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Loading teams...</p>
                    ) : teams.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No teams registered yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {teams.map((team, i) => (
                                <motion.div
                                    key={team.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/30 hover:bg-background transition-all"
                                >
                                    <Avatar className="h-10 w-10 border border-border">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-display">
                                            {team.name?.[0] || "T"}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm">{team.name}</p>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" /> {team.memberCount} members
                                            </span>
                                            {team.problemStatement && (
                                                <span className="flex items-center gap-1 truncate">
                                                    <FileCode className="w-3 h-3" /> {team.problemStatement.title}
                                                </span>
                                            )}
                                            {team.repoUrl && (
                                                <a href={team.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                                    <Github className="w-3 h-3" /> Repo <ExternalLink className="w-2.5 h-2.5" />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {team.avgScore !== null ? (
                                            <div className="text-right">
                                                <div className="text-lg font-bold font-mono text-primary">{team.avgScore}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">/ 100</div>
                                            </div>
                                        ) : (
                                            <span className="text-xs font-mono text-[#ffa500] bg-[#ffa500]/10 px-2 py-1 rounded">PENDING</span>
                                        )}

                                        <Link href={`/judge/evaluate/${team.id}`}>
                                            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-1">
                                                Evaluate <ArrowRight className="w-3 h-3" />
                                            </Button>
                                        </Link>
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
