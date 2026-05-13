import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { getCurrentCompany } from "@/lib/company-auth";
import { db } from "@/lib/db";

export async function redirectIfAuthenticatedAwayFromRelaAuth() {
  const companySession = await getCurrentCompany();
  if (companySession) {
    if (companySession.status === "ACTIVE") redirect("/rela/dashboard");
    redirect("/rela/status");
  }

  const user = await getCurrentUser();
  if (!user) return;

  if (user.role === "USER") redirect("/usuario/dashboard");
  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "COMPANY") {
    if (!user.companyId) redirect("/rela/login");
    const company = await db.company.findUnique({ where: { id: user.companyId } });
    if (!company || company.status !== "ACTIVE") redirect("/rela/status");
    redirect("/rela/dashboard");
  }
}

export async function requireRelaCompany() {
  const user = await getCurrentUser();
  if (user?.role === "USER") redirect("/usuario/dashboard");
  if (user?.role === "ADMIN") redirect("/admin");

  const company = await getCurrentCompany();

  if (!company) redirect("/rela/login");
  if (company.status !== "ACTIVE") redirect("/rela/status");
  return company;
}
