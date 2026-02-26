"use client";

import { BackgroundPaths } from "@/components/ui/background-paths";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import CountdownTimer from "@/components/ui/countdown-timer";
import { RegistrationStats } from "@/components/registration/RegistrationStats";

export function Hero() {
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [countdownTargetIso, setCountdownTargetIso] = useState("2026-03-09T03:30:00.000Z");

    const formatToIST = (iso: string) => {
        try {
            const date = new Date(iso);
            return date.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'medium',
                timeStyle: 'short',
            }) + " IST";
        } catch {
            return "March 9, 2026, 9:00 AM IST";
        }
    };

    useEffect(() => {
        fetch("/api/hackathon/config", { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                if (data?.homepageCountdownTargetAt) {
                    setCountdownTargetIso(data.homepageCountdownTargetAt);
                }
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        const target = new Date(countdownTargetIso);
        const timer = setInterval(() => {
            const now = new Date();
            const diff = target.getTime() - now.getTime();
            if (diff <= 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(timer);
                return;
            }
            setCountdown({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [countdownTargetIso]);

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
            {/* Background */}
            <div className="absolute inset-0 bg-grid animate-grid-fade" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/[0.08] via-transparent to-transparent" />
            <BackgroundPaths />

            {/* Subtle glow orbs */}
            <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-primary/[0.06] rounded-full blur-[120px] animate-float-slow" />
            <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-cyber-cyan/[0.04] rounded-full blur-[100px] animate-float" />

            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center gap-8">
                {/* Status badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/[0.06]"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                    <span className="text-xs font-mono text-primary tracking-widest uppercase">
                        Registrations Open
                    </span>
                </motion.div>

                {/* Main headline */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-display font-bold uppercase leading-none tracking-tighter text-balance">
                        <span className="block text-foreground">Hackthonix</span>
                        <span className="block text-primary text-glow-sm">2.0</span>
                    </h1>
                </motion.div>

                {/* Tagline */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="max-w-xl"
                >
                    <p className="text-base md:text-lg text-muted-foreground font-mono leading-relaxed">
                        {'// BUILD FROM ZERO. SHIP BEFORE SUNSET.'}
                    </p>
                    <p className="text-sm text-muted-foreground/60 mt-2">
                        10-Hour High-Intensity Innovation Sprint
                    </p>
                </motion.div>

                {/* Countdown & Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6 px-4"
                >
                    {/* Registration Stats - Left */}
                    <div className="flex justify-center lg:justify-end">
                        <div className="w-full max-w-sm">
                            <RegistrationStats />
                        </div>
                    </div>

                    {/* Countdown Timer - Right */}
                    <div className="flex flex-col items-center lg:items-start gap-4 justify-center">
                        <CountdownTimer
                            days={countdown.days}
                            hours={countdown.hours}
                            minutes={countdown.minutes}
                            seconds={countdown.seconds}
                        />
                        <p className="text-[10px] font-mono text-muted-foreground/60 tracking-wider uppercase">
                            UNTIL: {formatToIST(countdownTargetIso)}
                        </p>
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="flex flex-col sm:flex-row gap-3 mt-4"
                >
                    <Link href="/register">
                        <Button size="lg" className="h-12 px-8 text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                            REGISTER YOUR TEAM
                        </Button>
                    </Link>
                    <Link href="#problems">
                        <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-mono border-border hover:bg-muted text-foreground">
                            VIEW PROBLEM STATEMENTS
                        </Button>
                    </Link>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-[10px] font-mono text-muted-foreground/50 tracking-widest uppercase">Scroll</span>
                <div className="w-px h-10 bg-gradient-to-b from-primary/50 to-transparent" />
            </motion.div>
        </section>
    );
}
