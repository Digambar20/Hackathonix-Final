import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasAdminAccess, hasSuperAdminAccess } from "@/lib/admin-access";

async function createNotificationSafe(data: {
    teamId: string;
    type: string;
    title: string;
    message: string;
}) {
    try {
        await prisma.notification.create({ data });
    } catch (err) {
        console.error("Notification create failed (non-fatal):", err);
    }
}

async function requireAdmin() {
    const session = await auth();
    if (!session?.user) return null;
    const user = session.user as any;
    if (!hasAdminAccess(user)) return null;
    return user;
}

// PATCH — Update team fields (registrationApproved, paymentVerified)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ teamId: string }> }) {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: "Admin access required" }, { status: 403 });

    const { teamId } = await params;

    try {
        const existingTeam = await prisma.team.findUnique({
            where: { id: teamId },
            select: { id: true },
        });
        if (!existingTeam) {
            return NextResponse.json({ error: "Team not found" }, { status: 404 });
        }

        const body = await req.json();
        const updateData: any = {};
        const notificationMessage = typeof body.notificationMessage === "string" ? body.notificationMessage.trim() : "";

        if (typeof body.registrationApproved === "boolean") {
            updateData.registrationApproved = body.registrationApproved;
        }
        if (typeof body.paymentVerified === "boolean") {
            updateData.paymentVerified = body.paymentVerified;
        }
        if (body.superadminScore !== undefined) {
            if (!hasSuperAdminAccess(admin)) {
                return NextResponse.json({ error: "Superadmin access required to assign score" }, { status: 403 });
            }

            if (body.superadminScore === null) {
                updateData.superadminScore = null;
                updateData.superadminScoredBy = null;
                updateData.superadminScoredAt = null;
            } else if (typeof body.superadminScore === "number" && Number.isInteger(body.superadminScore) && body.superadminScore >= 0 && body.superadminScore <= 100) {
                updateData.superadminScore = body.superadminScore;
                updateData.superadminScoredBy = admin.email ?? null;
                updateData.superadminScoredAt = new Date();
            } else {
                return NextResponse.json({ error: "superadminScore must be an integer between 0 and 100 (or null to clear)" }, { status: 400 });
            }
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
            await createNotificationSafe({
                teamId,
                type: approved ? "SUCCESS" : "WARNING",
                title: approved ? "Registration Approved" : "Registration Update",
                message: notificationMessage || (approved
                    ? "Your team registration has been approved by admin."
                    : "Your team registration is currently not approved. Please contact admin for details."),
            });
        }

        if (typeof body.paymentVerified === "boolean") {
            const verified = body.paymentVerified === true;
            await createNotificationSafe({
                teamId,
                type: verified ? "SUCCESS" : "WARNING",
                title: verified ? "Payment Verified" : "Payment Status Update",
                message: verified
                    ? "Your team payment has been verified by admin."
                    : "Your payment status has been marked as pending.",
            });
        }

        if (body.superadminScore !== undefined) {
            const cleared = body.superadminScore === null;
            await createNotificationSafe({
                teamId,
                type: cleared ? "WARNING" : "INFO",
                title: cleared ? "Superadmin Score Cleared" : "Superadmin Score Assigned",
                message: cleared
                    ? "Your superadmin evaluation score has been cleared."
                    : `Your team received a superadmin score of ${body.superadminScore}/100.`,
            });
        }

        const teamWithScore = team as any;
        return NextResponse.json({
            success: true,
            registrationApproved: team.registrationApproved,
            paymentVerified: team.paymentVerified,
            superadminScore: teamWithScore.superadminScore,
            superadminScoredBy: teamWithScore.superadminScoredBy,
            superadminScoredAt: teamWithScore.superadminScoredAt,
        });
    } catch (err: any) {
        console.error("Admin team PATCH error:", err);
        if (err?.code === "P2022") {
            return NextResponse.json(
                { error: "Database schema is outdated for scoring fields. Please run migrations.", code: err?.code },
                { status: 500 }
            );
        }
        if (err?.code === "P2002") {
            return NextResponse.json(
                { error: "Unique constraint failed while updating team.", code: err?.code },
                { status: 409 }
            );
        }
        return NextResponse.json(
            {
                error: "Failed to update team",
                code: err?.code || "UNKNOWN",
                detail: process.env.NODE_ENV === "production" ? undefined : (err?.message || "No error detail"),
            },
            { status: 500 }
        );
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
