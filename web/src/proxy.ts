import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isAllowedAdminEmail } from "@/lib/admin-access";

const protectedRoutes: Record<string, string[]> = {
    "/dashboard": ["PARTICIPANT"],
    "/judge": ["JUDGE"],
    "/admin": ["ADMIN", "SUPERADMIN"],
};

export default async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Check if route needs protection
    const matchedPrefix = Object.keys(protectedRoutes).find((prefix) =>
        pathname.startsWith(prefix)
    );

    if (!matchedPrefix) return NextResponse.next();

    const token = await getToken({
        req,
        secret: process.env.AUTH_SECRET,
    });

    if (!token) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    const role = typeof token.role === "string" ? token.role : undefined;
    const email = typeof token.email === "string" ? token.email : undefined;
    const allowedRoles = protectedRoutes[matchedPrefix];

    if (!role || !allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // Extra protection for SUPERADMIN: only allowlisted emails can hold superadmin access.
    if (matchedPrefix === "/admin" && role === "SUPERADMIN" && !isAllowedAdminEmail(email)) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/judge/:path*", "/admin/:path*"],
};
