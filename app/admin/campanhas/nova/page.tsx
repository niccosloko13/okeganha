import { CampaignForm } from "@/components/admin/CampaignForm";
import { db } from "@/lib/db";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminNovaCampanhaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedCompanyId = typeof params.companyId === "string" ? params.companyId : "";
  const selectedPostId = typeof params.postId === "string" ? params.postId : "";

  const companies = await db.company.findMany({
    where: { status: "ACTIVE" },
    orderBy: { tradeName: "asc" },
    select: {
      id: true, tradeName: true,
      city: true, neighborhood: true,
      category: true, socialPosts: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        select: { id: true, platform: true, title: true, url: true },
      },
    },
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-extrabold text-[#34134f]">Nova campanha</h1>
      <CampaignForm
        mode="create"
        companies={companies}
        initial={{
          id: "",
          companyId: selectedCompanyId,
          companySocialPostId: selectedPostId,
          title: "",
          description: "",
          city: "",
          neighborhood: "",
          category: "",
          socialPlatform: "INSTAGRAM",
          contentUrl: "",
          objective: "WATCH_VIDEO",
          goalQuantity: 100,
          rewardPerTask: 800,
          dailyLimitPerUser: 2,
          totalBudget: 250000,
          startDate: "",
          endDate: "",
          status: "ACTIVE",
        }}
      />
    </section>
  );
}
