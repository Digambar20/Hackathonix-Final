import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password / Team ID", type: "password" },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        console.error("[Auth] Missing email or password");
                        return null;
                    }

                    const email = (credentials.email as string).trim().toLowerCase();
                    const password = credentials.password as string;

                    console.log(`[Auth] Attempting login with email: ${email}`);

                    const user = await prisma.user.findUnique({
                        where: { email },
                        include: { team: true },
                    });

                    if (!user) {
                        console.error(`[Auth] User not found with email: ${email}`);
                        return null;
                    }

                    console.log(`[Auth] User found: ${user.name}, Role: ${user.role}, Team: ${user.teamId}`);

                    // For participants (no password), the "password" field is their teamId
                    if (user.role === "PARTICIPANT") {
                        if (!user.team) {
                            console.error(`[Auth] Participant has no team assigned`);
                            return null;
                        }
                        const normalizedUserEmail = user.email.trim().toLowerCase();
                        const normalizedLeaderEmail = user.team.teamLeaderEmail.trim().toLowerCase();
                        if (normalizedUserEmail !== normalizedLeaderEmail) {
                            console.error(`[Auth] Non-leader participant login blocked for email: ${email}`);
                            return null;
                        }
                        if (user.team.id !== password.trim()) {
                            console.error(`[Auth] Invalid team ID. Expected: ${user.team.id}, Got: ${password}`);
                            return null;
                        }
                        console.log(`[Auth] Participant login successful`);
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            teamId: user.teamId,
                        };
                    }

                    // For judges/admins, check bcrypt password
                    if (!user.password) {
                        console.error(`[Auth] User has no password set`);
                        return null;
                    }
                    const isValid = await bcrypt.compare(password, user.password);
                    if (!isValid) {
                        console.error(`[Auth] Invalid password for user: ${email}`);
                        return null;
                    }

                    console.log(`[Auth] Judge/Admin login successful`);
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        teamId: user.teamId,
                    };
                } catch (error) {
                    console.error("[Auth] Authorization error:", error);
                    return null;
                }
            },
        }),
    ],
    session: { strategy: "jwt" },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.teamId = (user as any).teamId;
                token.userId = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).teamId = token.teamId;
                (session.user as any).id = token.userId;
            }
            return session;
        },
    },
});
