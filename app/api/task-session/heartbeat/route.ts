import { NextResponse } from "next/server";

import { addRiskEvent, evaluateAndHandleUserRisk, logUserActivity, registerUserDevice, requireUserNotBlocked } from "@/lib/anti-fraud";
import { requireRegularUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { heartbeatTaskSessionSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const user = await requireRegularUser();
  await requireUserNotBlocked(user.id);

  const payload = await request.json().catch(() => null);
  const parsed = heartbeatTaskSessionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Heartbeat inválido." }, { status: 400 });
  }

  const session = await db.taskSession.findFirst({
    where: {
      id: parsed.data.sessionId, 
      userId: user.id, 
      isCompleted: false,
    },
    select: {
      id: true, 
      userId: true,
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

  let deviceId: string | null = null;
  if (parsed.data.deviceFingerprint) {
    const fp = parsed.data.deviceFingerprint;
    const device = await registerUserDevice(user.id, {
      timezone: fp.timezone ?? "",
      language: fp.language ?? "",
      platform: fp.platform ?? "",
      screen: fp.screen ?? "",
      colorDepth: fp.colorDepth ?? 0,
      hardwareConcurrency: fp.hardwareConcurrency ?? 0,
      maxTouchPoints: fp.maxTouchPoints ?? 0,
      pluginsLength: fp.pluginsLength ?? 0,
      canvasHash: fp.canvasHash ?? "",
      webglHash: fp.webglHash ?? "",
      webdriver: fp.webdriver ?? false,
      clickIntervalMs: fp.clickIntervalMs ?? 9999,
    });
    deviceId = device.id;
  }

  const addDuration = parsed.data.isVisible && parsed.data.isFocused ? 1 : 0;
  const nextFocusLossCount = session.focusLossCount + parsed.data.focusLossIncrement;
  const nextActiveDuration = session.activeDuration + addDuration;

  const updated = await db.taskSession.update({
    where: { id: session.id },
    data: {
      activeDuration: nextActiveDuration, 
      focusLossCount: nextFocusLossCount, 
      lastHeartbeat: new Date(),
    },
    select: {
      id: true, 
      activeDuration: true,
      requiredDuration: true, 
      focusLossCount: true,
    },
  });

  if (nextFocusLossCount >= 25) {
    await addRiskEvent(user.id, "HIGH", "Perda de foco excessiva durante sessão de tarefa.", {
      sessionId: session.id, 
      focusLossCount: nextFocusLossCount,
    });
    await logUserActivity(user.id, "SUSPICIOUS_ACTIVITY", {
      sessionId: session.id, 
      taskId: session.taskId,
      campaignId: session.campaignId, 
      interactionType: "FOCUS_LOSS_EXCESS",
      focusLossCount: nextFocusLossCount,
      deviceId,
    });
  }

  await logUserActivity(user.id, "OPEN_TASK", {
    sessionId: session.id, 
      taskId: session.taskId,
    campaignId: session.campaignId, 
      interactionType: "HEARTBEAT",
    durationSeconds: updated.activeDuration, 
      focusLossCount: updated.focusLossCount,
    deviceId,
  });

  const risk = await evaluateAndHandleUserRisk(user.id);
  if (risk.level === "CRITICAL") {
    return NextResponse.json({ ok: false, blocked: true }, { status: 403 });
  }

  return NextResponse.json({ ok: true, session: updated, canFinish: updated.activeDuration >= updated.requiredDuration });
}
