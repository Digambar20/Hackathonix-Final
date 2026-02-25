"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, ShieldAlert, Trash2, UserPlus, KeyRound } from "lucide-react";

type AdminUser = {
    id: string;
    name: string;
    email: string;
    isSuperAdmin: boolean;
    createdAt: string;
};

export default function AdminUsersPage() {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [generatedPassword, setGeneratedPassword] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/admins");
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to load admins");
                setAdmins([]);
            } else {
                setAdmins(Array.isArray(data) ? data : []);
            }
        } catch {
            setError("Network error while fetching admins");
            setAdmins([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    const createAdmin = async () => {
        setSubmitting(true);
        setError("");
        setMessage("");
        setGeneratedPassword("");

        try {
            const res = await fetch("/api/admin/admins", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Failed to create admin");
                return;
            }

            setMessage(data.message || "Admin created successfully");
            setGeneratedPassword(data.generatedPassword || "");
            setName("");
            setEmail("");
            await fetchAdmins();
        } catch {
            setError("Network error while creating admin");
        } finally {
            setSubmitting(false);
        }
    };

    const removeAdmin = async (admin: AdminUser) => {
        if (!confirm(`Remove admin access for ${admin.email}?`)) return;
        setDeletingId(admin.id);
        setError("");
        setMessage("");
        try {
            const res = await fetch(`/api/admin/admins/${admin.id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to remove admin");
                return;
            }
            setMessage("Admin removed successfully");
            await fetchAdmins();
        } catch {
            setError("Network error while removing admin");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wider text-foreground">
                    Manage <span className="text-primary">Admins</span>
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Superadmins can add new admins and revert added admin accounts.
                </p>
            </motion.div>

            {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
                    {error}
                </div>
            )}
            {message && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-mono">
                    {message}
                </div>
            )}

            <Card className="border-border bg-card/50">
                <CardHeader>
                    <CardTitle className="font-mono uppercase text-xs tracking-wider text-muted-foreground flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-primary" />
                        Add Admin
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Admin name" className="bg-muted/50" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Email</Label>
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" className="bg-muted/50" />
                        </div>
                    </div>
                    <Button
                        onClick={createAdmin}
                        disabled={!name.trim() || !email.trim() || submitting}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                        Create Admin + Generate Password
                    </Button>

                    {generatedPassword && (
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200">
                            <p className="text-xs font-mono uppercase mb-1">Generated Password (show once)</p>
                            <p className="font-mono text-sm break-all">{generatedPassword}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-border bg-card/50">
                <CardHeader>
                    <CardTitle className="font-mono uppercase text-xs tracking-wider text-muted-foreground">
                        Existing Admins
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading admins...
                        </div>
                    ) : admins.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No admin users found.</p>
                    ) : (
                        <div className="space-y-2">
                            {admins.map((admin) => (
                                <div key={admin.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                                    <div>
                                        <p className="text-sm font-bold text-foreground">{admin.name}</p>
                                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {admin.isSuperAdmin ? (
                                            <span className="px-2 py-1 rounded-full text-[10px] font-mono bg-primary/10 text-primary flex items-center gap-1">
                                                <ShieldCheck className="w-3 h-3" /> SUPERADMIN
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-[10px] font-mono bg-muted text-muted-foreground flex items-center gap-1">
                                                <ShieldAlert className="w-3 h-3" /> ADMIN
                                            </span>
                                        )}

                                        {!admin.isSuperAdmin && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                                                disabled={deletingId === admin.id}
                                                onClick={() => removeAdmin(admin)}
                                            >
                                                {deletingId === admin.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                                ) : (
                                                    <Trash2 className="w-3 h-3 mr-1" />
                                                )}
                                                Revert
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
