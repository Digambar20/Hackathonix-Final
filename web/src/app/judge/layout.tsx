"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ClipboardCheck, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/judge/dashboard" },
    { icon: ClipboardCheck, label: "My Evaluations", href: "/judge/dashboard" },
];

export default function JudgeLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Judge Sidebar */}
            <aside className="w-64 h-screen border-r border-border bg-card/80 backdrop-blur-xl flex-col fixed left-0 top-0 hidden md:flex">
                <div className="h-16 flex items-center px-6 border-b border-border">
                    <Link href="/judge/dashboard" className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
                            <span className="font-display font-bold text-primary-foreground text-xs">J</span>
                        </div>
                        <span className="font-display font-bold tracking-wider text-sm">JUDGE PORTAL</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href);
                        return (
                            <Link key={item.label} href={item.href}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-accent",
                                        isActive && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span className="font-medium">{item.label}</span>
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
                        <span>Sign Out</span>
                    </Button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
                <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-mono font-bold text-primary">JUDGE MODE</span>
                    </div>
                </header>
                <main className="flex-1 p-6 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
