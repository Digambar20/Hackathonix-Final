"use client"

import DigitReel from "./digit-reel"

interface CountdownTimerProps {
    days: number
    hours: number
    minutes: number
    seconds: number
}

export default function CountdownTimer({ days, hours, minutes, seconds }: CountdownTimerProps) {
    // Format numbers to always have two digits
    const formattedDays = days.toString().padStart(2, "0")
    const formattedHours = hours.toString().padStart(2, "0")
    const formattedMinutes = minutes.toString().padStart(2, "0")
    const formattedSeconds = seconds.toString().padStart(2, "0")

    const timeUnits = [
        { digits: formattedDays, label: "DAYS" },
        { digits: formattedHours, label: "HRS" },
        { digits: formattedMinutes, label: "MIN" },
        { digits: formattedSeconds, label: "SEC" },
    ]

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
                {timeUnits.map((unit, unitIndex) => (
                    <div key={unit.label} className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-0.5 p-1 rounded-lg bg-background/30 backdrop-blur-md border border-white/5 shadow-xl">
                            <DigitReel value={unit.digits[0]} />
                            <DigitReel value={unit.digits[1]} />
                        </div>
                        <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground font-medium tracking-[0.15em] uppercase">
                            {unit.label}
                        </span>
                    </div>
                ))}
            </div>
            <div className="text-[10px] font-mono text-primary/60 tracking-widest uppercase">
                Timezone: Indian Standard Time (IST)
            </div>
        </div>
    )
}
