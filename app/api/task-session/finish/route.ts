import { NextResponse } from "next/server";

import { addRiskEvent, evaluateAndHandleUserRisk, logUserActivity, requireUserNotBlocked } from "@/lib/anti-fraud";
import { requireRegularUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { finishTaskSessionSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const user = await requireRegularUser();
  await requireUserNotBlocked(user.id);

  const payload = await request.json().catch(() => null);
  const parsed = finishTaskSessionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Dados inválidos." }, { status: 400 });
  }

  const session = await db.taskSession.findFirst({
    where: {
      id: parsed.data.sessionId, 
      userId: user.id, 
      isCompleted: false,
    },
    select: {
      id: true, 
      taskId: true,
      campaignId: true, 
      activeDuration: true,
      requiredDuration: true, 
      focusLossCount: true,
    },
  });

  if (!session) {
    return NextResponse.json({ ok: false, message: "Sessão não encontrada." }, { status: 404 });
  }

  if (session.activeDuration < session.requiredDuration) {
    await addRiskEvent(user.id, "HIGH", "Tentativa de finalizar tarefa antes do tempo mínimo.", {
      sessionId: session.id, 
      activeDuration: session.activeDuration, 
      requiredDuration: session.requiredDuration,
    });
    return NextResponse.json({ ok: false, message: "Tempo mínimo não atingido para finalizar a tarefa." }, { status: 400 });
  }

  const updated = await db.taskSession.update({
    where: { id: session.id },
    data: { isCompleted: true, lastHeartbeat: new Date() },
    select: { id: true, activeDuration: true, requiredDuration: true },
  });

  await logUserActivity(user.id, "OPEN_TASK", {
    sessionId: session.id, 
      taskId: session.taskId,
    campaignId: session.campaignId, 
      interactionType: "SESSION_FINISH",
    durationSeconds: updated.activeDuration, 
      focusLossCount: session.focusLossCount,
  });

  const risk = await evaluateAndHandleUserRisk(user.id);
  if (risk.level === "CRITICAL") {
    return NextResponse.json({ ok: false, blocked: true }, { status: 403 });
  }

  return NextResponse.json({ ok: true, session: updated });
}
