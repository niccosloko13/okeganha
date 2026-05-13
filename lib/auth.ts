import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { UserRole, UserStatus } from "@prisma/client";

import { auth as getAuthSession } from "@/auth";
import { addRiskEvent, evaluateAndHandleUserRisk, logUserActivity } from "@/lib/anti-fraud";
import { db } from "@/lib/db";
import { SESSION_COOKIE, SESSION_DURATION_SECONDS, signSession, verifySession } from "@/lib/session";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUserSession(userId: string, email: string) {
  const token = await signSession({ userId, email });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_SECONDS,
    path: "/",
  });
}

export async function clearUserSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    const payload = await verifySession(token);
    if (payload) {
      const user = await db.user.findUnique({ where: { id: payload.userId } });
      if (user) return user;
    }
  }

  const oauthSession = await getAuthSession();
  const email = oauthSession?.user?.email?.toLowerCase().trim();
  if (!email) return null;

  return db.user.findUnique({ where: { email } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role === "COMPANY") {
    await logUserActivity(user.id, "SUSPICIOUS_ACTIVITY", { reason: "FORBIDDEN_ROUTE_ACCESS", targetArea: "admin" });
    await addRiskEvent(user.id, "HIGH", "Tentativa de acesso indevido à área administrativa.", { targetArea: "admin" });
    await evaluateAndHandleUserRisk(user.id);
    redirect("/rela/login");
  }

  if (user.role !== "ADMIN") {
    await logUserActivity(user.id, "SUSPICIOUS_ACTIVITY", { reason: "FORBIDDEN_ROUTE_ACCESS", targetArea: "admin" });
    await addRiskEvent(user.id, "HIGH", "Tentativa de acesso indevido à área administrativa.", { targetArea: "admin" });
    await evaluateAndHandleUserRisk(user.id);
    redirect("/usuario/dashboard");
  }
  return user;
}

export async function requireRegularUser() {
  const user = await requireUser();

  if (user.status === "BLOCKED") {
    await clearUserSession();
    redirect("/conta/bloqueada");
  }

  if (user.role === "ADMIN") {
    await logUserActivity(user.id, "SUSPICIOUS_ACTIVITY", { reason: "FORBIDDEN_ROUTE_ACCESS", targetArea: "usuario" });
    await addRiskEvent(user.id, "HIGH", "Tentativa de acesso indevido à área de usuário comum.", { targetArea: "usuario" });
    await evaluateAndHandleUserRisk(user.id);
    redirect("/admin/dashboard");
  }

  if (user.role === "COMPANY") {
    await logUserActivity(user.id, "SUSPICIOUS_ACTIVITY", { reason: "FORBIDDEN_ROUTE_ACCESS", targetArea: "usuario" });
    await addRiskEvent(user.id, "HIGH", "Tentativa de acesso indevido à área de usuário comum.", { targetArea: "usuario" });
    await evaluateAndHandleUserRisk(user.id);
    redirect("/rela/login");
  }

  return user;
}

export function ensureActiveUser(status: UserStatus) {
  if (status !== "ACTIVE") {
    throw new Error("Sua conta está indisponível no momento.");
  }
}

export function ensureAdminRole(role: UserRole) {
  if (role !== "ADMIN") {
    throw new Error("Acesso permitido apenas para administradores.");
  }
}
