import { Prisma } from "@prisma/client";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { createAdminAuditLog } from "@/lib/admin-audit";
import { detectBotSignals, type BotDetectionInput } from "@/lib/bot-detection";
import { db } from "@/lib/db";
import { hashDeviceFingerprint, type DeviceFingerprintInput } from "@/lib/device-fingerprint";
import { SESSION_COOKIE } from "@/lib/session";

export const BLOCKED_ACCOUNT_COOKIE = "okg_blocked_account";

type ActivityType =
  | "LOGIN"
  | "LOGOUT"
  | "VIEW_CAMPAIGN"
  | "OPEN_TASK"
  | "OPEN_EXTERNAL_CONTENT"
  | "SUBMIT_PROOF"
  | "REQUEST_WITHDRAWAL"
  | "PROFILE_UPDATE"
  | "SOCIAL_ACCOUNT_UPDATE"
  | "SUSPICIOUS_ACTIVITY"
  | "ACCOUNT_BLOCKED";

type RiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

type RiskResult = {
  level: RiskSeverity;
  reasons: string[];
};

export type UserRiskScoreResult = {
  score: number;
  level: RiskSeverity;
  reasons: string[];
};

function safeObject(metadata: Record<string, unknown>): Prisma.InputJsonValue | undefined {
  if (!metadata || Object.keys(metadata).length === 0) return undefined;
  return metadata as Prisma.InputJsonValue;
}

function levelFromScore(score: number): RiskSeverity {
  if (score >= 81) return "CRITICAL";
  if (score >= 61) return "HIGH";
  if (score >= 31) return "MEDIUM";
  return "LOW";
}

async function resolveRequestMeta() {
  try {
    const h = await headers();
    const fwd = h.get("x-forwarded-for") ?? "";
    const ipAddress = fwd.split(",")[0].trim() || h.get("x-real-ip") || undefined;
    const userAgent = h.get("user-agent") || undefined;
    return { ipAddress, userAgent };
  } catch {
    return { ipAddress: undefined, userAgent: undefined };
  }
}

export async function registerUserDevice(userId: string, input: DeviceFingerprintInput & { clickIntervalMs: number }) {
  const req = await resolveRequestMeta();
  const fingerprintHash = hashDeviceFingerprint(input);
  const botDetection = detectBotSignals({ ...input, userAgent: req.userAgent ?? "", clickIntervalMs: input.clickIntervalMs } as BotDetectionInput);

  const device = await db.userDevice.upsert({
    where: {
      userId_fingerprintHash: {
        userId,
        fingerprintHash,
      },
    },
    update: {
      lastSeen: new Date(),
      userAgent: req.userAgent ?? "",
      ipAddress: req.ipAddress ?? "",
      isSuspicious: botDetection.suspicious,
    },
    create: {
      userId,
      fingerprintHash,
      userAgent: req.userAgent ?? "",
      ipAddress: req.ipAddress ?? "",
      isSuspicious: botDetection.suspicious,
    },
  });

  const sameFingerprintAccounts = await db.userDevice.findMany({
    where: { fingerprintHash, userId: { not: userId } },
    select: { userId: true },
    take: 5,
  });

  if (sameFingerprintAccounts.length > 0) {
    await addRiskEvent(userId, "HIGH", "Fingerprint compartilhado entre múltiplas contas.", {
      linkedUsers: sameFingerprintAccounts.map((item) => item.userId),
    });
  }

  if (botDetection.suspicious) {
    await addRiskEvent(userId, "HIGH", "Sinais de automação detectados no dispositivo.", {
      botScore: botDetection.score,
      reasons: botDetection.reasons,
    });
    await logUserActivity(userId, "SUSPICIOUS_ACTIVITY", {
      reason: "BOT_DETECTION",
      botScore: botDetection.score,
      reasons: botDetection.reasons,
      deviceId: device.id,
    });
  }

  return device;
}

