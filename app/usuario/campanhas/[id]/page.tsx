import Link from "next/link";
import { notFound } from "next/navigation";

import { UserShell } from "@/components/layout/UserShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
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
  VIEW_STORY: "Ver story", LIKE: "Curtir conteúdo",
  LIKE_POST: "Curtir publicação", COMMENT: "Comentar publicação",
  COMMENT_POST: "Comentar publicação", FOLLOW: "Seguir perfil",
  FOLLOW_PROFILE: "Seguir perfil", REVIEW: "Avaliar local",
  REVIEW_BUSINESS: "Avaliar local", CHECKIN: "Fazer check-in",
  CHECKIN_BUSINESS: "Fazer check-in", VISIT: "Visitar local",
  VISIT_LOCAL: "Visitar local", OTHER: "Outra ação",
};

export default async function CampanhaDetalhePage({ params }: PageProps) {
  const user = await requireRegularUser();
  await requireUserNotBlocked(user.id);

  const { id } = await params;

  const campaign = await db.campaign.findFirst({
    where: {
      id,
      status: "ACTIVE", reviewStatus: "APPROVED",
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
    include: {
      tasks: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!campaign) return notFound();

  await logUserActivity(user.id, "VIEW_CAMPAIGN", { campaignId: campaign.id });

  return (
    <UserShell title={campaign.title} subtitle={campaign.companyName}>
      <article className="ok-card ok-fade-up p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <StatusBadge status={campaign.status} />
          <p className="text-sm font-medium text-okBlueDark">{formatMoney(campaign.rewardPerTask)} por tarefa</p>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="ok-badge">{platformLabel[campaign.socialPlatform]}</span>
          <span className="rounded-full border border-[#e5d2ff] bg-[#f8efff] px-2.5 py-1 text-xs font-semibold text-[#6e45a0]">
            {objectiveLabel[campaign.objective]}
          </span>
        </div>
        <p className="mt-3 text-sm text-[#65458b]">{campaign.description}</p>
        <div className="mt-4 grid gap-2 text-sm text-[#8269a0] md:grid-cols-2">
          <p>
            <strong>Empresa:</strong> {campaign.companyName}
          </p>
          <p>
            <strong>Região:</strong> {campaign.city} - {campaign.neighborhood}
          </p>
          <p>
            <strong>Categoria:</strong> {campaign.category}
          </p>
          <p>
            <strong>Limite diário:</strong> {campaign.dailyLimitPerUser}
          </p>
        </div>
      </article>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[#4d2e75]">Tarefas disponíveis</h2>
        {campaign.tasks.map((task) => (
          <article key={task.id} className="ok-card ok-hover-lift p-4">
            <h3 className="font-semibold text-[#4d2e75]">{task.title}</h3>
            <p className="text-sm text-[#8269a0]">{task.description}</p>
            <p className="mt-1 text-sm font-medium text-okBlueDark">{formatMoney(task.reward)}</p>
            <Link href={`/usuario/tarefas/${task.id}`} className="ok-btn-primary mt-3 inline-block text-sm">
              Começar tarefa
            </Link>
          </article>
        ))}
      </section>
    </UserShell>
  );
}
