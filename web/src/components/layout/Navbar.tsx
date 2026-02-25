"use client";

import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence, useScroll } from "framer-motion";

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { scrollY } = useScroll();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const unsubscribe = scrollY.onChange((latest) => {
            setScrolled(latest > 50);
        });
        return () => unsubscribe();
    }, [scrollY]);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${scrolled
                ? "glass-liquid"
                : "border-b border-transparent bg-transparent"
                }`}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110 shadow-[0_0_15px_color-mix(in_srgb,var(--primary),transparent_50%)]">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="font-display font-bold text-primary-foreground relative z-10">H</span>
                    </div>
                    <span className="font-display font-bold text-lg tracking-wider transition-all duration-300 group-hover:text-primary group-hover:drop-shadow-[0_0_8px_color-mix(in_srgb,var(--primary),transparent_50%)]">
                        HACKTHONIX
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {["About", "Schedule", "Problems", "Sponsors"].map((item) => (
                        <Link
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="relative text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 group"
                        >
                            {item}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full shadow-[0_0_8px_color-mix(in_srgb,var(--primary),transparent_20%)]" />
                        </Link>
                    ))}

                    <div className="h-4 w-px bg-white/10" />
                    <ModeToggle />

                    <Link href="/login">
                        <Button
                            size="sm"
                            className="font-bold relative overflow-hidden group border border-primary/50 hover:border-primary bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300"
                        >
                            <span className="relative z-10">Login</span>
                            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Button>
                    </Link>

                    <Link href="/register">
                        <Button
                            size="sm"
                            className="font-bold relative overflow-hidden group border border-primary/50 hover:border-primary bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300"
                        >
                            <span className="relative z-10">Register Now</span>
                            <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Button>
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center gap-4">
                    <ModeToggle />
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="text-foreground hover:text-primary transition-colors"
                    >
                        {isOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-b border-white/10 bg-background/95 backdrop-blur-2xl"
                    >
                        <div className="container mx-auto px-4 py-6 flex flex-col gap-6">
                            {["About", "Schedule", "Problems", "Sponsors"].map((item) => (
                                <Link
                                    key={item}
                                    href={`#${item.toLowerCase()}`}
                                    className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors pl-2 border-l-2 border-transparent hover:border-primary"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {item}
                                </Link>
                            ))}
                            <div className="h-px w-full bg-white/10 my-2" />
                            <Link href="/login" onClick={() => setIsOpen(false)}>
                                <Button className="w-full font-bold relative overflow-hidden group border border-primary/50 hover:border-primary bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 shadow-[0_0_15px_color-mix(in_srgb,var(--primary),transparent_70%)]">
                                    <span className="relative z-10">Login</span>
                                    <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </Button>
                            </Link>
                            <Link href="/register" onClick={() => setIsOpen(false)}>
                                <Button className="w-full font-bold shadow-[0_0_15px_color-mix(in_srgb,var(--primary),transparent_70%)]">
                                    Register Now
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
