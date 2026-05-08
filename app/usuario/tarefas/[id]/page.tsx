import { notFound } from "next/navigation";
import Image from "next/image";

import { EnergyBar, GamificationShell, MissionCard, XPBar } from "@/components/gamification";
import { TaskProofForm } from "@/components/tarefas/TaskProofForm";
import { TaskSessionPanel } from "@/components/tarefas/TaskSessionPanel";
import { logUserActivity, requireUserNotBlocked } from "@/lib/anti-fraud";
import { requireRegularUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { GAMIFICATION_ASSETS } from "@/lib/gamification-assets";
import { formatMoney } from "@/lib/money";

type PageProps = { params: Promise<{ id: string }> };

const platformLabel: Record<string, string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
  YOUTUBE: "YouTube",
  GOOGLE: "Google",
  LOCAL: "Local",
  OTHER: "Outra",
};

export default async function TarefaDetalhePage({ params }: PageProps) {
  const user = await requireRegularUser();
  await requireUserNotBlocked(user.id);

  const { id } = await params;
  const task = await db.task.findFirst({
    where: {
      id,
      status: "ACTIVE",
      campaign: {
        status: "ACTIVE",
        reviewStatus: "APPROVED",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    },
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
          companyName: true,
          socialPlatform: true,
          contentUrl: true,
        },
      },
    },
  });

  if (!task) return notFound();

  await logUserActivity(user.id, "OPEN_TASK", { taskId: task.id, campaignId: task.campaign.id });

  const contentUrl = task.externalUrl || task.campaign.contentUrl;
  const energyNeed = Math.max(20, Math.round(task.reward / 20));
  const xpGain = Math.max(12, Math.round(task.reward / 8));

  return (
    <GamificationShell title="Missao" subtitle="Execucao guiada com seguranca e validacao.">
      <section className="rounded-3xl border border-[#6f45a3] bg-[#1a1030]/90 p-4 md:p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-xs text-[#cbb4e8]">{platformLabel[task.campaign.socialPlatform]}  {task.campaign.companyName}</p>
            <h1 className="text-xl font-black text-white">{task.title}</h1>
            <p className="mt-1 text-sm text-[#d3bcea]">{task.description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-md bg-[#2a1845] px-2 py-1 text-[#f8e9ff]">Recompensa {formatMoney(task.reward)}</span>
              <span className="rounded-md bg-[#1d2445] px-2 py-1 text-[#cde1ff]">Energia {energyNeed}</span>
              <span className="rounded-md bg-[#2a1845] px-2 py-1 text-[#f8e9ff]">XP +{xpGain}</span>
              {task.requiredWatchSeconds ? <span className="rounded-md bg-[#24183f] px-2 py-1 text-[#e7d9fa]">Tempo {task.requiredWatchSeconds}s</span> : null}
            </div>
          </div>
          <Image src={GAMIFICATION_ASSETS.platforms.instagram} alt="missao" width={120} height={120} className="h-24 w-24 rounded-2xl object-cover" />
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-[#6f45a3] bg-[#1a1030]/85 p-4"><XPBar xp={user.xp} nextXp={15500} /></div>
        <div className="rounded-2xl border border-[#6f45a3] bg-[#1a1030]/85 p-4"><EnergyBar energy={user.energy} maxEnergy={user.maxEnergy} /></div>
      </section>

      <section className="rounded-3xl border border-[#6f45a3] bg-[#1a1030]/90 p-4">
        <h2 className="text-lg font-extrabold text-white">Instrucoes</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-[#d0b8ed]">{task.instructions}</p>
      </section>

      {contentUrl ? <TaskSessionPanel taskId={task.id} campaignId={task.campaign.id} contentUrl={contentUrl} /> : null}

      <section className="rounded-3xl border border-[#6f45a3] bg-[#1a1030]/90 p-4">
        <button type="button" disabled className="min-h-[44px] rounded-xl border border-[#6f45a3] bg-[#241640] px-4 py-2 text-sm font-semibold text-[#d8c2ef]">Finalizar (libera apos regra)</button>
      </section>

      <TaskProofForm taskId={task.id} proofType={task.proofType} />

      <MissionCard title="Missao rapida sugerida" reward={formatMoney(task.reward)} href="/usuario/missoes" rarity="RARE" />
    </GamificationShell>
  );
}
