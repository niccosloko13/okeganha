import { CompanyCampaignForm } from "@/components/empresa/CompanyCampaignForm";
import { RelaShell } from "@/components/rela/RelaShell";
import { requireRelaCompany } from "@/lib/rela-auth";

export default async function RelaNovaCampanhaPage() {
  const company = await requireRelaCompany();

  return (
    <RelaShell
      title="Nova campanha"
      subtitle="Configure objetivo, canais e parametros de entrega."
      companyName={company.tradeName}
      companyStatus={company.status}
      tokenBalance={company.tokensBalance}
    >
      <section className="rounded-3xl border border-[#2a3c5f] bg-[#121a2f]/85 p-5">
        <p className="mb-4 text-sm text-[#9fb6d8]">
          Empresa: <strong className="text-[#eaf2ff]">{company.tradeName}</strong>. A solicitacao segue para analise interna antes da ativacao.
        </p>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[#304568] bg-[#141f35] p-3">
            <p className="text-xs text-[#8fb0dc]">Etapa 1</p>
            <p className="text-sm font-bold text-[#e8f2ff]">Defina objetivo e plataforma</p>
          </div>
          <div className="rounded-2xl border border-[#304568] bg-[#141f35] p-3">
            <p className="text-xs text-[#8fb0dc]">Etapa 2</p>
            <p className="text-sm font-bold text-[#e8f2ff]">Estruture alcance e orcamento</p>
          </div>
          <div className="rounded-2xl border border-[#304568] bg-[#141f35] p-3">
            <p className="text-xs text-[#8fb0dc]">Etapa 3</p>
            <p className="text-sm font-bold text-[#e8f2ff]">Enviar para analise interna</p>
          </div>
        </div>
        <div className="mb-4 rounded-2xl border border-[#3a5f91] bg-[#12203a] p-3 text-sm text-[#c8dcff]">
          Estimativa inicial: 30 tokens por envio e alcance regional calculado pela configuracao da campanha.
        </div>
        <CompanyCampaignForm />
      </section>
    </RelaShell>
  );
}
