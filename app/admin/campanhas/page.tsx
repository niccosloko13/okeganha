import Link from "next/link";
import { Prisma } from "@prisma/client";

import {
  activateCampaignAction,
  approveCampaignReviewAction,
  pauseCampaignAction,
  rejectCampaignReviewAction,
} from "@/app/actions/admin-actions";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { db } from "@/lib/db";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const platformLabel: Record<string, string> = {
  INSTAGRAM: "Instagram", TIKTOK: "TikTok",
  FACEBOOK: "Facebook", YOUTUBE: "YouTube",
  GOOGLE: "Google", LOCAL: "Local",
  OTHER: "Outra",
};

function parseMeta(description: string) {
  const maxApprovedActions = description.match(/Meta de ações aprovadas:\s*(\d+)/i)?.[1];
  return {
    maxApprovedActions: maxApprovedActions ? Number(maxApprovedActions) : null,
  };
}

export default async function AdminCampanhasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const view = typeof params.view === "string" ? params.view : "all";

  const where: Prisma.CampaignWhereInput =
    view === "under_review"
      ? { reviewStatus: "UNDER_REVIEW" }
      : view === "approved"
        ? { reviewStatus: "APPROVED" }
        : view === "rejected"
          ? { reviewStatus: "REJECTED" }
          : view === "active"
            ? { status: "ACTIVE" }
            : view === "paused"
              ? { status: "PAUSED" }
              : view === "finished"
                ? { status: "FINISHED" }
                : {};

  const [campaigns, total, underReview, approved, rejected, active, paused, finished] = await Promise.all([
    db.campaign.findMany({ where, orderBy: { createdAt: "desc" }, include: { tasks: { select: { id: true }, take: 1 } } }),
    db.campaign.count(),
    db.campaign.count({ where: { reviewStatus: "UNDER_REVIEW" } }),
    db.campaign.count({ where: { reviewStatus: "APPROVED" } }),
    db.campaign.count({ where: { reviewStatus: "REJECTED" } }),
    db.campaign.count({ where: { status: "ACTIVE" } }),
    db.campaign.count({ where: { status: "PAUSED" } }),
    db.campaign.count({ where: { status: "FINISHED" } }),
  ]);

  const filters = [
    { key: "all", label: "Todas", count: total },
    { key: "under_review", label: "Em análise", count: underReview },
    { key: "approved", label: "Aprovadas", count: approved },
    { key: "rejected", label: "Reprovadas", count: rejected },
    { key: "active", label: "Ativas", count: active },
    { key: "paused", label: "Pausadas", count: paused },
    { key: "finished", label: "Finalizadas", count: finished },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold text-[#34134f]">Campanhas</h1>
        <Link href="/admin/campanhas/nova" className="ok-btn-primary">Nova campanha</Link>
      </div>

      <div className="ok-card flex flex-wrap gap-2 p-3">
        {filters.map((item) => (
          <Link
            key={item.key}
            href={`/admin/campanhasview=${item.key}`}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${
              view === item.key ? "bg-[#f5e8ff] text-[#4f2379]" : "border border-[#ead7ff] text-[#785b99]"
            }`}
          >
            {item.label} ({item.count})
          </Link>
        ))}
      </div>

      <AdminTable>
        <table className="w-full min-w-[1380px] text-sm">
          <thead className="bg-[#faf4ff] text-left text-xs uppercase tracking-wide text-[#7e62a0]">
            <tr>
              <th className="px-3 py-2">Empresa</th>
              <th className="px-3 py-2">Título</th>
              <th className="px-3 py-2">Plataforma</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Status operacional</th>
              <th className="px-3 py-2">Status de análise</th>
              <th className="px-3 py-2">Tokens estimados</th>
              <th className="px-3 py-2">Recompensa definida</th>
              <th className="px-3 py-2">Limite definido</th>
              <th className="px-3 py-2">Orçamento definido</th>
              <th className="px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => {
              const meta = parseMeta(campaign.description);
              const rewardSet = campaign.rewardPerTask > 0;
              const limitSet = campaign.dailyLimitPerUser > 0;
              const budgetSet = campaign.totalBudget > 0;
              const estimatedTokens = 30 + (meta.maxApprovedActions ?? 0) * 5;

              return (
                <tr key={campaign.id} className="border-t border-[#f0e3ff] align-top">
                  <td className="px-3 py-2 font-medium text-[#4a2c6e]">{campaign.companyName}</td>
                  <td className="px-3 py-2 font-semibold text-[#4d2e75]">{campaign.title}</td>
                  <td className="px-3 py-2">{platformLabel[campaign.socialPlatform]}</td>
                  <td className="px-3 py-2">{campaign.objective}</td>
                  <td className="px-3 py-2"><AdminStatusBadge status={campaign.status} /></td>
                  <td className="px-3 py-2"><AdminStatusBadge status={campaign.reviewStatus} /></td>
                  <td className="px-3 py-2">{estimatedTokens}</td>
                  <td className="px-3 py-2">{rewardSet ? "Sim" : "Não"}</td>
                  <td className="px-3 py-2">{limitSet ? "Sim" : "Não"}</td>
                  <td className="px-3 py-2">{budgetSet ? "Sim" : "Não"}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      <Link href={`/admin/campanhas/${campaign.id}`} className="ok-btn-secondary">Revisar</Link>
                      <Link href={`/admin/campanhas/${campaign.id}`} className="ok-btn-secondary">Editar</Link>

                      <form action={approveCampaignReviewAction}>
                        <input type="hidden" name="campaignId" value={campaign.id} />
                        <button type="submit" className="ok-btn-secondary">Aprovar</button>
                      </form>

                      <form action={rejectCampaignReviewAction} className="flex items-center gap-1">
                        <input type="hidden" name="campaignId" value={campaign.id} />
                        <input
                          name="rejectionReason"
                          required
                          minLength={8}
                          placeholder="Motivo"
                          className="h-8 w-28 rounded-lg border border-[#ead9ff] bg-white px-2 text-xs text-[#4a2b70] outline-none"
                        />
                        <button type="submit" className="ok-btn-secondary">Reprovar</button>
                      </form>

                      {campaign.status === "ACTIVE" ? (
                        <form action={pauseCampaignAction}>
                          <input type="hidden" name="campaignId" value={campaign.id} />
                          <button type="submit" className="ok-btn-secondary">Pausar</button>
                        </form>
                      ) : campaign.status === "PAUSED" ? (
                        <form action={activateCampaignAction}>
                          <input type="hidden" name="campaignId" value={campaign.id} />
                          <button type="submit" className="ok-btn-secondary">Ativar</button>
                        </form>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </AdminTable>
    </section>
  );
}
