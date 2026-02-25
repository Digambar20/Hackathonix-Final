const ADMIN_EMAIL_ALLOWLIST = new Set([
    "ayushkulmate221@gmail.com",
    "hiteshvaidya857@gmail.com",
    "digambarkhekade79@gmail.com",
]);

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    return ADMIN_EMAIL_ALLOWLIST.has(email.trim().toLowerCase());
}

