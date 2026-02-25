"use client";

import { motion } from "framer-motion";
import { GradientBackground } from "@/components/ui/gradient-background";
import { useEffect, useState } from "react";

const fallbackSponsors: Array<{ name: string; tier: string; websiteUrl?: string | null }> = [
    { name: "KDKCE", tier: "Title" },
    { name: "ACM Student Chapter", tier: "Gold" },
    { name: "CSI KDKCE", tier: "Gold" },
    { name: "Google Cloud", tier: "Technical" },
    { name: "Postman", tier: "Tooling" },
    { name: "GitHub", tier: "Platform" },
];

type Sponsor = {
    id: string;
    name: string;
    tier: string;
    websiteUrl?: string | null;
};

export function Sponsors() {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);

    useEffect(() => {
        fetch("/api/sponsors", { cache: "no-store" })
            .then(async (r) => {
                const data = await r.json().catch(() => []);
                if (!r.ok) throw new Error("Failed to load sponsors");
                setSponsors(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                setSponsors(fallbackSponsors.map((s, i) => ({ id: `fallback_${i}`, ...s })));
            });
    }, []);

    const list = sponsors.length > 0 ? sponsors : fallbackSponsors.map((s, i) => ({ id: `fallback_${i}`, ...s }));

    return (
        <section id="sponsors" className="py-20 md:py-28 relative border-t border-border overflow-hidden isolate">
            <GradientBackground />
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12 md:mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl lg:text-5xl font-display font-bold uppercase tracking-wide mb-3"
                    >
                        Our <span className="text-primary">Partners</span>
                    </motion.h2>
                    <p className="text-muted-foreground text-sm md:text-base">Powering the next generation of innovators.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-center justify-items-center">
                    {list.map((s, i) => (
                        <motion.div
                            key={s.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            className="w-full h-24 flex flex-col items-center justify-center rounded-xl border border-white/10 bg-black/40 hover:bg-black/60 hover:border-primary/40 transition-all group cursor-pointer backdrop-blur-md shadow-lg"
                        >
                            {s.websiteUrl ? (
                                <a
                                    href={s.websiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-display font-bold text-base md:text-lg text-white/90 group-hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                                >
                                    {s.name}
                                </a>
                            ) : (
                                <span className="font-display font-bold text-base md:text-lg text-white/90 group-hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
                                    {s.name}
                                </span>
                            )}
                            <span className="text-[10px] font-mono text-white/60 uppercase mt-1 tracking-widest">{s.tier}</span>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        Want to sponsor us?{" "}
                        <a href="mailto:sponsor@hackthonix.in" className="text-primary hover:underline underline-offset-4">
                            Get in touch
                        </a>
                    </p>
                </div>
            </div>
        </section>
    );
}
