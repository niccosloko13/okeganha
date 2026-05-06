import { cookies } from "next/headers";

import {
  ADMIN_IMPERSONATION_COOKIE,
  ADMIN_IMPERSONATION_DURATION_SECONDS,
  signAdminImpersonationToken,
  verifyAdminImpersonationToken,
} from "@/lib/admin-impersonation-token";
import { db } from "@/lib/db";

export async function startCompanyImpersonation(adminId: string, companyId: string): Promise<void> {
  const log = await db.adminImpersonationLog.create({
    data: {
      adminId,
      companyId,
      startedAt: new Date(),
    },
  });

  const token = await signAdminImpersonationToken({
    adminId,
    companyId,
    startedAt: new Date().toISOString(),
    logId: log.id,
  });

  const store = await cookies();
  store.set(ADMIN_IMPERSONATION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_IMPERSONATION_DURATION_SECONDS,
    path: "/",
  });
}

export async function stopImpersonation(): Promise<void> {
  const store = await cookies();
  const token = store.get(ADMIN_IMPERSONATION_COOKIE)?.value;
  if (token) {
    const payload = await verifyAdminImpersonationToken(token);
    if (payload) {
      const startedAt = new Date(payload.startedAt);
      const duration = Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000));
      await db.adminImpersonationLog.updateMany({
        where: { id: payload.logId, endedAt: null },
        data: {
          endedAt: new Date(),
          durationSeconds: duration,
        },
      });
    }
  }
  store.delete(ADMIN_IMPERSONATION_COOKIE);
}

export async function getImpersonationPayload() {
  const store = await cookies();
  const token = store.get(ADMIN_IMPERSONATION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminImpersonationToken(token);
}

export async function getImpersonatedCompany() {
  const payload = await getImpersonationPayload();
  if (!payload) return null;
  const company = await db.company.findUnique({ where: { id: payload.companyId } });
  if (!company) return null;
  return { company, payload };
}

export async function isImpersonating(): Promise<boolean> {
  const payload = await getImpersonationPayload();
  return Boolean(payload);
}
