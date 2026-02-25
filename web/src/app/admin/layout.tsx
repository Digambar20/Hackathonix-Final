"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, FileCode, LogOut, Shield, Menu, Bell } from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },
    { icon: Bell, label: "Approvals", href: "/admin/approvals" },
    { icon: Users, label: "Teams", href: "/admin/teams" },
    { icon: FileCode, label: "Problems", href: "/admin/problems" },
];

function AdminSidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <aside className={cn("w-64 h-screen border-r border-border bg-sidebar backdrop-blur-xl flex-col fixed left-0 top-0", className)}>
            <div className="h-16 flex items-center px-6 border-b border-border">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-destructive rounded-md flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5 text-destructive-foreground" />
                    </div>
                    <span className="font-display font-bold tracking-wider text-sm text-foreground">ADMIN PANEL</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                    isActive && "bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="font-medium text-sm">{item.label}</span>
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                </Button>
            </div>
        </aside>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [adminName, setAdminName] = useState("Admin");
    const [adminEmail, setAdminEmail] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        fetch("/api/auth/session")
            .then((res) => (res.ok ? res.json() : null))
            .then((session) => {
                if (!mounted || !session?.user) return;
                if (session.user.name) setAdminName(session.user.name);
                if (session.user.email) setAdminEmail(session.user.email);
            })
            .catch(() => { });

        return () => {
            mounted = false;
        };
    }, []);

    const initials = adminName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("") || "AD";

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <AdminSidebar className="hidden md:flex" />

            <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
                <header className="h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild className="md:hidden">
                                <Button variant="ghost" size="icon" className="text-muted-foreground">
                                    <Menu className="w-5 h-5" />
                                    <span className="sr-only">Toggle sidebar</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-64 bg-sidebar border-border">
                                <AdminSidebar className="flex relative w-full" />
                            </SheetContent>
                        </Sheet>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/[0.06] border border-destructive/20">
                            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                            <span className="text-xs font-mono font-bold text-destructive">ADMIN MODE</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-bold leading-none text-foreground">{adminName}</p>
                            <p className="text-xs text-muted-foreground">{adminEmail ?? "Administrator"}</p>
                        </div>
                        <Avatar className="h-8 w-8 border border-destructive/30">
                            <AvatarImage src="/avatar-placeholder.png" alt="Admin avatar" />
                            <AvatarFallback className="bg-destructive/10 text-destructive text-xs">{initials}</AvatarFallback>
                        </Avatar>
                    </div>
                </header>
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
