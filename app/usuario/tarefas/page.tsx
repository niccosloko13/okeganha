import Link from "next/link";

import { TaskCard } from "@/components/tarefas/TaskCard";
import { UserShell } from "@/components/layout/UserShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { db } from "@/lib/db";
import { requireRegularUser } from "@/lib/auth";

const tabs = [
  { key: "PENDING", label: "Pendentes" },
  { key: "APPROVED", label: "Aprovadas" },
  { key: "REJECTED", label: "Reprovadas" },
] as const;

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TarefasPage({ searchParams }: PageProps) {
  const user = await requireRegularUser();
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status  : "PENDING";

  const submissions = await db.taskSubmission.findMany({
    where: {
      userId: user.id, status: status === "APPROVED" || status === "REJECTED" ? status  : "PENDING",
    },
    include: {
      campaign: { select: { title: true } },
      task: { select: { title: true } },
    },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <UserShell title="Minhas tarefas" subtitle="Acompanhe envios e aprovações.">
      <div className="ok-card ok-fade-up flex gap-2 overflow-x-auto p-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/usuario/tarefasstatus=${tab.key}`}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${status === tab.key ? "bg-okBlue text-white" : "text-okBlueDark hover:bg-okBlueLight/50"}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <section className="space-y-2 ok-fade-up ok-fade-delay-1">
        {submissions.length === 0 ? (
          <EmptyState title="Nenhuma tarefa aqui" description="Envie novas tarefas para ver seu histórico." />
        ) : (
          submissions.map((submission) => (
            <TaskCard
              key={submission.id}
              campaign={submission.campaign.title}
              task={submission.task.title}
              value={submission.rewardAmount}
              status={submission.status}
              submittedAt={submission.submittedAt}
              rejectionReason={submission.rejectionReason}
            />
          ))
        )}
      </section>
    </UserShell>
  );
}

