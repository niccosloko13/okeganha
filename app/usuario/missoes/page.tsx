import { Prisma } from "@prisma/client";

import { GamificationShell, MissionCard } from "@/components/gamification";
import { PremiumStateCard } from "@/components/gamification/PremiumStateCard";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function MissoesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const city = typeof params.city === "string" ? params.city : "";

  const where: Prisma.CampaignWhereInput = {
    status: "ACTIVE",
    reviewStatus: "APPROVED",
    startDate: { lte: new Date() },
    endDate: { gte: new Date() },
    city: city ? { contains: city, mode: "insensitive" } : undefined,
  };

  const campaigns = await db.campaign.findMany({ where, orderBy: { createdAt: "desc" } });

  return (
    <GamificationShell title="Missoes" subtitle="Energia, XP e recompensas em cada missao.">
      <section className="grid gap-3 md:grid-cols-2">
        <PremiumStateCard title="Suba de nivel" description="Conclua missoes seguidas para liberar caixas melhores." type="level_up" />
        <PremiumStateCard title="Energia maxima" description="Gerencie sua energia para manter o ritmo diario." type="energy_low" />
      </section>
      <section className="grid gap-3 md:grid-cols-2">
        {campaigns.length === 0 ? (
          <PremiumStateCard title="Sem missoes por enquanto" description="Novas oportunidades aparecem ao longo do dia." type="empty" />
        ) : campaigns.map((c, idx) => (
          <MissionCard key={c.id} title={c.title} reward={formatMoney(c.rewardPerTask)} href={`/usuario/campanhas/${c.id}`} rarity={idx % 5 === 0 ? "MYTHIC" : idx % 3 === 0 ? "LEGENDARY" : idx % 2 === 0 ? "EPIC" : "RARE"} />
        ))}
      </section>
    </GamificationShell>
  );
}
