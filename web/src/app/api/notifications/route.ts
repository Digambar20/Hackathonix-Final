import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — Team notifications for the logged-in participant
export async function GET() {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.teamId) {
        return NextResponse.json({ error: "No team found" }, { status: 404 });
    }

    const notifications = await prisma.notification.findMany({
        where: { teamId: user.teamId },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    return NextResponse.json(notifications);
}

// PATCH — mark all notifications as read for the logged-in team
export async function PATCH(_req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as any;
    if (!user.teamId) {
        return NextResponse.json({ error: "No team found" }, { status: 404 });
    }

    await prisma.notification.updateMany({
        where: { teamId: user.teamId, isRead: false },
        data: { isRead: true },
    });

    return NextResponse.json({ success: true });
}
