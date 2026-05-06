import { requestCompanyTokensTopUpFormAction, requestCompanyUpgradeFormAction } from "@/app/actions/company-actions";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { requireCompany } from "@/lib/company-auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dates";
import { getPlanLimits } from "@/lib/company-tokens";

const planCards = [
  {
    plan: "BASIC", title: "Basic",
    description: "300 tokens/mês e até 3 campanhas ativas.",
  },
  {
    plan: "PREMIUM", title: "Premium",
    description: "1.500 tokens/mês e até 15 campanhas ativas.",
  },
  {
    plan: "ENTERPRISE", title: "Enterprise",
    description: "Tokens personalizados e suporte prioritário.",
  },
] as const;

export default async function EmpresaPlanoPage() {
  const company = await requireCompany();
  const limits = getPlanLimits(company.plan);

  const ledger = await db.companyTokenLedger.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <section className="space-y-4">
      <article className="ok-card space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-extrabold text-[#34134f]">Seu plano {company.plan}</h1>
          <AdminStatusBadge status={company.planStatus} />
        </div>

        <div className="grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-2xl border border-[#f0e3ff] bg-[#fcf9ff] p-3">
            <p className="text-xs uppercase tracking-wide text-[#7a5a99]">Tokens disponíveis</p>
            <p className="mt-1 text-2xl font-black text-[#351456]">{company.tokensBalance}</p>
          </div>
          <div className="rounded-2xl border border-[#f0e3ff] bg-[#fcf9ff] p-3">
            <p className="text-xs uppercase tracking-wide text-[#7a5a99]">Tokens usados no ciclo</p>
            <p className="mt-1 text-2xl font-black text-[#351456]">{company.tokensUsedThisCycle}</p>
          </div>
          <div className="rounded-2xl border border-[#f0e3ff] bg-[#fcf9ff] p-3">
            <p className="text-xs uppercase tracking-wide text-[#7a5a99]">Limite mensal</p>
            <p className="mt-1 text-2xl font-black text-[#351456]">{company.tokensMonthlyLimit || limits.monthlyTokens}</p>
          </div>
        </div>

        <p className="text-sm text-[#6f4f8f]">
          Use tokens para criar campanhas e receber ações aprovadas. Renovação do ciclo:{" "}
          {company.billingCycleEnd ? formatDate(company.billingCycleEnd) : "não definida"}.
        </p>

        <div className="flex flex-wrap gap-2">
          <form action={requestCompanyUpgradeFormAction}>
            <button type="submit" className="ok-btn-primary">
              Fazer upgrade
            </button>
          </form>
          <form action={requestCompanyTokensTopUpFormAction}>
            <button type="submit" className="ok-btn-secondary">
              Adicionar tokens
            </button>
          </form>
        </div>
      </article>

      <section className="grid gap-3 md:grid-cols-3">
        {planCards.map((card) => (
          <article key={card.plan} className="ok-card p-4">
            <p className="ok-badge">{card.title}</p>
            <p className="mt-3 text-sm text-[#6f4f8f]">{card.description}</p>
            <form action={requestCompanyUpgradeFormAction} className="mt-3">
              <button type="submit" className="ok-btn-secondary w-full">
                Fazer upgrade
              </button>
            </form>
          </article>
        ))}
      </section>

      <article className="ok-card p-4">
        <h2 className="text-lg font-extrabold text-[#3a1658]">Histórico de uso de tokens</h2>
        <div className="mt-3 space-y-2">
          {ledger.length === 0 ? (
            <p className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-sm text-[#7a5a99]">
              Sem movimentações de tokens neste período.
            </p>
          ) : (
            ledger.map((entry) => (
              <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-sm">
                <div>
                  <p className="font-semibold text-[#4d2e75]">{entry.description}</p>
                  <p className="text-xs text-[#7a5a99]">{entry.type} • {formatDate(entry.createdAt)}</p>
                </div>
                <span className={`text-sm font-bold ${entry.amount >= 0 ? "text-[#2d7d4f]"  : "text-[#933f6c]"}`}>
                  {entry.amount >= 0 ? `+${entry.amount}` : entry.amount} tokens
                </span>
              </div>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
