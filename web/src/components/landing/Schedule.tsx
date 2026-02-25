"use client";

import { useRef } from "react";
import { Clock } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const schedule = [
    { time: "08:00 AM", title: "Team Arrival & Check-In", desc: "Teams should arrive at this time.", active: false },
    { time: "09:00 AM", title: "Opening Ceremony", desc: "Event Kickoff & PS Reveal", active: true },
    { time: "09:30 AM", title: "Hacking Begins", desc: "10-Hour Sprint Starts", active: false },
    { time: "01:00 PM", title: "Lunch Break", desc: "Refuel & Network", active: false },
    { time: "04:00 PM", title: "Mentoring Round", desc: "Expert feedback & validation", active: false },
    { time: "07:30 PM", title: "Code Freeze", desc: "Stop hacking. Submit repos.", active: false },
    { time: "08:00 PM", title: "Pitching & Judging", desc: "Present your solutions", active: false },
    { time: "09:30 PM", title: "Valediction", desc: "Winners announced", active: false },
];

export function Schedule() {
    const containerRef = useRef<HTMLElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const line = lineRef.current;
        const cards = gsap.utils.toArray<HTMLElement>(".timeline-card");
        const dots = gsap.utils.toArray<HTMLElement>(".timeline-dot");

        // Animate the central line
        gsap.fromTo(line,
            { height: "0%" },
            {
                height: "100%",
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top center",
                    end: "bottom center",
                    scrub: 1.5,
                }
            }
        );

        // Animate Cards
        cards.forEach((card, i) => {
            gsap.fromTo(card,
                {
                    opacity: 0,
                    y: 50,
                    x: i % 2 === 0 ? -30 : 30
                },
                {
                    opacity: 1,
                    y: 0,
                    x: 0,
                    duration: 0.8,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        end: "top 50%",
                        toggleActions: "play none none reverse",
                    }
                }
            );
        });

        // Animate Dots
        dots.forEach((dot, i) => {
            gsap.fromTo(dot,
                { scale: 0, opacity: 0 },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.4,
                    ease: "back.out(1.7)",
                    scrollTrigger: {
                        trigger: dot,
                        start: "top 80%",
                        toggleActions: "play none none reverse",
                    }
                }
            );
        });

    }, { scope: containerRef });

    return (
        <section ref={containerRef} id="schedule" className="py-24 md:py-32 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16 md:mb-24">
                    <div className="inline-block relative">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold uppercase tracking-tight mb-4">
                            Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Timeline</span>
                        </h2>
                        <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 blur-sm" />
                    </div>
                    <p className="text-muted-foreground font-mono text-sm md:text-base tracking-wide mt-4">
                        &lt; 10_HOURS_OF_CODE /&gt;
                    </p>
                </div>

                <div className="max-w-4xl mx-auto relative min-h-[800px]">
                    {/* Vertical Line Container */}
                    <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-0.5 md:-translate-x-1/2 bg-white/5">
                        {/* Animated Line */}
                        <div
                            ref={lineRef}
                            className="w-full bg-gradient-to-b from-primary via-purple-500 to-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)]"
                        />
                    </div>

                    <div className="space-y-12">
                        {schedule.map((item, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-8 md:gap-0 relative ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}
                            >
                                {/* Content Card */}
                                <div className={`timeline-card flex-1 pl-12 md:pl-0 ${i % 2 === 0 ? "md:text-left md:pl-16" : "md:text-right md:pr-16"}`}>
                                    <div
                                        className={`group relative p-6 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm shadow-xl transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]
                                            ${item.active ? "border-primary/50 shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] bg-primary/5" : ""}
                                        `}
                                    >
                                        {/* Connecting Line for Desktop */}
                                        <div className={`hidden md:block absolute top-1/2 w-16 h-px bg-gradient-to-r from-primary/50 to-transparent ${i % 2 === 0 ? "-left-16 transform" : "-right-16 transform rotate-180"}`} />

                                        <div className={`inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-mono text-primary font-bold tracking-wider ${i % 2 === 0 ? "" : "md:ml-auto"}`}>
                                            <Clock className="w-3.5 h-3.5" />
                                            {item.time}
                                        </div>

                                        <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wide text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                                            {item.title}
                                        </h3>

                                        <p className="text-sm md:text-base text-muted-foreground font-light leading-relaxed">
                                            {item.desc}
                                        </p>

                                        {/* Card Decorative Elements */}
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-primary/20 rounded-tr-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-primary/20 rounded-bl-xl opacity-50 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>

                                {/* Center Node */}
                                <div className="timeline-dot absolute left-[19px] md:left-1/2 md:-translate-x-1/2 flex items-center justify-center z-10">
                                    <div className="w-3 h-3 rounded-full bg-background border-2 border-primary relative shadow-[0_0_10px_rgba(var(--primary-rgb),1)]">
                                        <div className={`absolute inset-0 rounded-full bg-primary blur-[6px] ${item.active ? "opacity-100 animate-pulse" : "opacity-40"}`} />
                                    </div>
                                </div>

                                {/* Empty spacer for layout balance */}
                                <div className="flex-1 hidden md:block" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
