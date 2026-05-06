import Link from "next/link";

import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dates";
import { requireCompany } from "@/lib/company-auth";
import { getPlanLimits, tokenCostRules } from "@/lib/company-tokens";

const campaignTemplates = [
  { title: "Quero divulgar um Reels", objective: "WATCH_VIDEO" },
  { title: "Quero mais seguidores", objective: "FOLLOW_PROFILE" },
  { title: "Quero avaliações no Google", objective: "REVIEW_BUSINESS" },
  { title: "Quero visitas na loja", objective: "VISIT_LOCAL" },
];

export default async function EmpresaDashboardPage() {
  const company = await requireCompany();
  const rules = tokenCostRules();
  const planLimits = getPlanLimits(company.plan);

  const [activeCampaigns, pendingReviews, approvedActions, recentCampaigns, approvedByCampaign] = await Promise.all([
    db.campaign.count({ where: { companyId: company.id, status: "ACTIVE" } }),
    db.campaign.count({ where: { companyId: company.id, reviewStatus: "UNDER_REVIEW" } }),
    db.taskSubmission.count({
      where: {
        campaign: { companyId: company.id },
        status: "APPROVED",
      },
    }),
    db.campaign.findMany({
      where: { companyId: company.id },
      orderBy: { updatedAt: "desc" },
      take: 6, include: {
        _count: {
          select: { taskSubmissions: true },
        },
      },
    }),
    db.taskSubmission.groupBy({
      by: ["campaignId"], where: {
        status: "APPROVED", campaign: { companyId: company.id },
      },
      _count: { _all: true },
    }),
  ]);

  const approvedByCampaignMap = new Map(approvedByCampaign.map((item) => [item.campaignId, item._count._all]));
  const lowBalance = company.tokensBalance < 50;

  return (
    <section className="space-y-4">
      <section className="ok-card-premium rounded-3xl border border-[#cd9dff] bg-gradient-to-br from-[#ff5cb9] via-[#c34dff] to-[#6e2fb7] p-5 text-white shadow-[0_26px_44px_-24px_rgba(90,24,148,0.9)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-white/85">Painel empresarial</p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">Seu plano {company.plan}</h1>
            <p className="mt-2 text-sm text-white/90">
              Tokens disponíveis: <strong>{company.tokensBalance}</strong> • Próxima renovação: {company.billingCycleEnd ? formatDate(company.billingCycleEnd) : "não definida"}
            </p>
          </div>
          <AdminStatusBadge status={company.planStatus} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/empresa/campanhas/nova" className="rounded-2xl border border-white/20 bg-white px-4 py-2 font-semibold text-[#6a34a2]">
            Nova campanha
          </Link>
          <Link href="/empresa/plano" className="rounded-2xl border border-white/35 bg-white/20 px-4 py-2 font-semibold text-white">
            Ver plano
          </Link>
        </div>
      </section>

      {lowBalance ? (
        <div className="rounded-2xl border border-[#ffd3eb] bg-[#fff1fa] px-4 py-3 text-sm text-[#8f3b6b]">
          Seus tokens estão acabando. Faça upgrade para continuar rodando campanhas.
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Plano atual" value={company.plan} helper={`Limite de ${planLimits.activeCampaignLimit} campanhas ativas`} />
        <MetricCard label="Tokens disponíveis" value={String(company.tokensBalance)} helper={`Uso no ciclo: ${company.tokensUsedThisCycle}`} />
        <MetricCard label="Campanhas ativas" value={String(activeCampaigns)} helper="Em execução" />
        <MetricCard label="Campanhas em análise" value={String(pendingReviews)} helper="Aguardando revisão admin" />
        <MetricCard label="Ações aprovadas" value={String(approvedActions)} helper="Total validado" />
        <MetricCard
          label="Próxima renovação"
          value={company.billingCycleEnd ? formatDate(company.billingCycleEnd) : "-"}
          helper="Ciclo do plano"
        />
      </section>

      <section className="ok-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-extrabold text-[#3a1658]">Crie sua próxima campanha</h2>
          <Link href="/empresa/campanhas/nova" className="ok-btn-primary">
            Nova campanha
          </Link>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {campaignTemplates.map((template) => (
            <Link
              key={template.title}
              href={`/empresa/campanhas/novaobjective=${template.objective}`}
              className="rounded-2xl border border-[#ead4ff] bg-[#fcf7ff] p-3 text-sm font-semibold text-[#4d2e75] transition hover:-translate-y-1"
            >
              {template.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="ok-card p-4">
        <h2 className="text-lg font-extrabold text-[#3a1658]">Suas campanhas recentes</h2>
        <div className="mt-3 space-y-2">
          {recentCampaigns.length === 0 ? (
            <p className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-3 text-sm text-[#7a5a99]">
              Nenhuma campanha criada ainda.
            </p>
          ) : (
            recentCampaigns.map((campaign) => {
              const approved = approvedByCampaignMap.get(campaign.id) ?? 0;
              const consumed = approved * rules.approvedAction;
              return (
                <article key={campaign.id} className="rounded-2xl border border-[#f0e3ff] bg-[#fcf9ff] p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#4d2e75]">{campaign.title}</p>
                      <p className="text-xs text-[#7a5a99]">Atualizada em {formatDate(campaign.updatedAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AdminStatusBadge status={campaign.status} />
                      <AdminStatusBadge status={campaign.reviewStatus} />
                    </div>
                  </div>
                  <div className="mt-2 grid gap-2 text-xs text-[#6f4f8f] sm:grid-cols-3">
                    <p>Tokens estimados: {rules.campaignCreation + rules.submitForReview}</p>
                    <p>Tokens consumidos: {consumed}</p>
                    <p>Ações aprovadas: {approved}</p>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="ok-card p-4">
        <h2 className="text-lg font-extrabold text-[#3a1658]">Como melhorar resultados</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Tip text="Use links corretos e públicos para facilitar a validação." />
          <Tip text="Escreva instruções claras para o usuário executar a ação." />
          <Tip text="Escolha o objetivo certo para o tipo de campanha." />
          <Tip text="Após enviar, aguarde a aprovação do admin para ativação." />
        </div>
      </section>
    </section>
  );
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <article className="ok-card p-4">
      <p className="text-xs uppercase tracking-wide text-[#7a5a99]">{label}</p>
      <p className="mt-1 text-2xl font-black text-[#351456]">{value}</p>
      <p className="mt-1 text-xs text-[#7a5a99]">{helper}</p>
    </article>
  );
}

function Tip({ text }: { text: string }) {
  return <p className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-sm text-[#6f4f8f]">{text}</p>;
}
