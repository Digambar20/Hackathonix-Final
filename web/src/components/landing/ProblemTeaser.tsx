"use client";

import { motion } from "framer-motion";
import { ArrowRight, Code, Cpu, Globe, Shield, Database, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const categories = [
    { icon: Globe, name: "Web3 & Blockchain" },
    { icon: Cpu, name: "AI/ML Innovation" },
    { icon: Shield, name: "Cybersecurity" },
    { icon: Database, name: "FinTech" },
    { icon: Zap, name: "IoT & Hardware" },
    { icon: Code, name: "Open Innovation" },
];

export function ProblemTeaser() {
    return (
        <section id="problems" className="py-20 md:py-28 relative border-t border-border overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/[0.03] rounded-full blur-[120px]" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold uppercase tracking-wide mb-3"
                        >
                            Problem <span className="text-primary">Domains</span>
                        </motion.h2>
                        <p className="text-muted-foreground max-w-lg text-sm md:text-base">
                            12 Real-world problem statements awaiting your solution.
                            Choose wisely. Execute flawlessly.
                        </p>
                    </div>
                    <Link href="/rules">
                        <Button variant="outline" size="sm" className="group border-border text-foreground hover:bg-muted">
                            View All Statements <ArrowRight className="ml-2 w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            className="p-5 md:p-6 rounded-xl border border-border bg-card/30 flex flex-col items-center justify-center gap-3 text-center group cursor-pointer hover:bg-card/60 hover:border-primary/20 transition-all"
                        >
                            <div className="p-3 rounded-lg bg-primary/[0.06] group-hover:bg-primary/10 transition-colors">
                                <cat.icon className="w-5 h-5 text-primary" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                                {cat.name}
                            </span>
                        </motion.div>
                    ))}
                </div>

                {/* CTA Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 p-6 md:p-8 rounded-xl border border-primary/20 bg-primary/[0.04] relative overflow-hidden"
                >
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold font-display uppercase text-foreground">Ready to Compete?</h3>
                            <p className="text-muted-foreground mt-1 text-sm">
                                Problem statements are released at event start. Selection starts at <span className="text-foreground font-mono">09:00 AM</span>.
                            </p>
                        </div>
                        <Link href="/register">
                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shrink-0">
                                Register Now
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
