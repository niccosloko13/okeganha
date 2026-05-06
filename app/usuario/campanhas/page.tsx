import { Prisma } from "@prisma/client";

import { CampaignCard } from "@/components/campanhas/CampaignCard";
import { UserShell } from "@/components/layout/UserShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { db } from "@/lib/db";

const platformLabel: Record<string, string> = {
  INSTAGRAM: "Instagram", TIKTOK: "TikTok",
  FACEBOOK: "Facebook", YOUTUBE: "YouTube",
  GOOGLE: "Google", LOCAL: "Local",
  OTHER: "Outra",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CampanhasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const city = typeof params.city === "string" ? params.city : "";
  const category = typeof params.category === "string" ? params.category : "";
  const sort = typeof params.sort === "string" ? params.sort : "default";

  const where: Prisma.CampaignWhereInput = {
    status: "ACTIVE", reviewStatus: "APPROVED",
    startDate: { lte: new Date() },
    endDate: { gte: new Date() },
    city: city ? { contains: city, mode: "insensitive" } : undefined,
    category: category ? { contains: category, mode: "insensitive" } : undefined,
  };

  const campaigns = await db.campaign.findMany({
    where, orderBy: sort === "highest_reward" ? { rewardPerTask: "desc" } : { createdAt: "desc" },
  });

  return (
    <UserShell title="Campanhas" subtitle="Escolha oportunidades e conclua tarefas.">
      <form className="ok-card ok-fade-up grid gap-2 p-4 md:grid-cols-4">
        <input name="city" defaultValue={city} placeholder="Cidade" className="ok-input" />
        <input name="category" defaultValue={category} placeholder="Categoria" className="ok-input" />
        <select name="sort" defaultValue={sort} className="ok-input">
          <option value="default">Ordenar: padrão</option>
          <option value="highest_reward">Maior recompensa</option>
        </select>
        <button type="submit" className="ok-btn-primary">
          Filtrar
        </button>
      </form>

      <section className="space-y-3 ok-fade-up ok-fade-delay-1">
        {campaigns.length === 0 ? (
          <EmptyState title="Nenhuma campanha encontrada" description="Ajuste os filtros ou volte mais tarde." />
        ) : (
          campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} {...campaign} platform={platformLabel[campaign.socialPlatform] || null} />
          ))
        )}
      </section>
    </UserShell>
  );
}
