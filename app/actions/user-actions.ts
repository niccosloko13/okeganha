"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { addRiskEvent, calculateUserRisk, evaluateAndHandleUserRisk, logUserActivity, requireUserNotBlocked, runWithdrawalRiskCheck } from "@/lib/anti-fraud";
import { ensureActiveUser, requireRegularUser } from "@/lib/auth";
import {
  canRequestWithdrawalToday,
  hasReachedCampaignDailyLimit,
  hasTaskSubmissionToday,
} from "@/lib/campaign-rules";
import { db } from "@/lib/db";
import { walletSignedAmount } from "@/lib/money";
import { completeOnboardingSchema, profileSchema, taskProofSchema, userSocialAccountSchema, withdrawalSchema } from "@/lib/validations";
import type { ActionState } from "@/types";

const MIN_WITHDRAWAL_CENTS = 2000;

export async function submitTaskProofAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRegularUser();
  await requireUserNotBlocked(user.id);
  ensureActiveUser(user.status);

  const parsed = taskProofSchema.safeParse({
    taskId: formData.get("taskId"), proofText: formData.get("proofText"), proofImageUrl: formData.get("proofImageUrl"),
  });

  if (!parsed.success) {
    return {
      ok: false, message: "Dados da comprovação inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const task = await db.task.findFirst({
    where: {
      id: parsed.data.taskId, status: "ACTIVE",
      campaign: {
        status: "ACTIVE", reviewStatus: "APPROVED",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    },
    include: { campaign: true },
  });

  if (!task) {
    return { ok: false, message: "Tarefa indisponível." };
  }

  const sentToday = await hasTaskSubmissionToday(user.id, task.id);
  if (sentToday) {
    return { ok: false, message: "Você já enviou esta tarefa hoje." };
  }

  const reachedLimit = await hasReachedCampaignDailyLimit(user.id, task.campaignId, task.campaign.dailyLimitPerUser);
  if (reachedLimit) {
    return { ok: false, message: "Você atingiu o limite diário desta campanha." };
  }

  const requiredExternalContent = task.externalUrl || task.campaign.contentUrl;
  if (requiredExternalContent) {
    const completedSession = await db.taskSession.findFirst({
      where: {
        userId: user.id, taskId: task.id, isCompleted: true,
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, activeDuration: true, requiredDuration: true, focusLossCount: true },
    });

    if (!completedSession) {
      await logUserActivity(user.id, "SUSPICIOUS_ACTIVITY", {
        reason: "PROOF_WITHOUT_COMPLETED_TASK_SESSION", taskId: task.id,
      });
      await addRiskEvent(user.id, "HIGH", "Envio sem sessão de tarefa concluída.", { taskId: task.id });
      return {
        ok: false, message: "Comprovação inválida: finalize a sessão da tarefa antes do envio.",
      };
    }

    if (completedSession.focusLossCount >= 20) {
      await addRiskEvent(user.id, "HIGH", "Sessão com perda de foco excessiva.", {
        taskId: task.id, focusLossCount: completedSession.focusLossCount,
      });
    }

    const openedContent = await db.userActivityLog.findFirst({
      where: {
        userId: user.id, type: "OPEN_EXTERNAL_CONTENT",
        metadata: {
          path: ["taskId"], equals: task.id,
        },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true },
    });

    if (!openedContent) {
      await logUserActivity(user.id, "SUSPICIOUS_ACTIVITY", { reason: "PROOF_WITHOUT_OPEN_EXTERNAL_CONTENT", taskId: task.id });
      await addRiskEvent(user.id, "HIGH", "Envio de comprovação sem abrir conteúdo externo.", { taskId: task.id });
      return {
        ok: false, message: "Comprovação inválida: abra o conteúdo da campanha antes de enviar.",
      };
    }

    const minSecondsBetweenOpenAndProof = 5;
    const elapsedSeconds = Math.floor((Date.now() - openedContent.createdAt.getTime()) / 1000);
    if (elapsedSeconds < minSecondsBetweenOpenAndProof) {
      await logUserActivity(user.id, "SUSPICIOUS_ACTIVITY", {
        reason: "PROOF_TOO_FAST_AFTER_OPEN_CONTENT", taskId: task.id,
        elapsedSeconds,
      });
      await addRiskEvent(user.id, "HIGH", "Envio muito rápido após abrir conteúdo.", {
        taskId: task.id,
        elapsedSeconds,
      });
      return {
        ok: false, message: "Comprovação inválida: aguarde alguns segundos após abrir o conteúdo.",
      };
    }
  }

  await db.taskSubmission.create({
    data: {
      userId: user.id, taskId: task.id,
      campaignId: task.campaignId, proofText: parsed.data.proofText,
      proofImageUrl: parsed.data.proofImageUrl || "", rewardAmount: task.reward, status: "PENDING", rejectionReason: "", reviewedAt: new Date(0),
    },
  });
  await logUserActivity(user.id, "SUBMIT_PROOF", { taskId: task.id, campaignId: task.campaignId });
  const risk = await evaluateAndHandleUserRisk(user.id);
  if (risk.level === "CRITICAL") {
    return { ok: false, message: "Sua conta foi bloqueada por atividade suspeita. Entre em contato com o suporte para revisão." };
  }

  revalidatePath("/usuario/tarefas");
  revalidatePath("/usuario/dashboard");

  return { ok: true, message: "Comprovação enviada para análise." };
}

