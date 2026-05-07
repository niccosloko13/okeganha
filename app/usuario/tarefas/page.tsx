import Link from "next/link";

import { GamificationShell, MissionCard, StatsCard } from "@/components/gamification";
import { EmptyState } from "@/components/ui/EmptyState";
import { db } from "@/lib/db";
import { requireRegularUser } from "@/lib/auth";

const tabs = [
  { key: "PENDING", label: "Em analise" },
  { key: "APPROVED", label: "Aprovadas" },
  { key: "REJECTED", label: "Reprovadas" },
] as const;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TarefasPage({ searchParams }: PageProps) {
  const user = await requireRegularUser();
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "PENDING";

  const submissions = await db.taskSubmission.findMany({
    where: { userId: user.id, status: status === "APPROVED" || status === "REJECTED" ? status : "PENDING" },
    include: { campaign: { select: { title: true } }, task: { select: { title: true } } },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <GamificationShell title="Missoes" subtitle="Acompanhe status das suas missoes enviadas.">
      <section className="grid gap-3 md:grid-cols-3">
        <StatsCard label="Pendentes" value={String(submissions.filter((s) => s.status === "PENDING").length)} />
        <StatsCard label="Aprovadas" value={String(submissions.filter((s) => s.status === "APPROVED").length)} />
        <StatsCard label="Reprovadas" value={String(submissions.filter((s) => s.status === "REJECTED").length)} />
      </section>

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-[#6f45a3] bg-[#1a1030]/85 p-2">
        {tabs.map((tab) => (
          <Link key={tab.key} href={`/usuario/tarefas?status=${tab.key}`} className={`rounded-xl px-4 py-2 text-sm font-semibold ${status === tab.key ? "bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc] text-white" : "text-[#dbc6f5] hover:bg-white/10"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <section className="space-y-3">
        {submissions.length === 0 ? (
          <EmptyState title="Nenhuma missao aqui" description="Conclua novas missoes para ver seu historico." />
        ) : (
          submissions.map((submission) => (
            <MissionCard
              key={submission.id}
              title={`${submission.task.title} - ${submission.campaign.title}`}
              reward={`Recompensa: R$ ${(submission.rewardAmount / 100).toFixed(2)}`}
              href={`/usuario/tarefas/${submission.taskId}`}
              rarity={submission.status === "APPROVED" ? "EPIC" : submission.status === "PENDING" ? "RARE" : "COMMON"}
            />
          ))
        )}
      </section>
    </GamificationShell>
  );
}