export async function logUserActivity(
  userId: string,
  type: ActivityType,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  if (!userId) return;
  try {
    const req = await resolveRequestMeta();
    const sessionIdRaw = typeof metadata.sessionId === "string" ? metadata.sessionId : null;
    const deviceIdRaw = typeof metadata.deviceId === "string" ? metadata.deviceId : null;
    const campaignIdRaw = typeof metadata.campaignId === "string" ? metadata.campaignId : null;
    const taskIdRaw = typeof metadata.taskId === "string" ? metadata.taskId : null;
    const interactionType = typeof metadata.interactionType === "string" ? metadata.interactionType : null;
    const durationSeconds = typeof metadata.durationSeconds === "number" ? metadata.durationSeconds : null;
    const focusLossCount = typeof metadata.focusLossCount === "number" ? metadata.focusLossCount : null;

    const [sessionId, deviceId, campaignId, taskId] = await Promise.all([
      sessionIdRaw
        ? db.taskSession.findUnique({ where: { id: sessionIdRaw }, select: { id: true } }).then((x) => x?.id ?? null)
        : db.taskSession.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true } }).then((x) => x?.id ?? null),
      deviceIdRaw
        ? db.userDevice.findUnique({ where: { id: deviceIdRaw }, select: { id: true } }).then((x) => x?.id ?? null)
        : db.userDevice.findFirst({ where: { userId }, orderBy: { lastSeen: "desc" }, select: { id: true } }).then((x) => x?.id ?? null),
      campaignIdRaw
        ? db.campaign.findUnique({ where: { id: campaignIdRaw }, select: { id: true } }).then((x) => x?.id ?? null)
        : db.campaign.findFirst({ orderBy: { createdAt: "desc" }, select: { id: true } }).then((x) => x?.id ?? null),
      taskIdRaw
        ? db.task.findUnique({ where: { id: taskIdRaw }, select: { id: true } }).then((x) => x?.id ?? null)
        : db.task.findFirst({ orderBy: { createdAt: "desc" }, select: { id: true } }).then((x) => x?.id ?? null),
    ]);

    // Fail-safe: antifraude nunca deve derrubar auth/onboarding.
    if (!sessionId || !deviceId || !campaignId || !taskId) {
      console.error("[anti-fraud] skip logUserActivity: unresolved FK", {
        userId,
        type,
        hasSession: Boolean(sessionId),
        hasDevice: Boolean(deviceId),
        hasCampaign: Boolean(campaignId),
        hasTask: Boolean(taskId),
      });
      return;
    }

    await db.userActivityLog.create({
      data: {
        userId,
        type,
        sessionId,
        deviceId,
        campaignId,
        taskId,
        interactionType: interactionType ?? "",
        durationSeconds: durationSeconds ?? 0,
        focusLossCount: focusLossCount ?? 0,
        ipAddress: req.ipAddress ?? "",
        userAgent: req.userAgent ?? "",
        metadata: safeObject(metadata) ?? Prisma.JsonNull,
      },
    });
  } catch (error) {
    console.error("[anti-fraud] logUserActivity failed (non-blocking)", { userId, type, error });
  }
}

export async function addRiskEvent(
  userId: string,
  severity: RiskSeverity,
  reason: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  await db.userRiskEvent.create({
    data: {
      userId,
      severity,
      reason,
      metadata: safeObject(metadata) ?? Prisma.JsonNull,
    },
  });
}

