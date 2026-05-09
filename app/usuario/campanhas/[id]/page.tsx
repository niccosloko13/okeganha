import { redirect } from "next/navigation";

import { requireRegularUser } from "@/lib/auth";
import { db } from "@/lib/db";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CampanhaDetalhePage({ params }: PageProps) {
  const user = await requireRegularUser();
  const { id } = await params;

  const firstTask = await db.task.findFirst({
    where: {
      campaignId: id,
      status: "ACTIVE",
      campaign: {
        status: "ACTIVE",
        reviewStatus: "APPROVED",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });

  if (firstTask) {
    redirect(`/usuario/tarefas/${firstTask.id}`);
  }

  redirect(`/usuario/missoes`);
}
