import { NextResponse } from "next/server";

import { logUserActivity, requireUserNotBlocked } from "@/lib/anti-fraud";
import { requireRegularUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { applyMissionStartCost, getEnergyCostForMission, refillDailyEnergy } from "@/lib/gamification";
import { startTaskSessionSchema } from "@/lib/validations";
import { hasTaskSubmissionToday } from "@/lib/campaign-rules";

export async function POST(request: Request) {
  const user = await requireRegularUser();
  await requireUserNotBlocked(user.id);

  const payload = await request.json().catch(() => null);
  const parsed = startTaskSessionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Dados invalidos para iniciar sessao." }, { status: 400 });
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
      campaign: { select: { socialPlatform: true } },
    },
  });

  if (!task) {
    return NextResponse.json({ ok: false, message: "Tarefa indisponivel." }, { status: 404 });
  }

  const alreadySubmittedToday = await hasTaskSubmissionToday(user.id, task.id);
  if (alreadySubmittedToday) {
    return NextResponse.json({ ok: false, message: "Missao ja enviada hoje. Aguarde o proximo ciclo." }, { status: 409 });
  }

  const openSession = await db.taskSession.findFirst({
    where: {
      userId: user.id,
      taskId: task.id,
      isCompleted: false,
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, requiredDuration: true, activeDuration: true, focusLossCount: true },
  });

  if (openSession) {
    return NextResponse.json({ ok: true, session: openSession, resumed: true });
  }

  const userForEnergy = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true, level: true, isVerifiedProfile: true, lastEnergyRefill: true },
  });

  if (userForEnergy) {
    await refillDailyEnergy(userForEnergy);
  }

  const energyCost = getEnergyCostForMission(task.campaign.socialPlatform, "OTHER", task.requiredWatchSeconds);
  const costResult = await applyMissionStartCost(user.id, energyCost);
  if (!costResult.ok) {
    return NextResponse.json({ ok: false, message: "Energia insuficiente para iniciar esta missao." }, { status: 409 });
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
