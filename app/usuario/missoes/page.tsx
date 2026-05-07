import { Prisma } from "@prisma/client";

import { MissionCard } from "@/components/gamification";
import { UserShell } from "@/components/layout/UserShell";
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
    <UserShell title="Missoes" subtitle="Escolha e complete para subir de nivel.">
      <section className="grid gap-3 md:grid-cols-2">
        {campaigns.map((c) => (
          <MissionCard key={c.id} title={c.title} reward={formatMoney(c.rewardPerTask)} href={`/usuario/campanhas/${c.id}`} />
        ))}
      </section>
    </UserShell>
  );
}
