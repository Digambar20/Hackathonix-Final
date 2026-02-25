"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { CountdownTimer } from "@/components/registration/CountdownTimer";
import { RegistrationStats } from "@/components/registration/RegistrationStats";

export function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState<{ teamId: string; message: string } | null>(null);
    const [teamName, setTeamName] = useState("");
    const [collegeName, setCollegeName] = useState("");
    const [teamLeaderName, setTeamLeaderName] = useState("");
    const [teamLeaderEmail, setTeamLeaderEmail] = useState("");
    const [teamLeaderPhone, setTeamLeaderPhone] = useState("");
    const [members, setMembers] = useState([
        { name: "", email: "" },
        { name: "", email: "" },
    ]);
    const router = useRouter();

    // Max 4 total members including team leader, so max 3 additional members
    const MAX_ADDITIONAL_MEMBERS = 3;
    const canAddMember = members.length < MAX_ADDITIONAL_MEMBERS;
    const canRemoveMember = members.length > 1; // At least 1 additional member

    const addMember = () => {
        if (canAddMember) {
            setMembers([...members, { name: "", email: "" }]);
        }
    };

    const removeMember = (index: number) => {
        if (canRemoveMember) {
            setMembers(members.filter((_, i) => i !== index));
        }
    };

    const updateMember = (index: number, field: "name" | "email", value: string) => {
        const updated = [...members];
        updated[index][field] = value;
        setMembers(updated);
    };

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/teams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamName, collegeName, teamLeaderName, teamLeaderEmail, teamLeaderPhone, members }),
            });

            let data;
            try {
                data = await res.json();
            } catch (parseErr) {
                console.error("Failed to parse response:", parseErr, "Status:", res.status);
                setError(`Server error (HTTP ${res.status}): Invalid response. Please check if the server is running.`);
                setIsLoading(false);
                return;
            }

            if (!res.ok) {
                setError(data.error || `Registration failed (HTTP ${res.status})`);
                setIsLoading(false);
                return;
            }

            setSuccess({ teamId: data.team.id, message: data.message });
            setIsLoading(false);
        } catch (err) {
            console.error("Registration error:", err);
            const errorMessage = err instanceof Error ? err.message : "Network error";
            setError(`Network error: ${errorMessage}. Please check your connection and ensure the server is running.`);
            setIsLoading(false);
        }
    }

    if (success) {
        return (
            <Card className="border-border bg-card/80 backdrop-blur-md w-full max-w-lg mx-auto">
                <CardContent className="pt-6 space-y-4 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-display font-bold uppercase text-primary">Registration Complete!</h2>
                    <p className="text-sm text-muted-foreground">{success.message}</p>
                    <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
                        <div>
                            <p className="font-mono text-xs text-muted-foreground uppercase mb-1">Team ID (Your Password)</p>
                            <p className="font-mono text-lg text-primary font-bold select-all">{success.teamId}</p>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Use your email and the Team ID above to login.</p>
                    <Link href="/login">
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold mt-2">
                            GO TO LOGIN
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto space-y-4">
            {/* Countdown Timer */}
            <CountdownTimer />

            {/* Registration Stats */}
            <RegistrationStats />

            <Card className="border-border bg-card/80 backdrop-blur-md w-full max-w-lg">
                <CardHeader className="space-y-1 pb-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                            <span className="font-display font-bold text-primary-foreground text-xs">H</span>
                        </div>
                    </div>
                    <CardTitle className="text-xl font-display font-bold text-center uppercase tracking-wider text-foreground">
                        Register <span className="text-primary">Team</span>
                    </CardTitle>
                    <CardDescription className="text-center font-mono text-xs text-muted-foreground">
                        Create your team profile for Hackthonix 2.0
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="grid gap-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
                                {error}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="teamName" className="font-mono text-xs uppercase text-muted-foreground">Team Name</Label>
                            <Input
                                id="teamName"
                                placeholder="e.g. Binary Bandits"
                                disabled={isLoading}
                                className="bg-muted/50 border-border focus:border-primary/50"
                                required
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                            />
                        </div>

                    <div className="grid gap-2">
                        <Label htmlFor="collegeName" className="font-mono text-xs uppercase text-muted-foreground">College Name</Label>
                        <Input
                            id="collegeName"
                            placeholder="e.g. MIT, Stanford"
                            disabled={isLoading}
                            className="bg-muted/50 border-border focus:border-primary/50"
                            required
                            value={collegeName}
                            onChange={(e) => setCollegeName(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="teamLeaderName" className="font-mono text-xs uppercase text-muted-foreground">Team Leader Name</Label>
                        <Input
                            id="teamLeaderName"
                            placeholder="e.g. John Doe"
                            disabled={isLoading}
                            className="bg-muted/50 border-border focus:border-primary/50"
                            required
                            value={teamLeaderName}
                            onChange={(e) => setTeamLeaderName(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="teamLeaderEmail" className="font-mono text-xs uppercase text-muted-foreground">Team Leader Email</Label>
                        <Input
                            id="teamLeaderEmail"
                            placeholder="e.g. leader@example.com"
                            type="email"
                            disabled={isLoading}
                            className="bg-muted/50 border-border focus:border-primary/50"
                            required
                            value={teamLeaderEmail}
                            onChange={(e) => setTeamLeaderEmail(e.target.value)}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="teamLeaderPhone" className="font-mono text-xs uppercase text-muted-foreground">Team Leader Phone</Label>
                        <Input
                            id="teamLeaderPhone"
                            placeholder="e.g. 9876543210"
                            disabled={isLoading}
                            className="bg-muted/50 border-border focus:border-primary/50"
                            required
                            value={teamLeaderPhone}
                            onChange={(e) => setTeamLeaderPhone(e.target.value)}
                            maxLength={10}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="font-mono text-xs uppercase text-muted-foreground">Additional Team Members</Label>
                            <span className="text-[10px] text-muted-foreground font-mono">{members.length}/3 Members (+ Team Leader = {members.length + 1}/4 Total)</span>
                        </div>

                        {members.map((member, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="grid gap-2 flex-1">
                                    <Input
                                        placeholder="Name"
                                        className="h-9 text-xs bg-muted/50 border-border"
                                        required
                                        value={member.name}
                                        onChange={(e) => updateMember(index, "name", e.target.value)}
                                    />
                                    <Input
                                        placeholder="Email"
                                        type="email"
                                        className="h-9 text-xs bg-muted/50 border-border"
                                        required
                                        value={member.email}
                                        onChange={(e) => updateMember(index, "email", e.target.value)}
                                    />
                                </div>
                                {canRemoveMember && (
                                    <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => removeMember(index)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}

                        {canAddMember && (
                            <Button type="button" variant="outline" size="sm" className="w-full border-dashed border-border hover:border-primary/30 hover:bg-primary/[0.04] text-muted-foreground" onClick={addMember}>
                                <Plus className="w-4 h-4 mr-2" /> Add Member
                            </Button>
                        )}
                    </div>

                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4 font-bold" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            INITIATE REGISTRATION
                        </Button>

                        <div className="text-center text-xs text-muted-foreground mt-2">
                            Already registered? <Link href="/login" className="text-primary hover:underline underline-offset-4">Login here</Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
