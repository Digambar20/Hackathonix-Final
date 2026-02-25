"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileCode, Plus, Trash2, Loader2, Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Problem = {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    description: string;
    tags: string[];
    teamCount: number;
};

export default function AdminProblemsPage() {
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        difficulty: "MEDIUM" as "EASY" | "MEDIUM" | "HARD",
        tagsStr: "",
    });

    const fetchProblems = useCallback(() => {
        setLoading(true);
        fetch("/api/problems")
            .then(r => r.json())
            .then(data => setProblems(Array.isArray(data) ? data : []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { fetchProblems(); }, [fetchProblems]);

    const createProblem = async () => {
        setSubmitting(true);
        try {
            const res = await fetch("/api/admin/problems", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    category: form.category,
                    difficulty: form.difficulty,
                    tags: form.tagsStr.split(",").map(t => t.trim()).filter(Boolean),
                }),
            });
            if (res.ok) {
                setForm({ title: "", description: "", category: "", difficulty: "MEDIUM", tagsStr: "" });
                setShowForm(false);
                fetchProblems();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to create problem statement");
            }
        } catch {
            alert("Network error");
        }
        setSubmitting(false);
    };

    const deleteProblem = async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/problems?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setProblems(prev => prev.filter(p => p.id !== id));
            } else {
                const err = await res.json();
                alert(err.error || "Failed to delete");
            }
        } catch { }
        setDeleting(null);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wider text-foreground">
                            Problem <span className="text-primary">Statements</span>
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">{problems.length} problem statements</p>
                    </div>
                    <Button
                        onClick={() => setShowForm(!showForm)}
                        className={showForm ? "bg-muted text-muted-foreground hover:bg-muted/80" : "bg-primary text-primary-foreground hover:bg-primary/90"}
                        size="sm"
                    >
                        {showForm ? <><X className="w-4 h-4 mr-1" />Cancel</> : <><Plus className="w-4 h-4 mr-1" />Add New</>}
                    </Button>
                </div>
            </motion.div>

            {/* Add Problem Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="border-primary/30 bg-primary/[0.04]">
                            <CardHeader>
                                <CardTitle className="font-mono uppercase text-xs tracking-wider text-muted-foreground">New Problem Statement</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">Title *</Label>
                                        <Input
                                            placeholder="E.g. AI-Powered Scheduling"
                                            value={form.title}
                                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                            className="bg-muted/50"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Category *</Label>
                                            <Input
                                                placeholder="E.g. AI/ML"
                                                value={form.category}
                                                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                                className="bg-muted/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">Difficulty *</Label>
                                            <select
                                                value={form.difficulty}
                                                onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as any }))}
                                                className="w-full h-10 px-3 rounded-md border border-border bg-muted/50 text-foreground text-sm"
                                            >
                                                <option value="EASY">Easy</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="HARD">Hard</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Description *</Label>
                                    <textarea
                                        placeholder="Describe the problem statement in detail..."
                                        value={form.description}
                                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                        rows={3}
                                        className="w-full px-3 py-2 rounded-md border border-border bg-muted/50 text-foreground text-sm resize-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Tags (comma-separated)</Label>
                                    <Input
                                        placeholder="E.g. ai, scheduling, optimization"
                                        value={form.tagsStr}
                                        onChange={e => setForm(f => ({ ...f, tagsStr: e.target.value }))}
                                        className="bg-muted/50"
                                    />
                                </div>
                                <Button
                                    onClick={createProblem}
                                    disabled={!form.title || !form.description || !form.category || submitting}
                                    className="bg-primary text-primary-foreground font-bold"
                                >
                                    {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</> : <><Plus className="w-4 h-4 mr-2" />Create Problem Statement</>}
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Problems List */}
            {loading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading problems...
                </div>
            ) : problems.length === 0 ? (
                <div className="text-center py-16">
                    <FileCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-bold text-foreground">No problem statements yet</p>
                    <p className="text-sm text-muted-foreground">Click "Add New" to create one.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {problems.map((ps, i) => (
                        <motion.div
                            key={ps.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                        >
                            <Card className="border-border bg-card/50 h-full flex flex-col">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`text-[10px] font-mono uppercase ${ps.difficulty === "HARD" ? "border-destructive/50 text-destructive" : ps.difficulty === "MEDIUM" ? "border-yellow-500/50 text-yellow-500" : "border-neon-green/50 text-neon-green"}`}>
                                                {ps.difficulty}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-muted text-muted-foreground border-none text-[10px]">{ps.category}</Badge>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                            onClick={() => deleteProblem(ps.id, ps.title)}
                                            disabled={deleting === ps.id}
                                        >
                                            {deleting === ps.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                        </Button>
                                    </div>
                                    <CardTitle className="text-sm font-display leading-tight mt-2 text-foreground">{ps.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-xs text-muted-foreground line-clamp-3 mb-3">{ps.description}</p>
                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        {ps.tags.map(tag => (
                                            <span key={tag} className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Users className="w-3 h-3" />
                                        <span>{ps.teamCount} team{ps.teamCount !== 1 ? "s" : ""}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