export async function calculateUserRiskScore(userId: string): Promise<UserRiskScoreResult> {
  const now = new Date();
  const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    fastProofs,
    fastWithdrawals,
    suspiciousLogs,
    rejectedSubmissions,
    repeatedProofTexts,
    recentProofs,
    recentDevices,
    sharedFingerprints,
    focusHeavySessions,
    profileUpdates,
    user,
  ] = await Promise.all([
    db.userActivityLog.count({ where: { userId, type: "SUBMIT_PROOF", createdAt: { gte: twoMinutesAgo } } }),
    db.userActivityLog.count({ where: { userId, type: "REQUEST_WITHDRAWAL", createdAt: { gte: tenMinutesAgo } } }),
    db.userActivityLog.count({ where: { userId, type: "SUSPICIOUS_ACTIVITY", createdAt: { gte: tenMinutesAgo } } }),
    db.taskSubmission.count({ where: { userId, status: "REJECTED", submittedAt: { gte: sevenDaysAgo } } }),
    db.taskSubmission.groupBy({ by: ["proofText"], where: { userId, submittedAt: { gte: sevenDaysAgo } }, _count: { _all: true } }),
    db.taskSubmission.findMany({ where: { userId, submittedAt: { gte: sevenDaysAgo } }, select: { proofText: true } }),
    db.userDevice.findMany({ where: { userId, lastSeen: { gte: sevenDaysAgo } }, select: { fingerprintHash: true, isSuspicious: true } }),
    db.userDevice.count({ where: { userId: { not: userId }, fingerprintHash: { in: (await db.userDevice.findMany({ where: { userId }, select: { fingerprintHash: true } })).map((d) => d.fingerprintHash) } } }),
    db.taskSession.count({ where: { userId, focusLossCount: { gt: 10 }, createdAt: { gte: sevenDaysAgo } } }),
    db.userActivityLog.count({ where: { userId, type: "PROFILE_UPDATE", createdAt: { gte: sevenDaysAgo } } }),
    db.user.findUnique({ where: { id: userId }, select: { createdAt: true } }),
  ]);

  let score = 0;
  const reasons: string[] = [];

  if (fastProofs > 5) {
    score += 45;
    reasons.push("Mais de 5 envios de comprovação em menos de 2 minutos");
  }

  if (fastWithdrawals > 3) {
    score += 35;
    reasons.push("Mais de 3 solicitações de saque em menos de 10 minutos");
  }

  if (suspiciousLogs >= 3) {
    score += 30;
    reasons.push("Tentativas repetidas de acesso indevido");
  }

  if (rejectedSubmissions >= 5) {
    score += 20;
    reasons.push("Muitas reprovações recentes");
  }

  const repeatedText = repeatedProofTexts.some((item) => item.proofText.trim().length > 12 && item._count._all >= 3);
  if (repeatedText) {
    score += 20;
    reasons.push("Padrão repetido de texto na comprovação");
  }

  const shortProofs = recentProofs.filter((item) => item.proofText.trim().length < 25).length;
  if (shortProofs >= 8) {
    score += 12;
    reasons.push("Comprovações muito curtas de forma recorrente");
  }

  const suspiciousDevices = recentDevices.filter((d) => d.isSuspicious).length;
  if (suspiciousDevices > 0) {
    score += 18;
    reasons.push("Dispositivo com sinal de automação");
  }

  if (recentDevices.length >= 4) {
    score += 15;
    reasons.push("Múltiplos dispositivos em curto período");
  }

  if (sharedFingerprints > 0) {
    score += 25;
    reasons.push("Fingerprint associado a outras contas");
  }

  if (focusHeavySessions >= 2) {
    score += 10;
    reasons.push("Perda de foco excessiva durante tarefas");
  }

  if (profileUpdates >= 4) {
    score += 8;
    reasons.push("Mudanças frequentes de perfil/Pix");
  }

  const isNewUser = Boolean(user && user.createdAt >= new Date(now.getTime() - 48 * 60 * 60 * 1000));
  if (isNewUser && fastWithdrawals > 0) {
    score += 15;
    reasons.push("Saque precoce em conta recente");
  }

  score = Math.max(0, Math.min(100, score));
  const level = levelFromScore(score);
  return { score, level, reasons };
}

export async function calculateUserRisk(userId: string): Promise<RiskResult> {
  const score = await calculateUserRiskScore(userId);
  return { level: score.level, reasons: score.reasons };
}

