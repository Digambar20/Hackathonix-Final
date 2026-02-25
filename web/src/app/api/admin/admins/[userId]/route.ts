import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasSuperAdminAccess, isAllowedAdminEmail } from "@/lib/admin-access";

async function requireSuperAdmin() {
    const session = await auth();
    if (!session?.user) return null;
    const user = session.user as any;
    if (!hasSuperAdminAccess(user)) return null;
    return user;
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    const superAdmin = await requireSuperAdmin();
    if (!superAdmin) return NextResponse.json({ error: "Superadmin access required" }, { status: 403 });

    const { userId } = await params;

    const target = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, role: true },
    });

    if (!target) {
        return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    if (target.role !== "ADMIN") {
        return NextResponse.json({ error: "Target user is not an admin" }, { status: 400 });
    }

    if (isAllowedAdminEmail(target.email)) {
        return NextResponse.json({ error: "Superadmin accounts cannot be removed" }, { status: 403 });
    }

    if (target.id === (superAdmin as any).id) {
        return NextResponse.json({ error: "You cannot remove your own account" }, { status: 400 });
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
}
