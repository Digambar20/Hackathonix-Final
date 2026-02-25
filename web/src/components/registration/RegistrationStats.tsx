"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, AlertCircle, TrendingUp } from "lucide-react";

interface RegistrationData {
    totalRegistered: number;
    registrationLimit: number;
    spotsRemaining: number;
    registrationClosed: boolean;
    registrationNotStarted: boolean;
}

export function RegistrationStats() {
    const [stats, setStats] = useState<RegistrationData>({
        totalRegistered: 0,
        registrationLimit: 90,
        spotsRemaining: 90,
        registrationClosed: false,
        registrationNotStarted: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/registration/stats");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch registration stats:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
        // Refresh stats every 10 seconds
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const percentageFilled = (stats.totalRegistered / stats.registrationLimit) * 100;
    const isFull = stats.spotsRemaining <= 0;

    if (stats.registrationNotStarted) {
        return (
            <Card className="border-amber-500/30 bg-amber-500/5 backdrop-blur-md w-full">
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <h3 className="font-display font-bold text-amber-500 uppercase">Registration Not Started</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Registration will open on <span className="font-semibold">February 26, 2026 at 7:00 AM</span>
                    </p>
                </div>
            </Card>
        );
    }

    if (stats.registrationClosed) {
        return (
            <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-md w-full">
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <h3 className="font-display font-bold text-red-500 uppercase">Registration Closed</h3>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Total Teams Registered:</span>
                        <span className="font-bold text-lg">{stats.totalRegistered}</span>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="border-border bg-card/50 backdrop-blur-md w-full">
            <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-bold uppercase">Live Registration Count</h3>
                </div>

                {/* Registration Counter */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                        <div className="text-xs text-muted-foreground uppercase mb-1">Teams Registered</div>
                        <div className="text-3xl font-bold text-primary">{isLoading ? "-" : stats.totalRegistered}</div>
                    </div>
                    <div className={`border rounded-lg p-4 ${isFull ? "bg-red-500/5 border-red-500/20" : "bg-green-500/5 border-green-500/20"}`}>
                        <div className="text-xs text-muted-foreground uppercase mb-1">Spots Remaining</div>
                        <div className={`text-3xl font-bold ${isFull ? "text-red-500" : "text-green-500"}`}>
                            {isLoading ? "-" : stats.spotsRemaining}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Registration Limit</span>
                        <span className="font-semibold">{stats.totalRegistered} / {stats.registrationLimit}</span>
                    </div>
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-300 ${
                                isFull ? "bg-red-500" : percentageFilled > 75 ? "bg-amber-500" : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(percentageFilled, 100)}%` }}
                        />
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                        {!isLoading && isFull && (
                            <span className="text-red-500 font-semibold">REGISTRATION FULL</span>
                        )}
                        {!isLoading && !isFull && (
                            <span>{percentageFilled.toFixed(1)}% capacity</span>
                        )}
                    </div>
                </div>

                {/* Warning if almost full */}
                {!isLoading && stats.spotsRemaining <= 10 && !isFull && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            ⚠️ Only {stats.spotsRemaining} {stats.spotsRemaining === 1 ? "spot" : "spots"} remaining! Register now to secure your team's spot.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}
