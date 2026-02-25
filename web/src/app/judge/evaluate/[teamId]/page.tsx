"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, CheckCircle, Github, ExternalLink, FileCode, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const criteria = [
    { key: "commitFrequency", label: "Commit Frequency", desc: "Consistent, meaningful commits throughout the event" },
    { key: "codeQuality", label: "Code Quality", desc: "Clean code, good structure, proper naming, documentation" },
    { key: "problemRelevance", label: "Problem Relevance", desc: "How well the solution addresses the chosen problem" },
    { key: "innovation", label: "Innovation & Creativity", desc: "Unique approach, creative solutions, technical depth" },
] as const;

export default function EvaluatePage() {
    const params = useParams();
    const teamId = params.teamId as string;

    const [scores, setScores] = useState({
        commitFrequency: 0,
        codeQuality: 0,
        problemRelevance: 0,
        innovation: 0,
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const total = Object.values(scores).reduce((acc, v) => acc + v, 0);

    const handleChange = (key: string, value: string) => {
        const num = Math.min(25, Math.max(0, parseInt(value) || 0));
        setScores(prev => ({ ...prev, [key]: num }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/scores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamId, ...scores }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSubmitted(true);
        } catch (err: any) {
            setError(err.message || "Failed to submit scores");
        }
        setSubmitting(false);
    };

    if (submitted) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 mb-6">
                    <CheckCircle className="w-10 h-10 text-primary" />
                </motion.div>
                <h2 className="text-3xl font-display font-bold uppercase">Score Submitted!</h2>
                <p className="text-muted-foreground mt-2">Total: <span className="text-primary font-bold font-mono">{total}/100</span></p>
                <Link href="/judge/dashboard">
                    <Button className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/judge/dashboard">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-display font-bold uppercase tracking-wider">
                        Evaluate <span className="text-primary">Team</span>
                    </h1>
                    <p className="text-xs font-mono text-muted-foreground mt-1">Team ID: {teamId}</p>
                </div>
            </div>

            {/* Score Total Bar */}
            <Card className="glass-card border-primary/30 bg-primary/5">
                <CardContent className="pt-6 flex items-center justify-between">
                    <div>
                        <div className="text-xs font-mono text-primary uppercase">Total Score</div>
                        <div className="text-4xl font-bold font-mono text-primary">{total}<span className="text-lg text-muted-foreground">/100</span></div>
                    </div>
                    <div className="w-48 h-3 bg-background/50 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                            animate={{ width: `${total}%` }}
                            transition={{ type: "spring", stiffness: 60 }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Criteria Cards */}
            {criteria.map((c, i) => (
                <motion.div key={c.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                    <Card className="glass-card border-border/50">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <Label className="font-bold text-sm">{c.label}</Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={0}
                                        max={25}
                                        value={scores[c.key]}
                                        onChange={(e) => handleChange(c.key, e.target.value)}
                                        className="w-20 text-center font-mono text-lg bg-background/50 border-border"
                                    />
                                    <span className="text-xs text-muted-foreground font-mono">/25</span>
                                </div>
                            </div>
                            {/* Visual bar */}
                            <div className="mt-3 h-1.5 bg-background/50 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                                    animate={{ width: `${(scores[c.key] / 25) * 100}%` }}
                                    transition={{ type: "spring", stiffness: 80 }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}

            {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
                    {error}
                </div>
            )}

            <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg py-6"
                onClick={handleSubmit}
                disabled={submitting || total === 0}
            >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                Submit Evaluation
            </Button>
        </div>
    );
}
