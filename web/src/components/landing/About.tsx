"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Clock } from "lucide-react";

const features = [
    {
        icon: Calendar,
        title: "9th March 2026",
        desc: "Mark your calendars.",
    },
    {
        icon: Clock,
        title: "10 Hours Strict",
        desc: "Ship before sunset.",
    },
    {
        icon: MapPin,
        title: "KDKCE (Block-B)",
        desc: "Dept. of CSE, Nagpur",
        link: "https://maps.app.goo.gl/GkCvmgCvxBcRp7wz6",
    },
];

const stats = [
    { value: "10", unit: "Hours", desc: "Non-stop coding" },
    { value: "100", unit: "Hackers Teams", desc: "Competing together" },
];

export function About() {
    return (
        <section id="about" className="py-20 md:py-28 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/[0.04] via-transparent to-transparent pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left - Content */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold uppercase tracking-wide text-balance">
                                The Ultimate <span className="text-primary">Sprint</span>
                            </h2>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                        >
                            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                                <strong className="text-foreground">Hackthonix 2.0</strong> is not just a hackathon; it is a test of speed, precision, and innovation.
                                Teams have exactly <span className="text-primary font-semibold">10 hours</span> to go from idea to deployable prototype.
                            </p>
                            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-4">
                                No fluff. No overnight fatigue. Just pure coding adrenaline.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {features.map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    {f.link ? (
                                        <a
                                            href={f.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block p-4 rounded-xl border border-border bg-card/50 flex flex-col items-center text-center gap-3 hover:bg-card/80 hover:border-primary/40 transition-all group"
                                        >
                                            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                                <f.icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">{f.title}</h3>
                                                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="p-4 rounded-xl border border-border bg-card/50 flex flex-col items-center text-center gap-3 hover:bg-card/80 transition-colors">
                                            <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                                                <f.icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">{f.title}</h3>
                                                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right - Stats Grid */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-2 gap-4"
                    >
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                className="relative p-6 rounded-xl border border-border bg-card/30 flex flex-col items-center text-center gap-2 group hover:border-primary/30 transition-colors"
                            >
                                <span className="text-4xl md:text-5xl font-mono font-bold text-primary">{stat.value}</span>
                                <span className="text-sm font-bold uppercase tracking-wider text-foreground">{stat.unit}</span>
                                <span className="text-xs text-muted-foreground">{stat.desc}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
