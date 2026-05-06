import { NextResponse } from "next/server";

import { logUserActivity, requireUserNotBlocked } from "@/lib/anti-fraud";
import { requireRegularUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { startTaskSessionSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const user = await requireRegularUser();
  await requireUserNotBlocked(user.id);

  const payload = await request.json().catch(() => null);
  const parsed = startTaskSessionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Dados inválidos para iniciar sessão." }, { status: 400 });
  }

  const task = await db.task.findFirst({
    where: {
      id: parsed.data.taskId, 
      status: "ACTIVE",
      campaign: {
        status: "ACTIVE", 
      reviewStatus: "APPROVED",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    },
    select: {
      id: true, 
      campaignId: true, 
      requiredWatchSeconds: true,
    },
  });

  if (!task) {
    return NextResponse.json({ ok: false, message: "Tarefa indisponível." }, { status: 404 });
  }

  const requiredDuration = Math.max(5, task.requiredWatchSeconds ?? 10);
  const session = await db.taskSession.create({
    data: {
      userId: user.id, 
      taskId: task.id, 
      campaignId: task.campaignId,
      requiredDuration, 
      startedAt: new Date(), 
      lastHeartbeat: new Date(),
    },
    select: {
      id: true, 
      requiredDuration: true,
      activeDuration: true, 
      focusLossCount: true,
    },
  });

  await logUserActivity(user.id, "OPEN_EXTERNAL_CONTENT", {
    sessionId: session.id, 
      taskId: task.id,
    campaignId: task.campaignId, 
      interactionType: "SESSION_START",
  });

  return NextResponse.json({ ok: true, session });
}
