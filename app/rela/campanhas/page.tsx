import Link from "next/link";

import { RelaShell } from "@/components/rela/RelaShell";
import { requireRelaCompany } from "@/lib/rela-auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

export default async function RelaCampanhasPage() {
  const company = await requireRelaCompany();
  const campaigns = await db.campaign.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <RelaShell
      title="Campanhas"
      subtitle="Gestao de campanhas locais e status de entrega."
      companyName={company.tradeName}
      companyStatus={company.status}
      tokenBalance={company.tokensBalance}
    >
      <section className="rounded-3xl border border-[#2a3c5f] bg-[#121a2f]/85 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#e8f2ff]">Campanhas recentes</h2>
          <Link href="/rela/campanhas/nova" className="rounded-xl bg-gradient-to-r from-[#3c76ff] to-[#21b8d9] px-4 py-2 text-sm font-bold text-white">
            Nova campanha
          </Link>
        </div>
        <div className="space-y-3">
          {campaigns.length === 0 ? (
            <p className="text-sm text-[#9fb6d8]">Nenhuma campanha criada ainda.</p>
          ) : (
            campaigns.map((campaign) => (
              <article key={campaign.id} className="rounded-2xl border border-[#304568] bg-[#141f35] p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm font-bold text-[#dcedff]">{campaign.title}</p>
                  <span className="rounded-lg border border-[#3a5f91] bg-[#12203a] px-2 py-1 text-[11px] font-semibold text-[#cde3ff]">
                    {campaign.socialPlatform}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#8fb0dc]">
                  {campaign.reviewStatus} • {campaign.status}
                </p>
                <p className="mt-1 text-xs text-[#b4c8e8]">
                  {campaign.city} / {campaign.neighborhood} • {formatDate(campaign.createdAt)} • Orcamento {formatMoney(campaign.totalBudget)}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#0f1728]">
                  <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-[#3c76ff] to-[#21b8d9]" />
                </div>
                <p className="mt-1 text-[11px] text-[#8fb0dc]">Progresso estimado de entrega: 42%</p>
              </article>
            ))
          )}
        </div>
      </section>
    </RelaShell>
  );
}