export async function requestWithdrawalAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRegularUser();
  await requireUserNotBlocked(user.id);
  ensureActiveUser(user.status);

  if (!user.onboardingCompleted) {
    return { ok: false, message: "Complete seu cadastro antes de solicitar saque." };
  }

  if (!user.cpf || !user.pixKey || !user.bankName) { return { ok: false, message: "Complete CPF, chave Pix e banco antes de solicitar saque." };
  }

  if (user.identityVerificationStatus !== "VERIFIED") {
    return { ok: false, message: "Verifique sua identidade antes de solicitar saque." };
  }

  const parsed = withdrawalSchema.safeParse({
    amount: formData.get("amount"), pixKey: formData.get("pixKey"),
  });

  if (!parsed.success) {
    return {
      ok: false, message: "Pedido de saque inválido.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!canRequestWithdrawalToday()) {
    return { ok: false, message: "Saque liberado apenas às sextas-feiras." };
  }

  const riskBeforeWithdrawal = await calculateUserRisk(user.id);
  if (riskBeforeWithdrawal.level === "CRITICAL") {
    await evaluateAndHandleUserRisk(user.id);
    return { ok: false, message: "Sua conta foi bloqueada por atividade suspeita. Entre em contato com o suporte para revisão." };
  }
  if (riskBeforeWithdrawal.level === "HIGH") {
    await addRiskEvent(user.id, "HIGH", "Tentativa de saque bloqueada por risco alto.", {
      reasons: riskBeforeWithdrawal.reasons,
    });
    return { ok: false, message: "Saque temporariamente bloqueado por análise de segurança." };
  }

  const withdrawalRisk = await runWithdrawalRiskCheck(user.id, "");
  if (withdrawalRisk.decision === "BLOCK") {
    return { ok: false, message: "Saque bloqueado por política de segurança. Entre em contato com o suporte." };
  }
  if (withdrawalRisk.decision === "REVIEW") {
    return { ok: false, message: "Saque em revisão preventiva de segurança. Tente novamente mais tarde." };
  }

  const amountCents = Math.round(parsed.data.amount * 100);

  if (amountCents < MIN_WITHDRAWAL_CENTS) {
    return { ok: false, message: "Valor mínimo de saque é R$ 20,00." };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      });

      const pendingRequest = await tx.withdrawalRequest.findFirst({
        where: {
          userId: user.id, status: { in: ["PENDING", "APPROVED"] },
        },
        select: { id: true },
      });

      if (pendingRequest) {
        throw new Error("WITHDRAWAL_ALREADY_PENDING");
      }

      const txs = await tx.walletTransaction.findMany({
        where: { userId: user.id },
        select: { amount: true, type: true },
      });
      const available = txs.reduce((acc, item) => acc + walletSignedAmount(item.type, item.amount), 0);
      if (available < amountCents) {
        throw new Error("WITHDRAWAL_INSUFFICIENT_BALANCE");
      }

      const request = await tx.withdrawalRequest.create({
        data: {
          userId: user.id, amount: amountCents,
          pixKey: parsed.data.pixKey, status: "PENDING",
        },
      });

      await tx.walletTransaction.create({
        data: {
          userId: user.id, type: "WITHDRAWAL_HOLD",
          amount: amountCents, description: "Saque solicitado - aguardando pagamento manual",
          referenceId: request.id,
        },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "WITHDRAWAL_ALREADY_PENDING") {
      return { ok: false, message: "Você já possui um saque em análise. Aguarde a conclusão para solicitar novamente." };
    }
    if (error instanceof Error && error.message === "WITHDRAWAL_INSUFFICIENT_BALANCE") {
      return { ok: false, message: "Saldo insuficiente para saque." };
    }
    throw error;
  }
  await logUserActivity(user.id, "REQUEST_WITHDRAWAL", { amount: amountCents });
  const risk = await evaluateAndHandleUserRisk(user.id);
  if (risk.level === "CRITICAL") {
    return { ok: false, message: "Sua conta foi bloqueada por atividade suspeita. Entre em contato com o suporte para revisão." };
  }

  revalidatePath("/usuario/saques");
  revalidatePath("/usuario/carteira");
  revalidatePath("/usuario/dashboard");

  return { ok: true, message: "Saque solicitado com sucesso." };
}

