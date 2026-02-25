"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface DigitReelProps {
    value: string
    className?: string
}

export default function DigitReel({ value, className }: DigitReelProps) {
    const [prevValue, setPrevValue] = useState(value)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (value !== prevValue) {
            setIsAnimating(true)
            const timer = setTimeout(() => {
                setPrevValue(value)
                setIsAnimating(false)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [value, prevValue])

    // Generate the digits that will appear in the reel
    // For a digit like "5", we'll show "3", "4", "5", "6", "7" in the reel
    const generateReelDigits = (currentDigit: string) => {
        const digit = Number.parseInt(currentDigit, 10)
        const digits = []

        // Add digits before current
        for (let i = 2; i > 0; i--) {
            const prevDigit = (digit - i + 10) % 10
            digits.push(prevDigit.toString())
        }

        // Add current digit
        digits.push(currentDigit)

        // Add digits after current
        for (let i = 1; i <= 2; i++) {
            const nextDigit = (digit + i) % 10
            digits.push(nextDigit.toString())
        }

        return digits
    }

    const reelDigits = generateReelDigits(value)

    return (
        <div className={cn("relative w-8 sm:w-10 h-14 sm:h-16 overflow-hidden rounded-md border border-primary/10 bg-black/20 backdrop-blur-sm shadow-inner", className)}>
            {/* Top gradient overlay */}
            <div className="absolute top-0 left-0 right-0 h-6 z-10 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none"></div>

            <div className="relative h-full flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                    <motion.div
                        key={value}
                        initial={{ y: -30, opacity: 0, filter: "blur(2px)" }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        exit={{ y: 30, opacity: 0, filter: "blur(2px)" }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute flex flex-col items-center"
                    >
                        {reelDigits.map((digit, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "text-xl sm:text-2xl font-mono font-bold transition-all duration-300 flex items-center justify-center h-14 sm:h-16",
                                    index === 2 ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" : "text-muted-foreground/20 blur-[0.5px]",
                                    index < 2 ? "-translate-y-[60%]" : "",
                                    index > 2 ? "translate-y-[60%]" : "",
                                )}
                            >
                                {digit}
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-6 z-10 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none"></div>

            {/* Scanline effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.1)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>
        </div>
    )
}
