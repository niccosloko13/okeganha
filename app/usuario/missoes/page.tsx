import { Prisma } from "@prisma/client";

import { GamificationShell, MissionCard } from "@/components/gamification";
import { PremiumStateCard } from "@/components/gamification/PremiumStateCard";
import { requireRegularUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const platformToConnectLabel: Record<string, string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
};

export default async function MissoesPage({ searchParams }: PageProps) {
  const user = await requireRegularUser();
  const params = await searchParams;
  const city = typeof params.city === "string" ? params.city : "";

  const where: Prisma.CampaignWhereInput = {
    status: "ACTIVE",
    reviewStatus: "APPROVED",
    startDate: { lte: new Date() },
    endDate: { gte: new Date() },
    city: city ? { contains: city, mode: "insensitive" } : undefined,
  };

  const [campaigns, accounts, tasks] = await Promise.all([
    db.campaign.findMany({ where, orderBy: { createdAt: "desc" } }),
    db.userSocialAccount.findMany({ where: { userId: user.id }, select: { platform: true, status: true } }),
    db.task.findMany({ where: { status: "ACTIVE", campaign: where }, select: { id: true, campaignId: true }, orderBy: { createdAt: "asc" } }),
  ]);

  const socialMap = new Map(accounts.map((a) => [a.platform, a.status]));
  const firstTaskByCampaign = new Map<string, string>();
  for (const t of tasks) {
    if (!firstTaskByCampaign.has(t.campaignId)) firstTaskByCampaign.set(t.campaignId, t.id);
  }

  return (
    <GamificationShell title="Missoes" subtitle="Energia, XP e recompensas em cada missao.">
      <section className="grid gap-3 md:grid-cols-2">
        <PremiumStateCard title="Suba de nivel" description="Conclua missoes seguidas para liberar caixas melhores." type="level_up" />
        <PremiumStateCard title="Energia maxima" description="Gerencie sua energia para manter o ritmo diario." type="energy_low" />
      </section>
      <section className="grid gap-3 md:grid-cols-2">
        {campaigns.length === 0 ? (
          <PremiumStateCard title="Sem missoes por enquanto" description="Novas oportunidades aparecem ao longo do dia." type="empty" />
        ) : campaigns.map((c, idx) => {
          const socialStatus = socialMap.get(c.socialPlatform);
          const needsSocialConnect = ["INSTAGRAM", "TIKTOK", "FACEBOOK"].includes(c.socialPlatform);
          const blocked = needsSocialConnect && !(socialStatus === "CONNECTED" || socialStatus === "PENDING");
          const rarity = idx % 5 === 0 ? "MYTHIC" : idx % 3 === 0 ? "LEGENDARY" : idx % 2 === 0 ? "EPIC" : "RARE";
          const taskId = firstTaskByCampaign.get(c.id);

          if (blocked) {
            return (
              <article key={c.id} className="rounded-2xl border border-[#6f45a3] bg-[#1a1030]/85 p-4">
                <p className="inline-block rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold">BLOQUEADA</p>
                <h3 className="mt-2 text-base font-extrabold text-white">{c.title}</h3>
                <p className="text-sm text-[#c8b0e5]">{formatMoney(c.rewardPerTask)}</p>
                <p className="mt-2 text-xs text-[#d7bee9]">Conecte {platformToConnectLabel[c.socialPlatform]} para liberar esta missao.</p>
                <a href="/usuario/redes" className="mt-3 inline-block min-h-[44px] rounded-xl border border-[#7f4ab6] bg-[#241640] px-4 py-3 text-xs font-semibold text-white">Conectar {platformToConnectLabel[c.socialPlatform]}</a>
              </article>
            );
          }

          if (!taskId) {
            return <PremiumStateCard key={c.id} title={c.title} description="Missao em preparacao. Volte em instantes." type="empty" />;
          }

          return <MissionCard key={c.id} title={c.title} reward={formatMoney(c.rewardPerTask)} href={`/usuario/tarefas/${taskId}`} rarity={rarity} />;
        })}
      </section>
    </GamificationShell>
  );
}
