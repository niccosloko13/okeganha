import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getImpersonatedCompany, isImpersonating } from "@/lib/admin-impersonation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  COMPANY_SESSION_COOKIE,
  COMPANY_SESSION_DURATION_SECONDS,
  signCompanySession,
  verifyCompanySession,
} from "@/lib/company-session";

export async function hashCompanyPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function compareCompanyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createCompanySession(companyId: string, email: string) {
  const token = await signCompanySession({ companyId, email });
  const store = await cookies();
  store.set(COMPANY_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COMPANY_SESSION_DURATION_SECONDS,
    path: "/",
  });
}

export async function clearCompanySession() {
  const store = await cookies();
  store.delete(COMPANY_SESSION_COOKIE);
}

export async function getCurrentCompany() {
  const impersonated = await getImpersonatedCompany();
  if (impersonated) {
    const admin = await requireAdmin();
    if (admin.id !== impersonated.payload.adminId) return null;
    return impersonated.company;
  }

  const store = await cookies();
  const token = store.get(COMPANY_SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyCompanySession(token);
  if (!payload) return null;

  return db.company.findUnique({ where: { id: payload.companyId } });
}

export async function requireCompany() {
  const company = await getCurrentCompany();
  if (!company) redirect("/empresa/login");
  if (company.status !== "ACTIVE") {
    if (await isImpersonating()) {
      redirect("/admin/empresas");
    }
    redirect("/empresa/status");
  }
  return company;
}
