"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Search, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import { useEffect, useState } from "react";

export function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [teamName, setTeamName] = useState("Team");
    const [teamId, setTeamId] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        fetch("/api/teams")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!mounted || !data) return;
                if (data.name) setTeamName(data.name);
                if (data.id) setTeamId(data.id);
            })
            .catch(() => { });
        return () => {
            mounted = false;
        };
    }, []);

    const initials = teamName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("") || "TM";

    return (
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {/* Mobile sidebar trigger */}
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                    <SheetTrigger asChild className="md:hidden">
                        <Button variant="ghost" size="icon" className="text-muted-foreground">
                            <Menu className="w-5 h-5" />
                            <span className="sr-only">Toggle sidebar</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64 bg-sidebar border-border">
                        <Sidebar className="flex relative w-full" />
                    </SheetContent>
                </Sheet>

                <div className="relative w-full max-w-sm hidden md:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search docs, problems..."
                        className="pl-9 h-9 bg-muted/50 border-border"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/[0.06] border border-primary/20">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-xs font-mono font-bold text-primary">LIVE EVENT</span>
                </div>

                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Bell className="w-4 h-4" />
                    <span className="sr-only">Notifications</span>
                </Button>

                <div className="h-6 w-px bg-border mx-1" />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold leading-none text-foreground">{teamName}</p>
                        <p className="text-xs text-muted-foreground">Team ID: {teamId ?? "—"}</p>
                    </div>
                    <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage src="/avatar-placeholder.png" alt="Team avatar" />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
}
