"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { getSession, signIn, signOut } from "next-auth/react";

export function AdminLoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const formData = new FormData(event.currentTarget);
            const email = (formData.get("email") as string)?.trim().toLowerCase();
            const password = formData.get("password") as string;

            if (!email || !password) {
                setError("Admin email and password are required");
                setIsLoading(false);
                return;
            }

            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
                callbackUrl: "/admin/dashboard",
            });

            if (!result || result.error) {
                setError("Invalid admin credentials.");
                setIsLoading(false);
                return;
            }

            const session = await getSession();
            const role = (session?.user as any)?.role as string | undefined;

            if (role !== "ADMIN" && role !== "SUPERADMIN") {
                await signOut({ redirect: false });
                setError("This account does not have admin access.");
                setIsLoading(false);
                return;
            }

            router.replace(result.url || "/admin/dashboard");
            router.refresh();
            setIsLoading(false);
        } catch (err) {
            setError(`Login error: ${err instanceof Error ? err.message : "Unknown error"}`);
            setIsLoading(false);
        }
    }

    return (
        <Card className="border-amber-500/30 bg-card/85 backdrop-blur-md shadow-[0_0_45px_rgba(245,158,11,0.12)]">
            <CardHeader className="space-y-1 pb-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-9 h-9 bg-amber-500 rounded-md flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5 text-black" />
                    </div>
                </div>
                <CardTitle className="text-xl font-display font-bold text-center uppercase tracking-wider text-foreground">
                    Admin <span className="text-amber-400">Access</span>
                </CardTitle>
                <CardDescription className="text-center font-mono text-xs text-muted-foreground">
                    Restricted control panel login for authorized admins.
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
                            <Label htmlFor="email" className="font-mono text-xs uppercase text-muted-foreground">Admin Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@hackthonix.in"
                                disabled={isLoading}
                                className="bg-muted/50 border-amber-500/20 focus:border-amber-400"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="font-mono text-xs uppercase text-muted-foreground">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Admin password"
                                disabled={isLoading}
                                className="bg-muted/50 border-amber-500/20 focus:border-amber-400"
                                required
                            />
                        </div>
                        <Button
                            className="w-full bg-amber-500 text-black hover:bg-amber-400 mt-2 font-bold"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            ENTER ADMIN PANEL
                        </Button>
                    </div>
                </form>

                <Link href="/login">
                    <Button variant="outline" className="w-full border-border hover:bg-muted text-muted-foreground hover:text-foreground" disabled={isLoading}>
                        Back To Team Login
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
