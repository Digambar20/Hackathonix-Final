"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const formData = new FormData(event.currentTarget);
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;

            if (!email || !password) {
                setError("Email and Team ID / Password are required");
                setIsLoading(false);
                return;
            }

            console.log("[Login] Attempting sign in with email:", email);

            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            console.log("[Login] Sign in result:", result);

            setIsLoading(false);

            if (!result) {
                setError("An unexpected error occurred. Please try again.");
                return;
            }

            if (result.error) {
                console.error("[Login] Error:", result.error);
                setError("Invalid credentials. Please check your email and Team ID.");
                return;
            }

            if (result.ok) {
                console.log("[Login] Login successful, redirecting to dashboard");
                const session = await getSession();
                const role = (session?.user as any)?.role as string | undefined;

                let targetPath = "/dashboard";
                if (role === "ADMIN" || role === "SUPERADMIN") {
                    targetPath = "/admin/dashboard";
                } else if (role === "JUDGE") {
                    targetPath = "/judge/dashboard";
                }

                router.push(targetPath);
                router.refresh();
            } else {
                setError("Login failed. Please try again.");
            }
        } catch (err) {
            console.error("[Login] Unexpected error:", err);
            setError(`An error occurred: ${err instanceof Error ? err.message : "Unknown error"}`);
            setIsLoading(false);
        }
    }

    return (
        <Card className="border-border bg-card/80 backdrop-blur-md">
            <CardHeader className="space-y-1 pb-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                        <span className="font-display font-bold text-primary-foreground text-xs">H</span>
                    </div>
                </div>
                <CardTitle className="text-xl font-display font-bold text-center uppercase tracking-wider text-foreground">
                    Team <span className="text-primary">Login</span>
                </CardTitle>
                <CardDescription className="text-center font-mono text-xs text-muted-foreground">
                    Use the Team Leader&apos;s email ID and the Team ID generated after registration as your password.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <form onSubmit={onSubmit}>
                    <div className="grid gap-4">
                        {error && (
                            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
                                {error}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="font-mono text-xs uppercase text-muted-foreground">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="team@example.com"
                                disabled={isLoading}
                                className="bg-muted/50 border-border focus:border-primary/50"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="font-mono text-xs uppercase text-muted-foreground">Team ID / Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Your Team ID or password"
                                disabled={isLoading}
                                className="bg-muted/50 border-border focus:border-primary/50"
                                required
                            />
                        </div>
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2 font-bold" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            ACCESS TERMINAL
                        </Button>
                    </div>
                </form>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                </div>
                <Link href="/register">
                    <Button variant="outline" className="w-full border-border hover:bg-muted text-muted-foreground hover:text-foreground" disabled={isLoading}>
                        Register New Team
                    </Button>
                </Link>
                <Link href="/admin-login">
                    <Button variant="outline" className="w-full border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200" disabled={isLoading}>
                        Admin Access Portal
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
