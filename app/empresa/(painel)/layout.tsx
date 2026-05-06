import { getImpersonatedCompany } from "@/lib/admin-impersonation";
import { CompanyShell } from "@/components/empresa/CompanyShell";
import { requireCompany } from "@/lib/company-auth";

export default async function EmpresaPainelLayout({ children }: { children: React.ReactNode }) {
  const company = await requireCompany();
  const impersonation = await getImpersonatedCompany();
  return (
    <CompanyShell companyName={company.tradeName} isImpersonating={Boolean(impersonation)}>
      {children}
    </CompanyShell>
  );
}