export async function updateProfileAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRegularUser();
  await requireUserNotBlocked(user.id);

  const parsed = profileSchema.safeParse({
    phone: formData.get("phone"), pixKey: formData.get("pixKey"),
  });

  if (!parsed.success) {
    return {
      ok: false, message: "Dados do perfil inválidos.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      phone: parsed.data.phone, pixKey: parsed.data.pixKey,
    },
  });
  await logUserActivity(user.id, "PROFILE_UPDATE");
  await evaluateAndHandleUserRisk(user.id);

  revalidatePath("/usuario/perfil");
  revalidatePath("/usuario/saques");

  return { ok: true, message: "Perfil atualizado com sucesso." };
}

export async function redirectToTaskAction(formData: FormData) {
  const taskId = formData.get("taskId");
  if (typeof taskId !== "string" || taskId.length === 0) return;
  const user = await requireRegularUser();
  await requireUserNotBlocked(user.id);
  await logUserActivity(user.id, "OPEN_TASK", { taskId });
  redirect(`/usuario/tarefas/${taskId}`);
}

export async function openExternalContentAction(formData: FormData): Promise<void> {
  const user = await requireRegularUser();
  await requireUserNotBlocked(user.id);
  const url = formData.get("url");
  const taskId = formData.get("taskId");
  const campaignId = formData.get("campaignId");

  if (typeof url !== "string" || url.length === 0) return;

  await logUserActivity(user.id, "OPEN_EXTERNAL_CONTENT", {
    url,
    taskId: typeof taskId === "string" ? taskId : undefined,
    campaignId: typeof campaignId === "string" ? campaignId : undefined,
  });

  redirect(url);
}

export async function completeOnboardingAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRegularUser();
  await requireUserNotBlocked(user.id);
  ensureActiveUser(user.status);

  const parsed = completeOnboardingSchema.safeParse({
    phone: formData.get("phone"), cpf: formData.get("cpf"), pixType: formData.get("pixType"), pixKey: formData.get("pixKey"), bankName: formData.get("bankName"),
  });

  if (!parsed.success) {
    return {
      ok: false, message: "Confira os dados para concluir seu cadastro.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const cpfOwner = await db.user.findFirst({
    where: {
      cpf: parsed.data.cpf, id: { not: user.id },
    },
    select: { id: true },
  });

  if (cpfOwner) {
    return { ok: false, message: "Este CPF já está vinculado a outra conta." };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      phone: parsed.data.phone, cpf: parsed.data.cpf,
      pixType: "CPF", pixKey: parsed.data.pixKey,
      bankName: parsed.data.bankName, onboardingCompleted: true,
    },
  });
  await logUserActivity(user.id, "PROFILE_UPDATE", { onboardingCompleted: true });

  revalidatePath("/usuario/dashboard");
  revalidatePath("/usuario/perfil");
  revalidatePath("/usuario/saques");
  redirect("/usuario/dashboard");
}

export async function requestIdentityVerificationAction(_prevState: ActionState, _formData: FormData): Promise<ActionState> {
  const user = await requireRegularUser();
  await requireUserNotBlocked(user.id);
  ensureActiveUser(user.status);

  if (user.identityVerificationStatus === "VERIFIED") {
    return { ok: true, message: "Sua identidade já está verificada." };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      identityVerificationStatus: "PENDING",
    },
  });

  revalidatePath("/usuario/dashboard");
  revalidatePath("/usuario/saques");
  return { ok: true, message: "Verificação enviada. Status: pendente." };
}

export async function upsertUserSocialAccountAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRegularUser();
  await requireUserNotBlocked(user.id);
  ensureActiveUser(user.status);

  const parsed = userSocialAccountSchema.safeParse({
    platform: formData.get("platform"), profileUrl: formData.get("profileUrl"), username: formData.get("username"),
  });

  if (!parsed.success) {
    return {
      ok: false, message: "Dados inválidos para conectar rede social.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  await db.userSocialAccount.upsert({
    where: {
      userId_platform: {
        userId: user.id, platform: parsed.data.platform,
      },
    },
    update: {
      profileUrl: parsed.data.profileUrl, username: parsed.data.username || "", status: "CONNECTED", connectedAt: new Date(),
    },
    create: {
      userId: user.id, platform: parsed.data.platform,
      profileUrl: parsed.data.profileUrl, username: parsed.data.username || "", status: "CONNECTED", connectedAt: new Date(),
    },
  });
  await logUserActivity(user.id, "SOCIAL_ACCOUNT_UPDATE", { platform: parsed.data.platform });
  await evaluateAndHandleUserRisk(user.id);

  revalidatePath("/usuario/redes");
  revalidatePath("/usuario/dashboard");
  return { ok: true, message: "Rede social salva para validação manual." };
}
