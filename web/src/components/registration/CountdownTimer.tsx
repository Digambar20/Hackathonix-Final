"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Clock, AlertCircle, CheckCircle } from "lucide-react";

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
    hasStarted: boolean;
}

export function CountdownTimer() {
    const [time, setTime] = useState<TimeRemaining>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isEnded: false,
        hasStarted: false,
    });

    useEffect(() => {
        const calculateTime = () => {
            // Registration starts: Feb 26, 2026, 7:00 AM
            // Registration ends: Mar 6, 2026, 12:00 AM (midnight)
            const now = new Date();
            const startDate = new Date(2026, 1, 26, 7, 0, 0); // Feb 26, 7 AM
            const endDate = new Date(2026, 2, 6, 0, 0, 0); // Mar 6, 12 AM

            // TESTING MODE: Force registration as open
            const hasStarted = true;
            const isEnded = false;
            // Original logic (uncomment to re-enable):
            // const hasStarted = now >= startDate;
            // const isEnded = now >= endDate;

            let targetDate = startDate;
            let nextPhase = "starts";

            if (isEnded) {
                setTime({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    isEnded: true,
                    hasStarted: true,
                });
                return;
            }

            if (hasStarted) {
                targetDate = endDate;
                nextPhase = "ends";
            }

            const diff = targetDate.getTime() - now.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);
            const seconds = Math.floor((diff / 1000) % 60);

            setTime({
                days,
                hours,
                minutes,
                seconds,
                isEnded: false,
                hasStarted,
            });
        };

        calculateTime();
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    if (time.isEnded) {
        return (
            <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-md w-full">
                <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <h3 className="font-display font-bold text-red-500 uppercase">Registration Closed</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Registration period has ended. Thank you for your participation!
                    </p>
                </div>
            </Card>
        );
    }

    if (!time.hasStarted) {
        return (
            <Card className="border-amber-500/30 bg-amber-500/5 backdrop-blur-md w-full">
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <h3 className="font-display font-bold text-amber-500 uppercase">Registration Opens In</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        <div className="text-center bg-card/50 border border-border rounded-lg p-3">
                            <div className="text-2xl font-bold text-primary">{String(time.days).padStart(2, "0")}</div>
                            <div className="text-xs text-muted-foreground uppercase">Days</div>
                        </div>
                        <div className="text-center bg-card/50 border border-border rounded-lg p-3">
                            <div className="text-2xl font-bold text-primary">{String(time.hours).padStart(2, "0")}</div>
                            <div className="text-xs text-muted-foreground uppercase">Hours</div>
                        </div>
                        <div className="text-center bg-card/50 border border-border rounded-lg p-3">
                            <div className="text-2xl font-bold text-primary">{String(time.minutes).padStart(2, "0")}</div>
                            <div className="text-xs text-muted-foreground uppercase">Minutes</div>
                        </div>
                        <div className="text-center bg-card/50 border border-border rounded-lg p-3">
                            <div className="text-2xl font-bold text-primary">{String(time.seconds).padStart(2, "0")}</div>
                            <div className="text-xs text-muted-foreground uppercase">Seconds</div>
                        </div>
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                        Registration will open on <span className="font-semibold text-foreground">February 26, 2026 at 7:00 AM</span>
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-green-500/30 bg-green-500/5 backdrop-blur-md w-full">
            <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h3 className="font-display font-bold text-green-500 uppercase">Registration Open - Closes In</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    <div className="text-center bg-card/50 border border-border rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary">{String(time.days).padStart(2, "0")}</div>
                        <div className="text-xs text-muted-foreground uppercase">Days</div>
                    </div>
                    <div className="text-center bg-card/50 border border-border rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary">{String(time.hours).padStart(2, "0")}</div>
                        <div className="text-xs text-muted-foreground uppercase">Hours</div>
                    </div>
                    <div className="text-center bg-card/50 border border-border rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary">{String(time.minutes).padStart(2, "0")}</div>
                        <div className="text-xs text-muted-foreground uppercase">Minutes</div>
                    </div>
                    <div className="text-center bg-card/50 border border-border rounded-lg p-3">
                        <div className="text-2xl font-bold text-primary">{String(time.seconds).padStart(2, "0")}</div>
                        <div className="text-xs text-muted-foreground uppercase">Seconds</div>
                    </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                    Closes on <span className="font-semibold text-foreground">March 6, 2026 at 12:00 AM</span>
                </p>
            </div>
        </Card>
    );
}
