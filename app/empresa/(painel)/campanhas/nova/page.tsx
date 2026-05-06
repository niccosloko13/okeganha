import { CompanyCampaignForm } from "@/components/empresa/CompanyCampaignForm";
import { requireCompany } from "@/lib/company-auth";

export default async function EmpresaNovaCampanhaPage() {
  const company = await requireCompany();

  return (
    <section className="space-y-4">
      <div className="ok-card p-4">
        <h1 className="text-2xl font-extrabold text-[#34134f]">Nova campanha</h1>
        <p className="mt-1 text-sm text-[#7a5a99]"> ? Empresa : {company.tradeName}. Sua solicitação será enviada para análise interna antes da ativação.
        </p>
      </div>
      <CompanyCampaignForm />
    </section>
  );
}
