import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function redirectIfAuthenticatedAwayFromRelaAuth() {
  const user = await getCurrentUser();
  if (!user) return;

  if (user.role === "USER") redirect("/usuario/dashboard");
  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "COMPANY") redirect("/rela/dashboard");
}

export async function requireRelaCompany() {
  const user = await getCurrentUser();
  if (!user) redirect("/rela/login");

  if (user.role === "USER") redirect("/usuario/dashboard");
  if (user.role === "ADMIN") redirect("/admin");
  if (user.role !== "COMPANY") redirect("/rela/login");

  const company = user.companyId
    ? await db.company.findUnique({ where: { id: user.companyId } })
    : null;

  if (!company) redirect("/rela/login");
  if (company.status !== "ACTIVE") redirect("/rela/status");
  return company;
}
