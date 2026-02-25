import Link from "next/link";

export function Footer() {
    return (
        <footer className="py-12 border-t border-border relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-sm opacity-30 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Brand */}
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                                <span className="font-display font-bold text-primary-foreground text-[9px]">H</span>
                            </div>
                            <span className="font-display font-bold text-sm tracking-wider text-foreground">
                                HACKTHONIX <span className="text-primary">2.0</span>
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono text-center md:text-left max-w-xs">
                            Presented by Coding Club, K.D.K. College of Engineering, Nagpur.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="flex items-center gap-6">
                        {[
                            { label: "About", href: "#about" },
                            { label: "Rules", href: "/rules" },
                            { label: "Schedule", href: "#schedule" },
                        ].map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className="text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Copyright */}
                    <p className="text-[10px] text-muted-foreground/40 font-mono">
                        &copy; {new Date().getFullYear()} HACKTHONIX. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </div>
        </footer>
    );
}
