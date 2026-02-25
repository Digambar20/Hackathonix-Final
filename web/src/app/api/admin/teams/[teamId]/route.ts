import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAllowedAdminEmail } from "@/lib/admin-access";

async function requireAdmin() {
    const session = await auth();
    if (!session?.user) return null;
    const user = session.user as any;
    if (user.role !== "ADMIN" || !isAllowedAdminEmail(user.email)) return null;
    return user;
}

// PATCH — Update team fields (registrationApproved, paymentVerified)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const { teamId } = await params;

    try {
        const body = await req.json();
        const updateData: any = {};
        const notificationMessage = typeof body.notificationMessage === "string" ? body.notificationMessage.trim() : "";

        if (typeof body.registrationApproved === "boolean") {
            updateData.registrationApproved = body.registrationApproved;
        }
        if (typeof body.paymentVerified === "boolean") {
            updateData.paymentVerified = body.paymentVerified;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const team = await prisma.team.update({
            where: { id: teamId },
            data: updateData,
        });

        if (typeof body.registrationApproved === "boolean") {
            const approved = body.registrationApproved === true;
            await prisma.notification.create({
                data: {
                    teamId,
                    type: approved ? "SUCCESS" : "WARNING",
                    title: approved ? "Registration Approved" : "Registration Update",
                    message: notificationMessage || (approved
                        ? "Your team registration has been approved by admin."
                        : "Your team registration is currently not approved. Please contact admin for details."),
                },
            });
        }

        if (typeof body.paymentVerified === "boolean") {
            const verified = body.paymentVerified === true;
            await prisma.notification.create({
                data: {
                    teamId,
                    type: verified ? "SUCCESS" : "WARNING",
                    title: verified ? "Payment Verified" : "Payment Status Update",
                    message: verified
                        ? "Your team payment has been verified by admin."
                        : "Your payment status has been marked as pending.",
                },
            });
        }

        return NextResponse.json({ success: true, registrationApproved: team.registrationApproved, paymentVerified: team.paymentVerified });
    } catch {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }
}

// DELETE — Remove a team and its members
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const { teamId } = await params;

    try {
        // Delete scores, members, then team
        await prisma.notification.deleteMany({ where: { teamId } });
        await prisma.score.deleteMany({ where: { teamId } });
        await prisma.user.deleteMany({ where: { teamId } });
        await prisma.team.delete({ where: { id: teamId } });

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }
}
