import Link from "next/link";

import { RelaMetricCard } from "@/components/rela/RelaMetricCard";
import { RelaShell } from "@/components/rela/RelaShell";
import { requireRelaCompany } from "@/lib/rela-auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export default async function RelaDashboardPage() {
  const company = await requireRelaCompany();
  const [activeCampaigns, underReview, approvedSubmissions] = await Promise.all([
    db.campaign.count({ where: { companyId: company.id, status: "ACTIVE" } }),
    db.campaign.count({ where: { companyId: company.id, reviewStatus: "UNDER_REVIEW" } }),
    db.taskSubmission.count({ where: { status: "APPROVED", campaign: { companyId: company.id } } }),
  ]);

  return (
    <RelaShell
      title="Dashboard Executivo"
      subtitle="Visao consolidada de campanhas, entrega e eficiencia regional."
      companyName={company.tradeName}
      companyStatus={company.status}
      tokenBalance={company.tokensBalance}
    >
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <RelaMetricCard label="Campanhas ativas" value={String(activeCampaigns)} helper={`${underReview} em analise`} trend="+8.4% semanal" />
        <RelaMetricCard label="Tokens disponiveis" value={String(company.tokensBalance)} helper={`Plano ${company.plan}`} trend="ciclo em andamento" />
        <RelaMetricCard label="Engajamentos validados" value={String(approvedSubmissions)} helper="Provas aprovadas pelo fluxo" trend="+12.1% semanal" />
        <RelaMetricCard label="Orcamento atual" value={formatMoney(company.tokensMonthlyLimit * 100)} helper="Capacidade estimada do ciclo" trend="uso eficiente" />
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-[#2a3c5f] bg-[#121a2f]/85 p-5">
          <h2 className="text-lg font-extrabold text-[#e8f2ff]">Atividade recente</h2>
          <p className="mt-1 text-sm text-[#9eb5d8]">Eventos de campanhas e prova de entrega em tempo real.</p>
          <div className="mt-4 space-y-3">
            {[
              { name: "Academia Centro - Instagram", status: "Em analise", reach: "1.240 entregas", stamp: "ha 12 min" },
              { name: "Clinica Norte - Google Review", status: "Ativa", reach: "982 entregas", stamp: "ha 28 min" },
              { name: "Restaurante Sul - TikTok", status: "Ativa", reach: "1.431 entregas", stamp: "ha 54 min" },
            ].map((item) => (
              <div key={item.name} className="rounded-2xl border border-[#304568] bg-[#141f35] p-3">
                <p className="text-sm font-bold text-[#dcedff]">{item.name}</p>
                <p className="mt-1 text-xs text-[#8fb0dc]">{item.status}</p>
                <p className="mt-1 text-xs text-[#b4c8e8]">{item.reach} - {item.stamp}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-[#2a3c5f] bg-[#121a2f]/85 p-5">
          <h2 className="text-lg font-extrabold text-[#e8f2ff]">Painel de performance</h2>
          <div className="mt-3 space-y-3">
            <div className="rounded-2xl border border-[#304568] bg-[#141f35] p-3">
              <p className="text-xs text-[#8fb0dc]">Alcance estimado</p>
              <p className="text-xl font-black text-[#e8f2ff]">+18.400 contas locais</p>
            </div>
            <div className="rounded-2xl border border-[#304568] bg-[#141f35] p-3">
              <p className="text-xs text-[#8fb0dc]">Custo por acao estimado</p>
              <p className="text-xl font-black text-[#e8f2ff]">R$ 3,91</p>
            </div>
          </div>
          <h3 className="mt-4 text-sm font-bold text-[#d8e8ff]">Recomendacoes</h3>
          <ul className="mt-3 space-y-2 text-sm text-[#a7bfdf]">
            <li>Reforcar campanhas de maior conversao por bairro.</li>
            <li>Redistribuir orcamento para faixas com melhor custo por acao.</li>
            <li>Subir nova campanha de alcance para horario de pico regional.</li>
          </ul>
          <Link href="/rela/campanhas/nova" className="mt-5 inline-block rounded-xl bg-gradient-to-r from-[#3c76ff] to-[#21b8d9] px-4 py-3 text-sm font-bold text-white">
            Criar campanha
          </Link>
        </article>
      </section>
    </RelaShell>
  );
}
