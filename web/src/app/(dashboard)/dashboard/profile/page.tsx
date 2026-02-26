"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Mail, Shield, Clock, FileCode, Github, Copy, CheckCircle, CreditCard, ShieldCheck, AlertTriangle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
    const { data: session } = useSession();
    const [copied, setCopied] = useState(false);
    const [team, setTeam] = useState<any>(null);

    const user = session?.user as any;

    useEffect(() => {
        if (user?.teamId) {
            fetch(`/api/teams/${user.teamId}`).then(r => r.json()).then(setTeam).catch(() => { });
        }
        // Also fetch from /api/teams for status fields
        fetch("/api/teams").then(r => r.json()).then(data => {
            if (data && !data.error) setTeam((prev: any) => ({ ...prev, ...data }));
        }).catch(() => { });
    }, [user?.teamId]);

    const copyTeamId = () => {
        if (user?.teamId) {
            navigator.clipboard.writeText(user.teamId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const isRegApproved = team?.registrationApproved ?? false;
    const isPayVerified = team?.paymentVerified ?? false;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wider text-foreground">
                    Team <span className="text-primary">Profile</span>
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">Your team information and event status.</p>
            </motion.div>

            {/* Registration & Payment Status */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className={`border-border bg-card/50 ${isRegApproved ? "border-neon-green/30" : "border-yellow-500/30"}`}>
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isRegApproved ? "bg-neon-green/10" : "bg-yellow-500/10"}`}>
                                    {isRegApproved
                                        ? <ShieldCheck className="w-5 h-5 text-neon-green" />
                                        : <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                    }
                                </div>
                                <div>
                                    <p className="text-[10px] font-mono text-muted-foreground uppercase">Registration</p>
                                    <p className={`text-lg font-bold font-display uppercase ${isRegApproved ? "text-neon-green" : "text-yellow-500"}`}>
                                        {isRegApproved ? "Confirmed" : "Pending Approval"}
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {isRegApproved ? "Your team registration has been approved by the admin." : "Waiting for admin to approve your registration."}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className={`border-border bg-card/50 ${isPayVerified ? "border-neon-green/30" : "border-yellow-500/30"}`}>
                        <CardContent className="pt-5 pb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPayVerified ? "bg-neon-green/10" : "bg-yellow-500/10"}`}>
                                    {isPayVerified
                                        ? <CreditCard className="w-5 h-5 text-neon-green" />
                                        : <CreditCard className="w-5 h-5 text-yellow-500" />
                                    }
                                </div>
                                <div>
                                    <p className="text-[10px] font-mono text-muted-foreground uppercase">Payment</p>
                                    <p className={`text-lg font-bold font-display uppercase ${isPayVerified ? "text-neon-green" : "text-yellow-500"}`}>
                                        {isPayVerified ? "Verified" : "Not Verified"}
                                    </p>
                                </div>
                            </div>
                            {isPayVerified ? (
                                <p className="text-xs text-muted-foreground mt-2">Payment has been confirmed by the admin.</p>
                            ) : (
                                <p className="text-xs text-yellow-500 mt-2">Payment is pending verification.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </motion.div>

            {/* Team Info Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-border bg-card/50">
                    <CardHeader>
                        <CardTitle className="font-mono uppercase text-xs tracking-wider flex items-center gap-2 text-muted-foreground">
                            <Shield className="w-4 h-4 text-primary" />
                            Team Identity
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-5">
                            <Avatar className="w-14 h-14 border-2 border-primary/20">
                                <AvatarFallback className="bg-primary/10 text-primary text-lg font-display">
                                    {(team?.name || user?.name || "T")[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-bold font-display uppercase text-foreground">{team?.name || user?.name || "Team"}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-mono text-muted-foreground">ID:</span>
                                    <code className="text-xs font-mono text-primary bg-primary/[0.06] px-2 py-0.5 rounded">
                                        {user?.teamId || "N/A"}
                                    </code>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyTeamId}>
                                        {copied ? <CheckCircle className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { icon: Users, label: "Members", value: team?.members?.length || team?.memberCount || "-" },
                                { icon: FileCode, label: "Problem", value: team?.problemStatement?.title || "Not selected" },
                                { icon: Clock, label: "PS Status", value: team?.psStatus || "NONE" },
                                { icon: Github, label: "Repo", value: team?.repoUrl ? "Linked" : "Not linked" },
                            ].map((stat, i) => (
                                <div key={i} className="p-3 rounded-lg bg-muted/30 border border-border">
                                    <stat.icon className="w-4 h-4 text-muted-foreground mb-1.5" />
                                    <div className="text-[10px] text-muted-foreground uppercase font-mono">{stat.label}</div>
                                    <div className="text-sm font-bold truncate text-foreground">{String(stat.value)}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Members List */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="border-border bg-card/50">
                    <CardHeader>
                        <CardTitle className="font-mono uppercase text-xs tracking-wider flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4 text-primary" />
                            Team Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {(team?.members || []).map((member: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 border border-border">
                                    <Avatar className="h-9 w-9 border border-border">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                            {member.name?.[0] || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground">{member.name}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                            <Mail className="w-3 h-3 shrink-0" /> {member.email}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(!team?.members || team.members.length === 0) && (
                                <p className="text-sm text-muted-foreground text-center py-6">Loading team members...</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
