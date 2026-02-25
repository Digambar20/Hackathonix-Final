import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background">
            {/* Background */}
            <div className="absolute inset-0 bg-grid opacity-50" />
            <div className="absolute top-1/3 -left-20 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[120px]" />
            <div className="absolute bottom-1/3 -right-20 w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[100px]" />

            {/* Back to home link */}
            <div className="absolute top-6 left-6 z-20">
                <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                        <span className="font-display font-bold text-primary-foreground text-[8px]">H</span>
                    </div>
                    <span className="font-display font-bold text-xs tracking-wider">HACKTHONIX</span>
                </Link>
            </div>

            <main className="relative z-10 w-full max-w-md p-4">
                {children}
            </main>
        </div>
    )
}
