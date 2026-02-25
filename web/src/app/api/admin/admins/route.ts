import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasSuperAdminAccess, isAllowedAdminEmail } from "@/lib/admin-access";
import { z } from "zod";

const createAdminSchema = z.object({
    name: z.string().min(2).max(60),
    email: z.string().email(),
});

async function requireSuperAdmin() {
    const session = await auth();
    if (!session?.user) return null;
    const user = session.user as any;
    if (!hasSuperAdminAccess(user)) return null;
    return user;
}

function generatePassword(): string {
    return randomBytes(9).toString("base64url");
}

export async function GET() {
    const admin = await requireSuperAdmin();
    if (!admin) return NextResponse.json({ error: "Superadmin access required" }, { status: 403 });

    const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(admins.map((a) => ({
        ...a,
        isSuperAdmin: isAllowedAdminEmail(a.email),
    })));
}

export async function POST(req: NextRequest) {
    const admin = await requireSuperAdmin();
    if (!admin) return NextResponse.json({ error: "Superadmin access required" }, { status: 403 });

    try {
        const body = await req.json();
        const data = createAdminSchema.parse(body);
        const email = data.email.trim().toLowerCase();
        const password = generatePassword();
        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.upsert({
            where: { email },
            update: {
                role: "ADMIN",
                name: data.name.trim(),
                password: passwordHash,
            },
            create: {
                name: data.name.trim(),
                email,
                role: "ADMIN",
                password: passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        return NextResponse.json({
            success: true,
            admin: user,
            generatedPassword: password,
            message: "Admin created/updated. Share this generated password securely.",
        }, { status: 201 });
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: "Validation failed", details: err.issues }, { status: 400 });
        }
        console.error("Create admin error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
