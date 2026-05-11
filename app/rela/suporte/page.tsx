import { RelaShell } from "@/components/rela/RelaShell";
import { requireRelaCompany } from "@/lib/rela-auth";

export default async function RelaSuportePage() {
  const company = await requireRelaCompany();
  return (
    <RelaShell title="Suporte" subtitle="Canal dedicado para operacao, revisoes e orientacao de campanhas." companyName={company.tradeName} companyStatus={company.status} tokenBalance={company.tokensBalance}>
      <section className="rounded-3xl border border-[#2a3c5f] bg-[#121a2f]/85 p-5">
        <h2 className="text-lg font-extrabold text-[#e8f2ff]">Atendimento empresarial</h2>
        <p className="mt-2 text-sm text-[#9fb6d8]">Fale com o time para ajustes de entrega, revisao de campanhas e planejamento regional.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[#304568] bg-[#141f35] p-3 text-sm text-[#cfe2ff]">SLA prioritario para contas ativas</div>
          <div className="rounded-2xl border border-[#304568] bg-[#141f35] p-3 text-sm text-[#cfe2ff]">Revisao de provas e qualidade</div>
          <div className="rounded-2xl border border-[#304568] bg-[#141f35] p-3 text-sm text-[#cfe2ff]">Consultoria de performance local</div>
        </div>
      </section>
    </RelaShell>
  );
}
