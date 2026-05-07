import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import { logUserActivity } from "@/lib/anti-fraud";
import { db } from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      const email = user.email?.toLowerCase().trim() ?? "";
      if (!email) return false;

      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        if (existingUser.status !== "ACTIVE") {
          return "/loginerro=conta-bloqueada";
        }
        await logUserActivity(existingUser.id, "LOGIN", { method: "google", role: existingUser.role });
        if (existingUser.role === "ADMIN") {
          return "/admin/dashboard";
        }
        if (existingUser.role === "COMPANY") {
          if (!existingUser.companyId) {
            return "/empresa/status";
          }
          const company = await db.company.findUnique({
            where: { id: existingUser.companyId },
            select: { status: true },
          });
          return company?.status === "ACTIVE" ? "/empresa/dashboard" : "/empresa/status";
        }
        return existingUser.onboardingCompleted ? true : "/usuario/completar-cadastro";
      }

      const createdUser = await db.user.create({
        data: {
          name: user.name?.trim() || "UsuÃ¡rio",
          email,
          passwordHash: "",
          phone: "",
          status: "ACTIVE",
          onboardingCompleted: false,
          role: "USER",
        },
      });

      await logUserActivity(createdUser.id, "LOGIN", { method: "google", role: "USER", firstLogin: true });
      return "/usuario/completar-cadastro";
    },
  },
});
