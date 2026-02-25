"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, LogOut, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: FileCode, label: "Problem Statements", href: "/dashboard/problemstatements" },
    { icon: Users, label: "Team Profile", href: "/dashboard/profile" },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <aside className={cn("w-64 h-screen border-r border-border bg-sidebar backdrop-blur-xl flex flex-col fixed left-0 top-0", className)}>
            <div className="h-16 flex items-center px-6 border-b border-border">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                        <span className="font-display font-bold text-primary-foreground text-[9px]">H</span>
                    </div>
                    <span className="font-display font-bold tracking-wider text-sm text-sidebar-foreground">HACKTHONIX</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.label} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                    isActive && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
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
                    <span className="text-sm">Logout</span>
                </Button>
            </div>
        </aside>
    );
}
