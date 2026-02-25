import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Registration window: Feb 26, 2026 7 AM to Mar 6, 2026 12 AM
        const now = new Date();
        const registrationStart = new Date(2026, 1, 26, 7, 0, 0); // Feb 26, 7 AM
        const registrationEnd = new Date(2026, 2, 6, 0, 0, 0); // Mar 6, 12 AM
        const registrationLimit = 90;

        // Count total registered teams
        const totalRegistered = await prisma.team.count();
        const spotsRemaining = Math.max(0, registrationLimit - totalRegistered);
        
        // TESTING MODE: Always show registration as open
        const registrationClosed = false;
        const registrationNotStarted = false;
        // Original logic (uncomment to re-enable):
        // const registrationClosed = now >= registrationEnd;
        // const registrationNotStarted = now < registrationStart;

        return NextResponse.json({
            totalRegistered,
            registrationLimit,
            spotsRemaining,
            registrationClosed,
            registrationNotStarted,
            registrationStart: registrationStart.toISOString(),
            registrationEnd: registrationEnd.toISOString(),
        });
    } catch (err) {
        console.error("Error fetching registration stats:", err);
        return NextResponse.json(
            { error: "Failed to fetch registration stats" },
            { status: 500 }
        );
    }
}
