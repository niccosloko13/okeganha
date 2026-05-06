import { notFound } from "next/navigation";

import { UserShell } from "@/components/layout/UserShell";
import { TaskProofForm } from "@/components/tarefas/TaskProofForm";
import { TaskSessionPanel } from "@/components/tarefas/TaskSessionPanel";
import { logUserActivity, requireUserNotBlocked } from "@/lib/anti-fraud";
import { requireRegularUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";

type PageProps = {
  params: Promise<{ id: string }>;
};

const platformLabel: Record<string, string> = {
  INSTAGRAM: "Instagram", TIKTOK: "TikTok",
  FACEBOOK: "Facebook", YOUTUBE: "YouTube",
  GOOGLE: "Google", LOCAL: "Local",
  OTHER: "Outra",
};

const objectiveLabel: Record<string, string> = {
  WATCH: "Assistir vídeo", WATCH_VIDEO: "Assistir vídeo",
  VIEW_STORY: "Visualizar story", LIKE: "Curtir conteúdo",
  LIKE_POST: "Curtir publicação", COMMENT: "Comentar publicação",
  COMMENT_POST: "Comentar publicação", FOLLOW: "Seguir perfil",
  FOLLOW_PROFILE: "Seguir perfil", REVIEW: "Avaliar local",
  REVIEW_BUSINESS: "Avaliar local", CHECKIN: "Fazer check-in",
  CHECKIN_BUSINESS: "Fazer check-in", VISIT: "Visitar local",
  VISIT_LOCAL: "Visitar local", OTHER: "Ação social",
};

export default async function TarefaDetalhePage({ params }: PageProps) {
  const user = await requireRegularUser();
  await requireUserNotBlocked(user.id);

  const { id } = await params;
  const task = await db.task.findFirst({
    where: {
      id,
      status: "ACTIVE", campaign: {
        status: "ACTIVE", reviewStatus: "APPROVED",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    },
    include: {
      campaign: {
        select: {
          id: true, title: true,
          companyName: true, dailyLimitPerUser: true,
          socialPlatform: true, objective: true, contentUrl: true,
        },
      },
    },
  });

  if (!task) return notFound();

  await logUserActivity(user.id, "OPEN_TASK", { taskId: task.id, campaignId: task.campaign.id });

  const contentUrl = task.externalUrl || task.campaign.contentUrl;

  return (
    <UserShell title={task.title} subtitle={task.campaign.title}>
      <article className="ok-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="ok-badge">{platformLabel[task.campaign.socialPlatform]}</span>
          <span className="rounded-full border border-[#e5d2ff] bg-[#f8efff] px-2.5 py-1 text-xs font-semibold text-[#6e45a0]">
            {objectiveLabel[task.campaign.objective]}
          </span>
        </div>
        <p className="mt-3 text-sm text-[#8269a0]">Empresa: {task.campaign.companyName}</p>
        <p className="mt-1 text-sm text-[#8269a0]">Limite diário da campanha: {task.campaign.dailyLimitPerUser}</p>
        <p className="mt-3 text-sm text-[#65458b]">{task.description}</p>
        <p className="ok-card-soft mt-3 p-2 text-sm font-semibold text-okBlueDark">Recompensa: {formatMoney(task.reward)}</p>
      </article>

      <article className="ok-card p-5">
        <h2 className="text-lg font-semibold text-[#4d2e75]">Conteúdo da campanha</h2>
        {task.campaign.socialPlatform !== "LOCAL" ? (
          <p className="mt-2 rounded-xl border border-[#efdfff] bg-[#fbf6ff] px-3 py-2 text-sm text-[#6f4f8f]">
            Use a rede conectada para realizar esta ação manualmente.
          </p>
        ) : null}
        {contentUrl ? (
          <>
            <p className="mt-2 text-sm text-[#65458b]">Acesse o conteúdo da missão e realize a ação solicitada.</p>
            <TaskSessionPanel taskId={task.id} campaignId={task.campaign.id} contentUrl={contentUrl} />
          </>
        ) : (
          <p className="mt-2 text-sm text-[#65458b]">Esta missão não exige link externo. Siga as instruções abaixo.</p>
        )}
      </article>

      <article className="ok-card p-5">
        <h2 className="text-lg font-semibold text-[#4d2e75]">Instruções</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-[#65458b]">{task.instructions}</p>
        {task.requiredWatchSeconds ? (
          <p className="mt-3 rounded-xl border border-[#efdfff] bg-[#fbf5ff] px-3 py-2 text-xs font-semibold text-[#6f4f8f]">
            Tempo mínimo de visualização: {task.requiredWatchSeconds} segundos.
          </p>
        ) : null}
      </article>

      <TaskProofForm taskId={task.id} proofType={task.proofType} />
    </UserShell>
  );
}
