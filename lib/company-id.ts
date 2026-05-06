import { db } from "@/lib/db";

export async function generateCompanyPublicId(): Promise<string> {
  const total = await db.company.count();
  const next = total + 1;
  return `OKG-EMP-${String(next).padStart(6, "0")}`;
}
