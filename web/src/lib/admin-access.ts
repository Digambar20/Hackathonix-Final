export const SUPERADMIN_EMAIL_ALLOWLIST = new Set([
    "ayushkulmate221@gmail.com",
    "hiteshvaidya857@gmail.com",
    "digambarkhekade79@gmail.com",
]);

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    return SUPERADMIN_EMAIL_ALLOWLIST.has(email.trim().toLowerCase());
}

export function hasAdminAccess(user: { role?: string | null } | null | undefined): boolean {
    if (!user) return false;
    return user.role === "ADMIN" || user.role === "SUPERADMIN";
}

export function hasSuperAdminAccess(user: { role?: string | null; email?: string | null } | null | undefined): boolean {
    if (!user) return false;
    return user.role === "SUPERADMIN" && isAllowedAdminEmail(user.email);
}
