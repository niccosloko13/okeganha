import { Prisma, SocialPlatform, SubmissionStatus } from "@prisma/client";

import { SubmissionReviewCard } from "@/components/admin/SubmissionReviewCard";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dates";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminTarefasPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const status = typeof params.status === "string" ? params.status  : "";
  const campaignId = typeof params.campaignId === "string" ? params.campaignId  : "";
  const userId = typeof params.userId === "string" ? params.userId  : "";
  const platform = typeof params.platform === "string" ? params.platform  : "";
  const date = typeof params.date === "string" ? params.date  : "";

  const where: Prisma.TaskSubmissionWhereInput = {
    status: status ? (status as SubmissionStatus) : undefined,
    campaignId: campaignId || undefined,
    userId: userId || undefined,
    campaign: platform ? { socialPlatform: platform as SocialPlatform } : undefined,
    submittedAt: date
      ? {
          gte: new Date(`${date}T00:00:00.000Z`),
          lte: new Date(`${date}T23:59:59.999Z`),
        }
      : undefined,
  };

  const [submissions, campaigns, users] = await Promise.all([
    db.taskSubmission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      include: {
        user: { select: { name: true, email: true, status: true, role: true } },
        campaign: { select: { title: true, socialPlatform: true } },
        task: { select: { title: true } },
      },
      take: 50,
    }),
    db.campaign.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
    db.user.findMany({ select: { id: true, name: true }, where: { role: "USER" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-extrabold text-[#34134f]">Tarefas e aprovações</h1>

      <form className="ok-card grid gap-2 p-4 md:grid-cols-6">
        <select name="status" defaultValue={status} className="ok-input">
          <option value="">Todos os status</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <select name="campaignId" defaultValue={campaignId} className="ok-input">
          <option value="">Todas as campanhas</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>{campaign.title}</option>
          ))}
        </select>
        <select name="userId" defaultValue={userId} className="ok-input">
          <option value="">Todos os usuários</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
        <select name="platform" defaultValue={platform} className="ok-input">
          <option value="">Todas as plataformas</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="TIKTOK">TikTok</option>
          <option value="FACEBOOK">Facebook</option>
          <option value="YOUTUBE">YouTube</option>
          <option value="GOOGLE">Google</option>
          <option value="LOCAL">Local</option>
          <option value="OTHER">Outra</option>
        </select>
        <input type="date" name="date" defaultValue={date} className="ok-input" />
        <button type="submit" className="ok-btn-primary">Filtrar</button>
      </form>

      <div className="space-y-3">
        {submissions.map((item) => (
          <div key={item.id} className="space-y-2">
            <SubmissionReviewCard
              id={item.id}
              userName={item.user.name}
              campaignTitle={item.campaign.title}
              taskTitle={item.task.title}
              rewardAmount={item.rewardAmount}
              proofText={item.proofText}
              proofImageUrl={item.proofImageUrl}
              status={item.status}
            />
            <div className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-xs text-[#7a5a99]">
              Enviado em {formatDate(item.submittedAt)} • Usuário: {item.user.email} • Plataforma: {item.campaign.socialPlatform}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
