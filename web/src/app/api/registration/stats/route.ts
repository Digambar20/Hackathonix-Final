import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ONLINE_TEAM_LIMIT, TOTAL_TEAM_LIMIT } from "@/lib/registration-config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
    try {
        // Registration window: Feb 26, 2026 7 AM to Mar 6, 2026 12 AM
        const now = new Date();
        const registrationStart = new Date(2026, 1, 26, 7, 0, 0); // Feb 26, 7 AM
        const registrationEnd = new Date(2026, 2, 6, 0, 0, 0); // Mar 6, 12 AM
        const onlineRegistrationLimit = ONLINE_TEAM_LIMIT;
        const totalRegistrationLimit = TOTAL_TEAM_LIMIT;

        const [totalRegistered, onlineRegistered] = await Promise.all([
            prisma.team.count(),
            prisma.team.count({ where: { registrationMode: "ONLINE" } }),
        ]);
        const superadminRegistered = totalRegistered - onlineRegistered;
        const onlineSpotsRemaining = Math.max(0, onlineRegistrationLimit - onlineRegistered);
        const totalSpotsRemaining = Math.max(0, totalRegistrationLimit - totalRegistered);
        
        // TESTING MODE: Always show registration as open
        const registrationClosed = false;
        const registrationNotStarted = false;
        // Original logic (uncomment to re-enable):
        // const registrationClosed = now >= registrationEnd;
        // const registrationNotStarted = now < registrationStart;

        return NextResponse.json({
            totalRegistered,
            registrationLimit: onlineRegistrationLimit,
            spotsRemaining: onlineSpotsRemaining,
            onlineRegistered,
            onlineRegistrationLimit,
            onlineSpotsRemaining,
            superadminRegistered,
            totalRegistrationLimit,
            totalSpotsRemaining,
            registrationClosed,
            registrationNotStarted,
            registrationStart: registrationStart.toISOString(),
            registrationEnd: registrationEnd.toISOString(),
        }, {
            headers: {
                "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
                Pragma: "no-cache",
                Expires: "0",
            },
        });
    } catch (err) {
        console.error("Error fetching registration stats:", err);
        return NextResponse.json(
            { error: "Failed to fetch registration stats" },
            { status: 500 }
        );
    }
}