export async function blockUserForFraud(userId: string, reason: string): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { status: true } });
  if (!user || user.status === "BLOCKED") return;

  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { status: "BLOCKED" } });
    await tx.userRiskEvent.create({ data: { userId, severity: "CRITICAL", reason, metadata: Prisma.JsonNull } });
    try {
      const [session, device, campaign, task] = await Promise.all([
        tx.taskSession.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true } }),
        tx.userDevice.findFirst({ where: { userId }, orderBy: { lastSeen: "desc" }, select: { id: true } }),
        tx.campaign.findFirst({ orderBy: { createdAt: "desc" }, select: { id: true } }),
        tx.task.findFirst({ orderBy: { createdAt: "desc" }, select: { id: true } }),
      ]);

      if (session?.id && device?.id && campaign?.id && task?.id) {
        await tx.userActivityLog.create({
          data: {
            userId,
            type: "ACCOUNT_BLOCKED",
            sessionId: session.id,
            deviceId: device.id,
            campaignId: campaign.id,
            taskId: task.id,
            interactionType: "",
            durationSeconds: 0,
            focusLossCount: 0,
            ipAddress: "",
            userAgent: "",
            metadata: safeObject({ reason }) ?? Prisma.JsonNull,
          },
        });
      }
    } catch (error) {
      console.error("[anti-fraud] ACCOUNT_BLOCKED activity log failed (non-blocking)", { userId, error });
    }
  });

  const store = await cookies();
  store.delete(SESSION_COOKIE);
  store.set(BLOCKED_ACCOUNT_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await Promise.all(
    admins.map((admin) =>
      createAdminAuditLog({
        adminId: admin.id,
        targetType: "USER",
        targetId: userId,
        action: "USER_BLOCKED_BY_ANTI_FRAUD",
        description: "Bloqueio automático por atividade suspeita crítica.",
        metadata: { reason },
      }),
    ),
  );
}

export async function requireUserNotBlocked(userId: string): Promise<void> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { status: true } });
  if (!user) return;

  if (user.status === "BLOCKED") {
    const store = await cookies();
    store.delete(SESSION_COOKIE);
    store.set(BLOCKED_ACCOUNT_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    redirect("/conta/bloqueada");
  }
}

export async function evaluateAndHandleUserRisk(userId: string): Promise<RiskResult> {
  const score = await calculateUserRiskScore(userId);

  if (score.level === "HIGH") {
    await addRiskEvent(userId, "HIGH", "Risco alto detectado por score dinâmico.", {
      score: score.score,
      reasons: score.reasons,
    });
  }

  if (score.score >= 85) {
    await blockUserForFraud(
      userId,
      "Sua conta foi bloqueada por atividade suspeita. Entre em contato com o suporte para revisão.",
    );
  }

  return { level: score.level, reasons: score.reasons };
}

export async function runWithdrawalRiskCheck(userId: string, withdrawalId: string) {
  const score = await calculateUserRiskScore(userId);
  const account = await db.user.findUnique({
    where: { id: userId },
    select: { createdAt: true, identityVerificationStatus: true },
  });

  let decision: "ALLOW" | "REVIEW" | "BLOCK" = "ALLOW";
  const reasons = [...score.reasons];

  if (!account || account.identityVerificationStatus !== "VERIFIED") {
    decision = "BLOCK";
    reasons.push("Identidade não verificada");
  }

  if (account && account.createdAt > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) {
    if (decision === "ALLOW") decision = "REVIEW";
    reasons.push("Conta muito recente para saque");
  }

  if (score.level === "HIGH") {
    decision = "BLOCK";
    reasons.push("Score antifraude alto para saque");
  }

  await db.withdrawalRiskCheck.create({
    data: {
      userId,
      withdrawalId: withdrawalId ?? "",
      score: score.score,
      decision,
      reasons: safeObject({ reasons }) ?? Prisma.JsonNull,
    },
  });

  return { decision, score: score.score, reasons };
}

// Limitação importante: a plataforma não confirma automaticamente ações externas
// (curtida/comentário/seguimento) sem API oficial da rede social.
// Nesta fase, a validação usa logs internos + comprovação enviada + revisão do admin.
