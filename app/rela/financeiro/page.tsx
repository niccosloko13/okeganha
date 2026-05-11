import { RelaShell } from "@/components/rela/RelaShell";
import { requireRelaCompany } from "@/lib/rela-auth";
import { formatDate } from "@/lib/dates";

export default async function RelaFinanceiroPage() {
  const company = await requireRelaCompany();

  return (
    <RelaShell title="Financeiro" subtitle="Controle de tokens, consumo e previsibilidade de investimento." companyName={company.tradeName} companyStatus={company.status} tokenBalance={company.tokensBalance}>
      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-[#2a3c5f] bg-[#121a2f]/85 p-4">
          <p className="text-xs text-[#8fb0dc]">Tokens disponiveis</p>
          <p className="mt-2 text-2xl font-black text-[#eaf2ff]">{company.tokensBalance}</p>
        </article>
        <article className="rounded-2xl border border-[#2a3c5f] bg-[#121a2f]/85 p-4">
          <p className="text-xs text-[#8fb0dc]">Consumo no ciclo</p>
          <p className="mt-2 text-2xl font-black text-[#eaf2ff]">{company.tokensUsedThisCycle}</p>
        </article>
        <article className="rounded-2xl border border-[#2a3c5f] bg-[#121a2f]/85 p-4">
          <p className="text-xs text-[#8fb0dc]">Renovacao prevista</p>
          <p className="mt-2 text-2xl font-black text-[#eaf2ff]">{formatDate(company.billingCycleEnd)}</p>
        </article>
      </section>
      <section className="rounded-3xl border border-[#2a3c5f] bg-[#121a2f]/85 p-5">
        <h2 className="text-lg font-extrabold text-[#e8f2ff]">Historico financeiro (mock)</h2>
        <div className="mt-4 space-y-2">
          {[
            "Credito mensal do plano - +1500 tokens",
            "Envio de campanha para analise - -30 tokens",
            "Criacao de campanha - -20 tokens",
          ].map((item) => (
            <div key={item} className="rounded-xl border border-[#304568] bg-[#141f35] p-3 text-sm text-[#cfe2ff]">
              {item}
            </div>
          ))}
        </div>
      </section>
    </RelaShell>
  );
}
