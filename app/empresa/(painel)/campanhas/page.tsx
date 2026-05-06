import Link from "next/link";

import { submitCompanyCampaignForReviewFormAction } from "@/app/actions/company-actions";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { requireCompany } from "@/lib/company-auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dates";
import { tokenCostRules } from "@/lib/company-tokens";

const platformLabel: Record<string, string> = {
  INSTAGRAM: "Instagram", TIKTOK: "TikTok",
  FACEBOOK: "Facebook", YOUTUBE: "YouTube",
  GOOGLE: "Google", LOCAL: "Local",
  OTHER: "Outra",
};

function reviewMessage(reviewStatus: string, status: string, description: string) {
  if (reviewStatus === "UNDER_REVIEW") return "Aguardando aprovação";
  if (reviewStatus === "APPROVED" && status === "ACTIVE") return "Campanha ativa";
  if (reviewStatus === "REJECTED") {
    const reason = description.match(/Motivo da reprovação:\s*(.*)/i)?.[1];
    return reason ? `Reprovada: ${reason}` : "Reprovada. Verifique os ajustes solicitados.";
  }
  return "Rascunho";
}

export default async function EmpresaCampanhasPage() {
  const company = await requireCompany();
  const rules = tokenCostRules();

  const campaigns = await db.campaign.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          taskSubmissions: true,
        },
      },
    },
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold text-[#34134f]">Campanhas da empresa</h1>
        <Link href="/empresa/campanhas/nova" className="ok-btn-primary">
          Nova campanha
        </Link>
      </div>

      <div className="space-y-3">
        {campaigns.length === 0 ? (
          <article className="ok-card p-4 text-sm text-[#6f4f8f]">
            Você ainda não criou campanhas. Envie sua primeira solicitação para análise.
          </article>
        ) : (
          campaigns.map((campaign) => (
            <article key={campaign.id} className="ok-card space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-extrabold text-[#3a1658]">{campaign.title}</h2>
                  <p className="text-sm text-[#7a5a99]">
                    {platformLabel[campaign.socialPlatform]} • {campaign.objective} • {campaign.city}/{campaign.neighborhood}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <AdminStatusBadge status={campaign.status} />
                  <AdminStatusBadge status={campaign.reviewStatus} />
                </div>
              </div>

              <div className="grid gap-2 text-sm text-[#6f4f8f] md:grid-cols-3">
                <p>Envios recebidos: {campaign._count.taskSubmissions}</p>
                <p>Ações aprovadas: em análise pelo admin</p>
                <p>Consumo estimado por ação aprovada: {rules.approvedAction} tokens</p>
              </div>

              <p className="text-xs text-[#8a71a6]">Criada em {formatDate(campaign.createdAt)}</p>
              <p className="text-xs font-semibold text-[#6f4f8f]">{reviewMessage(campaign.reviewStatus, campaign.status, campaign.description)}</p>

              {(campaign.reviewStatus === "DRAFT" || campaign.reviewStatus === "REJECTED") && campaign.status !== "FINISHED" ? (
                <form action={submitCompanyCampaignForReviewFormAction}>
                  <input type="hidden" name="campaignId" value={campaign.id} />
                  <button type="submit" className="ok-btn-secondary">
                    Enviar campanha para análise
                  </button>
                </form>
              ) : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
