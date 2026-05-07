"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { startCompanyImpersonation, stopImpersonation } from "@/lib/admin-impersonation";
import { ensureActiveUser, ensureAdminRole, hashPassword, requireUser } from "@/lib/auth";
import { generateCompanyPublicId } from "@/lib/company-id";
import { getPlanLimits, spendCompanyTokens, tokenCostRules } from "@/lib/company-tokens";
import { estimateCampaignTokens } from "@/lib/campaign-token-estimator";
import { createAdminAuditLog } from "@/lib/admin-audit";
import { db } from "@/lib/db";
import { applyMissionApprovalReward, getXpRewardForMission } from "@/lib/gamification";
import type { ActionState } from "@/types";

const campaignSchema = z.object({
  id: z.string().optional(), 
      companyId: z.string().min(1, "Selecione a empresa."), 
      companySocialPostId: z.string().optional(), 
      title: z.string().min(3), 
      description: z.string().min(10), 
      city: z.string().min(2), 
      neighborhood: z.string().min(2), 
      category: z.string().min(2), 
      socialPlatform: z.enum(["INSTAGRAM", "TIKTOK", "FACEBOOK", "YOUTUBE", "GOOGLE", "LOCAL", "OTHER"]), 
      contentUrl: z.string().url().optional().or(z.literal("")), 
      objective: z.enum(["WATCH_VIDEO", "VIEW_STORY", "LIKE_POST", "COMMENT_POST", "FOLLOW_PROFILE", "REVIEW_BUSINESS", "CHECKIN_BUSINESS", "VISIT_LOCAL", "OTHER"]), 
      goalQuantity: z.coerce.number().int().positive(), 
      rewardPerTask: z.coerce.number().int().positive(), 
      dailyLimitPerUser: z.coerce.number().int().positive(), 
      totalBudget: z.coerce.number().int().positive(), 
      startDate: z.string().min(4), 
      endDate: z.string().min(4), 
      status: z.enum(["ACTIVE", "PAUSED"]),
});

const reviewSubmissionSchema = z.object({
  submissionId: z.string().min(1),
});

const rejectSubmissionSchema = z.object({
  submissionId: z.string().min(1), 
      rejectionReason: z.string().trim().min(8, "Informe um motivo com mais detalhes."),
});

const withdrawalActionSchema = z.object({
  requestId: z.string().min(1),
});

const rejectWithdrawalSchema = z.object({
  requestId: z.string().min(1), 
      rejectionReason: z.string().trim().min(8, "Informe um motivo com mais detalhes."),
});

const updateRoleSchema = z.object({
  userId: z.string().min(1), 
      role: z.enum(["USER", "ADMIN", "COMPANY"]),
});

const toggleCampaignStatusSchema = z.object({
  campaignId: z.string().min(1), 
      status: z.enum(["ACTIVE", "PAUSED", "FINISHED"]),
});

const campaignOperationalSchema = z.object({
  campaignId: z.string().min(1), 
      rewardPerTask: z.coerce.number().int().positive(), 
      dailyLimitPerUser: z.coerce.number().int().positive(), 
      totalBudget: z.coerce.number().int().positive(), 
      maxApprovedActions: z.coerce.number().int().positive(), 
      startDate: z.string().min(4), 
      endDate: z.string().min(4), 
      status: z.enum(["ACTIVE", "PAUSED", "FINISHED"]), 
      priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"), 
      internalNotes: z.string().trim().optional(), 
      userInstructions: z.string().trim().min(10),
});

const campaignReviewActionSchema = z.object({
  campaignId: z.string().min(1),
});

const rejectCampaignReviewSchema = z.object({
  campaignId: z.string().min(1), 
      rejectionReason: z.string().trim().min(8, "Informe um motivo com mais detalhes."),
});

const adjustCompanyTokensSchema = z.object({
  companyId: z.string().min(1), 
      amount: z.coerce.number().int().min(-100000).max(100000).refine((value) => value !== 0, "Informe um valor diferente de zero."), 
      description: z.string().trim().min(4, "DescriA§A£o obrigatA³ria."),
});

const updateCompanyPlanSchema = z.object({
  companyId: z.string().min(1), 
      plan: z.enum(["FREE", "BASIC", "PREMIUM", "ENTERPRISE"]), 
      planStatus: z.enum(["ACTIVE", "PAST_DUE", "CANCELED", "TRIAL"]),
});

const companySchema = z.object({
  tradeName: z.string().trim().min(2), 
      legalName: z.string().trim().optional(), 
      cnpj: z.string().trim().min(14), 
      responsibleName: z.string().trim().min(2), 
      responsibleWhatsapp: z.string().trim().min(11), 
      email: z.string().email().toLowerCase(), 
      phone: z.string().trim().optional(), 
      city: z.string().trim().min(2), 
      neighborhood: z.string().trim().optional(), 
      category: z.string().trim().optional(), 
      instagramUrl: z.string().url().optional().or(z.literal("")), 
      facebookUrl: z.string().url().optional().or(z.literal("")), 
      tiktokUrl: z.string().url().optional().or(z.literal("")), 
      googleBusinessUrl: z.string().url().optional().or(z.literal("")), 
      websiteUrl: z.string().url().optional().or(z.literal("")), 
      plan: z.enum(["FREE", "BASIC", "PREMIUM", "ENTERPRISE"]), 
      tokensBalance: z.coerce.number().int().min(0), 
      status: z.enum(["PENDING", "ACTIVE"]),
});

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

const companyStatusSchema = z.object({
  companyId: z.string().min(1), 
      status: z.enum(["ACTIVE", "REJECTED", "BLOCKED"]), 
      rejectionReason: z.string().trim().optional(),
});

const companyActionSchema = z.object({
  companyId: z.string().min(1, "Empresa invA¡lida."),
});

const rejectCompanySchema = companyActionSchema.extend({
  rejectionReason: z.string().trim().min(6, "Informe um motivo com pelo menos 6 caracteres."),
});

const companyUpdateSchema = z.object({
  companyId: z.string().min(1), 
      tradeName: z.string().trim().min(2).optional(), 
      legalName: z.string().trim().optional(), 
      responsibleName: z.string().trim().min(2).optional(), 
      responsibleWhatsapp: z.string().trim().optional(), 
      phone: z.string().trim().optional(), 
      city: z.string().trim().min(2).optional(), 
      neighborhood: z.string().trim().optional(), 
      category: z.string().trim().optional(), 
      instagramUrl: z.string().url().optional().or(z.literal("")), 
      facebookUrl: z.string().url().optional().or(z.literal("")), 
      tiktokUrl: z.string().url().optional().or(z.literal("")), 
      googleBusinessUrl: z.string().url().optional().or(z.literal("")), 
      websiteUrl: z.string().url().optional().or(z.literal("")),
});

const companyPostSchema = z.object({
  companyId: z.string().min(1), 
      platform: z.enum(["INSTAGRAM", "FACEBOOK", "TIKTOK", "YOUTUBE", "GOOGLE", "OTHER"]), 
      url: z.string().url(), 
      title: z.string().trim().optional(), 
      description: z.string().trim().optional(), 
      thumbnailUrl: z.string().url().optional().or(z.literal("")), 
      durationSeconds: z.coerce.number().int().min(0).optional(), 
      source: z.enum(["MANUAL", "PUBLIC_LINK", "API_FUTURE"]).default("MANUAL"),
});

const importPostsSchema = z.object({
  companyId: z.string().min(1), 
      platform: z.enum(["INSTAGRAM", "FACEBOOK", "TIKTOK", "YOUTUBE", "GOOGLE", "OTHER"]),
});

const impersonationSchema = z.object({
  companyId: z.string().min(1),
});

function objectiveToTaskTemplate(objective: z.infer<typeof campaignSchema>["objective"]) {
  switch (objective) {
    case "WATCH_VIDEO":
    case "VIEW_STORY":
      return {
        title: "Assistir conteAºdo oficial", 
      description: "Assista ao conteAºdo da campanha e envie prova da visualizaA§A£o.",
        instructions: "1. Abra o conteAºdo oficial.\n2. Assista o vA­deo atA© o final.\n3. Envie uma comprovaA§A£o real.", 
      type: "CONTENT" as const,
        proofType: "LINK" as const, 
      requiredWatchSeconds: 30,
      };
    case "FOLLOW_PROFILE":
      return {
        title: "Seguir perfil da campanha", 
      description: "Siga o perfil indicado e comprove a aA§A£o.",
        instructions: "1. Abra o perfil oficial.\n2. Siga o perfil.\n3. Envie print ou link da comprovaA§A£o.", 
      type: "SHARE" as const,
        proofType: "TEXT_AND_IMAGE" as const, 
      requiredWatchSeconds: null,
      };
    case "REVIEW_BUSINESS":
      return {
        title: "Avaliar estabelecimento", 
      description: "Envie avaliaA§A£o legA­tima e comprove o envio.",
        instructions: "1. Acesse o local indicado.\n2. FaA§a avaliaA§A£o real.\n3. Envie link ou print da prova.", 
      type: "REVIEW" as const,
        proofType: "LINK" as const, 
      requiredWatchSeconds: null,
      };
    case "CHECKIN_BUSINESS":
    case "VISIT_LOCAL":
      return {
        title: "Realizar check-in", 
      description: "FaA§a check-in no local da campanha e envie comprovaA§A£o.",
        instructions: "1. VA¡ ao local indicado.\n2. Realize o check-in.\n3. Envie prova clara da execuA§A£o.", 
      type: "CHECKIN" as const,
        proofType: "TEXT_AND_IMAGE" as const, 
      requiredWatchSeconds: null,
      };
    case "LIKE_POST":
    case "COMMENT_POST":
    case "OTHER":
    default:
      return {
        title: "Executar aA§A£o da campanha", 
      description: "Conclua a aA§A£o solicitada e envie comprovaA§A£o real.",
        instructions: "1. Abra o conteAºdo ou local da campanha.\n2. Execute a aA§A£o solicitada.\n3. Envie comprovaA§A£o vA¡lida.", 
      type: "OTHER" as const,
        proofType: "TEXT_AND_IMAGE" as const, 
      requiredWatchSeconds: null,
      };
  }
}

export async function requireAdmin() {
  const user = await requireUser();
  ensureActiveUser(user.status);
  ensureAdminRole(user.role);
  return user;
}

export async function createCampaign(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = campaignSchema.safeParse({
    companyId: formData.get("companyId"), 
      companySocialPostId: formData.get("companySocialPostId"), 
      title: formData.get("title"), 
      description: formData.get("description"), 
      city: formData.get("city"), 
      neighborhood: formData.get("neighborhood"), 
      category: formData.get("category"), 
      socialPlatform: formData.get("socialPlatform"), 
      contentUrl: formData.get("contentUrl"), 
      objective: formData.get("objective"), 
      goalQuantity: formData.get("goalQuantity"), 
      rewardPerTask: formData.get("rewardPerTask"), 
      dailyLimitPerUser: formData.get("dailyLimitPerUser"), 
      totalBudget: formData.get("totalBudget"), 
      startDate: formData.get("startDate"), 
      endDate: formData.get("endDate"), 
      status: formData.get("status"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Confira os dados da campanha.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const template = objectiveToTaskTemplate(data.objective);
  const company = await db.company.findUnique({ where: { id: data.companyId } });
  if (!company) {
    return { ok: false, message: "Empresa nao encontrada.", fieldErrors: {} };
  }

  let selectedPostUrl = data.contentUrl || null;
  let selectedPostTitle = data.title;
  if (data.companySocialPostId) {
    const selectedPost = await db.companySocialPost.findFirst({
      where: { id: data.companySocialPostId, companyId: company.id, status: "ACTIVE" },
    });
    if (selectedPost) {
      selectedPostUrl = selectedPost.url;
      if (!data.title || data.title.trim().length < 3) {
        selectedPostTitle = selectedPost.title ?? data.title;
      }
    }
  }

  const estimatedTokens = estimateCampaignTokens({ objective: data.objective, quantity: data.goalQuantity });
  const reviewStatus = data.status === "ACTIVE" ? "APPROVED" : "DRAFT";

  await db.campaign.create({
    data: {
      title: selectedPostTitle, 
      description: data.description,
      companyId: company.id, 
      companyName: company.tradeName,
      city: data.city, 
      neighborhood: data.neighborhood,
      category: data.category, 
      socialPlatform: data.socialPlatform,
      contentUrl: selectedPostUrl ?? data.contentUrl ?? "",
      objective: data.objective,
      rewardPerTask: data.rewardPerTask, 
      dailyLimitPerUser: data.dailyLimitPerUser,
      totalBudget: data.totalBudget, 
      startDate: new Date(data.startDate), 
      endDate: new Date(data.endDate), 
      status: data.status,
      reviewStatus, 
      submittedForReviewAt: reviewStatus === "APPROVED" ? new Date() : new Date(0),
      reviewedAt: reviewStatus === "APPROVED" ? new Date() : new Date(0),
      tasks: {
        create: {
          title: template.title, 
      description: template.description,
          instructions: template.instructions, 
      reward: data.rewardPerTask,
          type: template.type, 
      externalUrl: selectedPostUrl ?? data.contentUrl ?? "",
          proofType: template.proofType, 
      requiredWatchSeconds: template.requiredWatchSeconds ?? undefined,
          status: data.status === "ACTIVE" ? "ACTIVE" : "PAUSED",
        },
      } as any,
    },
  });

  revalidatePath("/admin/campanhas");
  revalidatePath("/admin/dashboard");
  revalidatePath("/usuario/campanhas");

  return { ok: true, message: `Campanha criada com sucesso. Estimativa de consumo: ${estimatedTokens} tokens.` };
}

export async function updateCampaign(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = campaignSchema.extend({ id: z.string().min(1) }).safeParse({
    id: formData.get("id"), 
      companyId: formData.get("companyId"), 
      companySocialPostId: formData.get("companySocialPostId"), 
      title: formData.get("title"), 
      description: formData.get("description"), 
      city: formData.get("city"), 
      neighborhood: formData.get("neighborhood"), 
      category: formData.get("category"), 
      socialPlatform: formData.get("socialPlatform"), 
      contentUrl: formData.get("contentUrl"), 
      objective: formData.get("objective"), 
      goalQuantity: formData.get("goalQuantity"), 
      rewardPerTask: formData.get("rewardPerTask"), 
      dailyLimitPerUser: formData.get("dailyLimitPerUser"), 
      totalBudget: formData.get("totalBudget"), 
      startDate: formData.get("startDate"), 
      endDate: formData.get("endDate"), 
      status: formData.get("status"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Confira os dados da campanha.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const company = await db.company.findUnique({ where: { id: data.companyId } });
  if (!company) {
    return { ok: false, message: "Empresa nA£o encontrada." };
  }

  if (data.status === "ACTIVE") {
    const existing = await db.campaign.findUnique({
      where: { id: data.id },
      select: { reviewStatus: true },
    });
    if (!existing || existing.reviewStatus !== "APPROVED") { return { ok: false, message: "Campanha nA£o pode ser ativada sem aprovaA§A£o." };
    }
  }

  await db.campaign.update({
    where: { id: data.id },
    data: {
      title: data.title, 
      description: data.description,
      companyId: company.id, 
      companyName: company.tradeName,
      city: data.city, 
      neighborhood: data.neighborhood,
      category: data.category, 
      socialPlatform: data.socialPlatform,
      contentUrl: data.contentUrl || "", objective: data.objective,
      rewardPerTask: data.rewardPerTask, 
      dailyLimitPerUser: data.dailyLimitPerUser,
      totalBudget: data.totalBudget, 
      startDate: new Date(data.startDate), 
      endDate: new Date(data.endDate), 
      status: data.status,
    },
  });

  revalidatePath("/admin/campanhas");
  revalidatePath(`/admin/campanhas/${data.id}`);
  revalidatePath("/usuario/campanhas");

  return { ok: true, message: "Campanha atualizada com sucesso." };
}

function buildCampaignMetaText(input: {
  baseDescription: string;
  maxApprovedActions: number;
  priority: "LOW" | "MEDIUM" | "HIGH";
  internalNotes: string;
}) {
  const lines = [
    input.baseDescription.trim(),
    "",
    `Meta de aA§Aµes aprovadas: ${input.maxApprovedActions}`,
    `Prioridade: ${input.priority}`,
  ];
  if (input.internalNotes && input.internalNotes.trim().length > 0) {
    lines.push(`Notas internas: ${input.internalNotes.trim()}`);
  }
  return lines.join("\n");
}

function parseCampaignMeta(description: string) {
  const maxApprovedActions = description.match(/Meta de aA§Aµes aprovadas:\s*(\d+)/i)?.[1];
  const priority = description.match(/Prioridade:\s*(LOW|MEDIUM|HIGH)/i)?.[1] as "LOW" | "MEDIUM" | "HIGH" | undefined;
  const internalNotes = description.match(/Notas internas:\s*(.*)/i)?.[1];
  return {
    maxApprovedActions: maxApprovedActions ? Number(maxApprovedActions) : null,
    priority: priority ?? "MEDIUM", 
      internalNotes: internalNotes ?? "",
  };
}

export async function updateCampaignOperationalConfig(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();

  const parsed = campaignOperationalSchema.safeParse({
    campaignId: formData.get("campaignId"), 
      rewardPerTask: formData.get("rewardPerTask"), 
      dailyLimitPerUser: formData.get("dailyLimitPerUser"), 
      totalBudget: formData.get("totalBudget"), 
      maxApprovedActions: formData.get("maxApprovedActions"), 
      startDate: formData.get("startDate"), 
      endDate: formData.get("endDate"), 
      status: formData.get("status"), 
      priority: formData.get("priority"), 
      internalNotes: formData.get("internalNotes"), 
      userInstructions: formData.get("userInstructions"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Dados operacionais invA¡lidos.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;
  const campaign = await db.campaign.findUnique({
    where: { id: data.campaignId },
    include: { tasks: { orderBy: { createdAt: "asc" }, take: 1 } },
  });

  if (!campaign) {
    return { ok: false, message: "Campanha nA£o encontrada." };
  }

  if (data.status === "ACTIVE" && campaign.reviewStatus !== "APPROVED") {
    return { ok: false, message: "Campanha nA£o pode ser ativada sem aprovaA§A£o." };
  }

  const mergedDescription = buildCampaignMetaText({
    baseDescription: campaign.description, 
      maxApprovedActions: data.maxApprovedActions,
    priority: data.priority, 
      internalNotes: data.internalNotes ?? "",
  });

  await db.$transaction(async (tx) => {
    await tx.campaign.update({
      where: { id: campaign.id },
      data: {
        rewardPerTask: data.rewardPerTask, 
      dailyLimitPerUser: data.dailyLimitPerUser,
        totalBudget: data.totalBudget, 
      startDate: new Date(data.startDate), 
      endDate: new Date(data.endDate), 
      status: data.status, 
      description: mergedDescription,
      },
    });

    if (campaign.tasks[0]) {
      await tx.task.update({
        where: { id: campaign.tasks[0].id },
        data: {
          reward: data.rewardPerTask, 
      instructions: data.userInstructions,
          externalUrl: campaign.contentUrl, 
      status: data.status === "ACTIVE" ? "ACTIVE"  : "PAUSED",
        },
      });
    } else {
      const template = objectiveToTaskTemplate(campaign.objective as z.infer<typeof campaignSchema>["objective"]);
      await tx.task.create({
        data: {
          campaignId: campaign.id, 
      title: template.title,
          description: template.description, 
      instructions: data.userInstructions,
          reward: data.rewardPerTask, 
      type: template.type,
          externalUrl: campaign.contentUrl, 
      proofType: template.proofType,
          requiredWatchSeconds: template.requiredWatchSeconds ?? 0,
      status: data.status === "ACTIVE" ? "ACTIVE"  : "PAUSED",
        },
      });
    }
  });

  await createAdminAuditLog({
    adminId: admin.id, 
      targetType: "CAMPAIGN",
    targetId: campaign.id, 
      action: "CAMPAIGN_OPERATIONAL_CONFIG_UPDATED",
    description: `ConfiguraA§A£o operacional atualizada para campanha ${campaign.title}.`,
    metadata: {
      rewardPerTask: data.rewardPerTask, 
      dailyLimitPerUser: data.dailyLimitPerUser,
      totalBudget: data.totalBudget, 
      maxApprovedActions: data.maxApprovedActions, 
      priority: data.priority,
    },
  });

  revalidatePath("/admin/campanhas");
  revalidatePath(`/admin/campanhas/${campaign.id}`);
  revalidatePath("/usuario/campanhas");
  revalidatePath("/empresa/campanhas");
  return { ok: true, message: "ConfiguraA§A£o operacional salva com sucesso." };
}

export async function approveCampaignReview(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = campaignReviewActionSchema.safeParse({ campaignId: formData.get("campaignId") });
  if (!parsed.success) {
    return { ok: false, message: "Campanha invA¡lida para aprovaA§A£o." };
  }

  const campaign = await db.campaign.findUnique({
    where: { id: parsed.data.campaignId },
    include: { tasks: { take: 1, orderBy: { createdAt: "asc" } } },
  });
  if (!campaign) {
    return { ok: false, message: "Campanha nA£o encontrada." };
  }

  const socialRequiresUrl = campaign.socialPlatform !== "LOCAL" && campaign.socialPlatform !== "OTHER";
  if (
    !campaign.rewardPerTask ||
    !campaign.dailyLimitPerUser ||
    !campaign.totalBudget ||
    (socialRequiresUrl && !campaign.contentUrl) ||
    !campaign.startDate ||
    !campaign.endDate ||
    campaign.tasks.length === 0
  ) {
    return {
      ok: false, 
      message: "AprovaA§A£o bloqueada: preencha recompensa, limite, orA§amento, data, URL social e tarefa vinculada.",
    };
  }

  await db.$transaction(async (tx) => {
    await tx.campaign.update({
      where: { id: campaign.id },
      data: {
        reviewStatus: "APPROVED", 
      status: "ACTIVE",
        reviewedAt: new Date(), 
      submittedForReviewAt: campaign.submittedForReviewAt ?? new Date(),
      },
    });

    await tx.task.updateMany({
      where: { campaignId: campaign.id },
      data: {
        reward: campaign.rewardPerTask, 
      externalUrl: campaign.contentUrl, 
      status: "ACTIVE",
      },
    });
  });

  await createAdminAuditLog({
    adminId: admin.id, 
      targetType: "CAMPAIGN",
    targetId: campaign.id, 
      action: "CAMPAIGN_REVIEW_APPROVED",
    description: `Campanha ${campaign.title} aprovada na revisA£o.`,
  });

  revalidatePath("/admin/campanhas");
  revalidatePath(`/admin/campanhas/${campaign.id}`);
  revalidatePath("/usuario/campanhas");
  revalidatePath("/empresa/campanhas");
  return { ok: true, message: "Campanha aprovada e ativada com sucesso." };
}

export async function rejectCampaignReview(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = rejectCampaignReviewSchema.safeParse({
    campaignId: formData.get("campaignId"), 
      rejectionReason: formData.get("rejectionReason"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Informe um motivo vA¡lido para reprovar a campanha." };
  }

  const campaign = await db.campaign.findUnique({ where: { id: parsed.data.campaignId } });
  if (!campaign) {
    return { ok: false, message: "Campanha nA£o encontrada." };
  }

  await db.campaign.update({
    where: { id: campaign.id },
    data: {
      reviewStatus: "REJECTED", 
      status: "PAUSED",
      reviewedAt: new Date(), 
      description: `${campaign.description}\n\nMotivo da reprovaA§A£o: ${parsed.data.rejectionReason}`,
    },
  });

  await createAdminAuditLog({
    adminId: admin.id, 
      targetType: "CAMPAIGN",
    targetId: campaign.id, 
      action: "CAMPAIGN_REVIEW_REJECTED",
    description: `Campanha ${campaign.title} reprovada na revisA£o.`,
    metadata: { rejectionReason: parsed.data.rejectionReason },
  });

  revalidatePath("/admin/campanhas");
  revalidatePath(`/admin/campanhas/${campaign.id}`);
  revalidatePath("/empresa/campanhas");
  return { ok: true, message: "Campanha reprovada com motivo registrado." };
}

export async function pauseCampaign(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = campaignReviewActionSchema.safeParse({ campaignId: formData.get("campaignId") });
  if (!parsed.success) return { ok: false, message: "Campanha invA¡lida." };
  const data = new FormData();
  data.append("campaignId", parsed.data.campaignId);
  data.append("status", "PAUSED");
  return toggleCampaignStatus(data);
}

export async function activateCampaign(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = campaignReviewActionSchema.safeParse({ campaignId: formData.get("campaignId") });
  if (!parsed.success) return { ok: false, message: "Campanha invA¡lida." };
  const data = new FormData();
  data.append("campaignId", parsed.data.campaignId);
  data.append("status", "ACTIVE");
  return toggleCampaignStatus(data);
}

export async function toggleCampaignStatus(formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = toggleCampaignStatusSchema.safeParse({
    campaignId: formData.get("campaignId"), 
      status: formData.get("status"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Status invA¡lido para campanha." };
  }

  if (parsed.data.status === "ACTIVE") {
    const campaign = await db.campaign.findUnique({
      where: { id: parsed.data.campaignId },
      select: { reviewStatus: true },
    });

    if (!campaign) {
      return { ok: false, message: "Campanha nA£o encontrada." };
    }

    if (campaign.reviewStatus !== "APPROVED") {
      throw new Error("Campanha nA£o pode ser ativada sem aprovaA§A£o");
    }
  }

  await db.campaign.update({
    where: { id: parsed.data.campaignId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin/campanhas");
  revalidatePath(`/admin/campanhas/${parsed.data.campaignId}`);
  revalidatePath("/usuario/campanhas");

  return { ok: true, message: "Status da campanha atualizado." };
}

export async function approveSubmission(formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = reviewSubmissionSchema.safeParse({ submissionId: formData.get("submissionId") });
  if (!parsed.success) {
    return { ok: false, message: "SubmissA£o invA¡lida." };
  }

  const rules = tokenCostRules();
  let alreadyApproved = false;
  let failedCampaignId: string | null = null;
  let approvedUserId: string | null = null;
  let approvedPlatform: "INSTAGRAM" | "TIKTOK" | "FACEBOOK" | "YOUTUBE" | "GOOGLE" | "LOCAL" | "OTHER" | null = null;

  try {
    await db.$transaction(async (tx) => {
      const submission = await tx.taskSubmission.findUnique({
        where: { id: parsed.data.submissionId },
        include: {
          campaign: {
            select: {
              id: true, 
      title: true, 
      companyId: true,
      socialPlatform: true,
            },
          },
        },
      });

      if (!submission) {
        throw new Error("SUBMISSION_NOT_FOUND");
      }

      if (submission.status === "APPROVED") {
        alreadyApproved = true;
        return;
      }

      const approved = await tx.taskSubmission.updateMany({
        where: {
          id: submission.id, 
      status: { not: "APPROVED" },
        },
        data: {
          status: "APPROVED", 
      reviewedAt: new Date(), 
      rejectionReason: "",
        },
      });

      if (approved.count === 0) {
        alreadyApproved = true;
        return;
      }
      approvedUserId = submission.userId;
      approvedPlatform = submission.campaign.socialPlatform;

      if (submission.campaign.companyId) {
        const spent = await spendCompanyTokens(
          submission.campaign.companyId,
          rules.approvedAction,
          "CAMPAIGN_ACTION",
          `AprovaA§A£o de tarefa na campanha: ${submission.campaign.title}`,
          submission.id,
          tx,
        );

        if (!spent) {
          failedCampaignId = submission.campaign.id;
          throw new Error("COMPANY_TOKENS_EMPTY");
        }
      }

      try {
        await tx.walletTransaction.create({
          data: {
            userId: submission.userId, 
      type: "CREDIT",
            amount: submission.rewardAmount, 
      description: "CrA©dito por tarefa aprovada",
            referenceId: submission.id,
          },
        });

        const day1 = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const day3 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        await tx.taskExternalVerification.createMany({
          data: [
            {
              submissionId: submission.id, 
      status: "NOT_FOUND",
              checkedAt: day1, 
      details: {
                scheduled: true, 
      note: "VerificaA§A£o externa agendada +1 dia",
              },
            },
            {
              submissionId: submission.id, 
      status: "NOT_FOUND",
              checkedAt: day3, 
      details: {
                scheduled: true, 
      note: "VerificaA§A£o externa agendada +3 dias",
              },
            },
          ],
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          alreadyApproved = true;
          return;
        }
        throw error;
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "SUBMISSION_NOT_FOUND") {
      return { ok: false, message: "SubmissA£o nA£o encontrada." };
    }

    if (error instanceof Error && error.message === "COMPANY_TOKENS_EMPTY") {
      if (failedCampaignId) {
        await db.campaign.update({
          where: { id: failedCampaignId },
          data: { status: "PAUSED" },
        });
      }
      revalidatePath("/admin/campanhas");
      revalidatePath("/admin/tarefas");
      revalidatePath("/empresa/dashboard");
      revalidatePath("/empresa/plano");
      revalidatePath("/empresa/campanhas");
      return {
        ok: false, 
      message: "A empresa nA£o possui tokens suficientes para aprovar esta tarefa. A campanha foi pausada automaticamente.",
      };
    }
    throw error;
  }

  if (alreadyApproved) {
    revalidatePath("/admin/tarefas");
    revalidatePath("/usuario/tarefas");
    revalidatePath("/usuario/carteira");
    revalidatePath("/usuario/dashboard");
    return { ok: true, message: "SubmissA£o jA¡ aprovada anteriormente." };
  }

  if (approvedUserId && approvedPlatform) {
    const xpReward = getXpRewardForMission(approvedPlatform, "OTHER");
    await applyMissionApprovalReward(approvedUserId, xpReward);
  }

  revalidatePath("/admin/tarefas");
  revalidatePath("/usuario/tarefas");
  revalidatePath("/usuario/carteira");
  revalidatePath("/usuario/dashboard");
  revalidatePath("/empresa/dashboard");
  revalidatePath("/empresa/plano");
  revalidatePath("/empresa/campanhas");

  return { ok: true, message: "Tarefa aprovada e crA©dito lanA§ado na carteira." };
}

export async function rejectSubmission(formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = rejectSubmissionSchema.safeParse({
    submissionId: formData.get("submissionId"), 
      rejectionReason: formData.get("rejectionReason"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Informe um motivo vA¡lido para a reprovaA§A£o." };
  }

  const submission = await db.taskSubmission.findUnique({ where: { id: parsed.data.submissionId } });
  if (!submission) {
    return { ok: false, message: "SubmissA£o nA£o encontrada." };
  }

  if (submission.status === "APPROVED") {
    return { ok: false, message: "NA£o A© possA­vel reprovar uma tarefa jA¡ aprovada." };
  }

  await db.taskSubmission.update({
    where: { id: submission.id },
    data: {
      status: "REJECTED", 
      rejectionReason: parsed.data.rejectionReason, 
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/admin/tarefas");
  revalidatePath("/usuario/tarefas");

  return { ok: true, message: "Tarefa reprovada com motivo registrado." };
}

export async function approveWithdrawal(formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = withdrawalActionSchema.safeParse({ requestId: formData.get("requestId") });
  if (!parsed.success) {
    return { ok: false, message: "Saque invA¡lido." };
  }

  const request = await db.withdrawalRequest.findUnique({
    where: { id: parsed.data.requestId },
    include: { user: true },
  });

  if (!request) {
    return { ok: false, message: "Saque nA£o encontrado." };
  }

  if (!request.user.onboardingCompleted || !request.user.cpf || !request.user.pixKey || !request.user.bankName) { return { ok: false, message: "UsuA¡rio com cadastro incompleto para saque." };
  }

  await db.withdrawalRequest.update({
    where: { id: request.id },
    data: {
      status: "APPROVED", 
      reviewedAt: new Date(),
    },
  });

  revalidatePath("/admin/saques");
  revalidatePath("/usuario/saques");

  return { ok: true, message: "Saque aprovado com sucesso." };
}

export async function markWithdrawalPaid(formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = withdrawalActionSchema.safeParse({ requestId: formData.get("requestId") });
  if (!parsed.success) {
    return { ok: false, message: "Saque invA¡lido." };
  }

  const request = await db.withdrawalRequest.findUnique({ where: { id: parsed.data.requestId } });
  if (!request) {
    return { ok: false, message: "Saque nA£o encontrado." };
  }

  if (request.status === "PAID") {
    return { ok: true, message: "Saque jA¡ estA¡ marcado como pago." };
  }

  await db.$transaction(async (tx) => {
    await tx.withdrawalRequest.update({
      where: { id: request.id },
      data: {
        status: "PAID", 
      reviewedAt: new Date(), 
      paidAt: new Date(),
      },
    });

    const paidTx = await tx.walletTransaction.findFirst({
      where: {
        referenceId: request.id, 
      type: "WITHDRAWAL_PAID",
      },
      select: { id: true },
    });

    if (!paidTx) {
      await tx.walletTransaction.create({
        data: {
          userId: request.userId, 
      type: "WITHDRAWAL_PAID",
          amount: request.amount, 
      description: "Saque pago manualmente",
          referenceId: request.id,
        },
      });
    }
  });

  revalidatePath("/admin/saques");
  revalidatePath("/usuario/saques");
  revalidatePath("/usuario/carteira");

  return { ok: true, message: "Saque marcado como pago." };
}

export async function rejectWithdrawal(formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = rejectWithdrawalSchema.safeParse({
    requestId: formData.get("requestId"), 
      rejectionReason: formData.get("rejectionReason"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Informe um motivo vA¡lido para a reprovaA§A£o." };
  }

  const request = await db.withdrawalRequest.findUnique({ where: { id: parsed.data.requestId } });
  if (!request) {
    return { ok: false, message: "Saque nA£o encontrado." };
  }

  if (request.status === "PAID") {
    return { ok: false, message: "NA£o A© possA­vel reprovar um saque jA¡ pago." };
  }

  await db.$transaction(async (tx) => {
    await tx.withdrawalRequest.update({
      where: { id: request.id },
      data: {
        status: "REJECTED", 
      rejectionReason: parsed.data.rejectionReason, 
      reviewedAt: new Date(),
      },
    });

    const hold = await tx.walletTransaction.findFirst({
      where: {
        referenceId: request.id, 
      type: "WITHDRAWAL_HOLD",
      },
      select: { id: true },
    });

    if (hold) {
      const refundExists = await tx.walletTransaction.findFirst({
        where: {
          referenceId: request.id, 
      type: "ADJUSTMENT",
          description: {
            contains: "Estorno", 
      mode: "insensitive",
          },
        },
        select: { id: true },
      });

      if (!refundExists) {
        await tx.walletTransaction.create({
          data: {
            userId: request.userId, 
      type: "ADJUSTMENT",
            amount: request.amount, 
      description: "Estorno de saque reprovado",
            referenceId: request.id,
          },
        });
      }
    }
  });

  revalidatePath("/admin/saques");
  revalidatePath("/usuario/saques");
  revalidatePath("/usuario/carteira");

  return { ok: true, message: "Saque reprovado e estorno processado quando aplicA¡vel." };
}

export async function blockUser(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const userId = formData.get("userId");
  if (typeof userId !== "string" || userId.length === 0) { return { ok: false, message: "UsuA¡rio invA¡lido." };
  }

  await db.user.update({ where: { id: userId }, data: { status: "BLOCKED" } });
  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}`);
  return { ok: true, message: "UsuA¡rio bloqueado." };
}

export async function unblockUser(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const userId = formData.get("userId");
  if (typeof userId !== "string" || userId.length === 0) { return { ok: false, message: "UsuA¡rio invA¡lido." };
  }

  await db.user.update({ where: { id: userId }, data: { status: "ACTIVE" } });
  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}`);
  return { ok: true, message: "UsuA¡rio desbloqueado." };
}

export async function updateUserRole(formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();

  const parsed = updateRoleSchema.safeParse({
    userId: formData.get("userId"), 
      role: formData.get("role"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Role invA¡lida." };
  }

  if (parsed.data.userId === admin.id && parsed.data.role !== "ADMIN") {
    return { ok: false, message: "VocAª nA£o pode remover seu prA³prio acesso de administrador." };
  }

  await db.user.update({
    where: { id: parsed.data.userId },
    data: { role: parsed.data.role },
  });

  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${parsed.data.userId}`);

  return { ok: true, message: "Role do usuA¡rio atualizada." };
}

export async function adjustCompanyTokens(formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = adjustCompanyTokensSchema.safeParse({
    companyId: formData.get("companyId"), 
      amount: formData.get("amount"), 
      description: formData.get("description"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Dados invA¡lidos para ajuste de tokens." };
  }

  const { companyId, amount, description } = parsed.data;

  const company = await db.company.findUnique({
    where: { id: companyId },
    select: { id: true, tokensBalance: true },
  });

  if (!company) {
    return { ok: false, message: "Empresa nA£o encontrada." };
  }

  if (amount < 0 && company.tokensBalance < Math.abs(amount)) {
    return { ok: false, message: "Saldo de tokens insuficiente para este ajuste negativo." };
  }

  await db.$transaction(async (tx) => {
    const companyData = amount < 0
      ? {
          tokensBalance: { increment: amount },
          tokensUsedThisCycle: { increment: Math.abs(amount) },
        }
      : {
          tokensBalance: { increment: amount },
        };

    await tx.company.update({
      where: { id: companyId },
      data: companyData,
    });

    await tx.companyTokenLedger.create({
      data: {
        companyId, 
      type: "MANUAL_ADJUSTMENT",
        amount,
        description,
        referenceId: "",
      },
    });
  });

  revalidatePath("/admin/empresas");
  revalidatePath(`/admin/empresas/${companyId}`);
  revalidatePath("/empresa/plano");
  revalidatePath("/empresa/dashboard");

  return { ok: true, message: "Ajuste de tokens aplicado com sucesso." };
}

export async function updateCompanyPlan(formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = updateCompanyPlanSchema.safeParse({
    companyId: formData.get("companyId"), 
      plan: formData.get("plan"), 
      planStatus: formData.get("planStatus"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Dados invA¡lidos para plano da empresa." };
  }

  const limits = getPlanLimits(parsed.data.plan);

  await db.company.update({
    where: { id: parsed.data.companyId },
    data: {
      plan: parsed.data.plan, 
      planStatus: parsed.data.planStatus, 
      tokensMonthlyLimit: limits.monthlyTokens,
    },
  });

  revalidatePath("/admin/empresas");
  revalidatePath(`/admin/empresas/${parsed.data.companyId}`);
  revalidatePath("/empresa/plano");
  revalidatePath("/empresa/dashboard");

  return { ok: true, message: "Plano da empresa atualizado." };
}

export async function createCompany(formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = companySchema.safeParse({
    tradeName: formData.get("tradeName"), 
      legalName: formData.get("legalName"), 
      cnpj: formData.get("cnpj"), 
      responsibleName: formData.get("responsibleName"), 
      responsibleWhatsapp: formData.get("responsibleWhatsapp"), 
      email: formData.get("email"), 
      phone: formData.get("phone"), 
      city: formData.get("city"), 
      neighborhood: formData.get("neighborhood"), 
      category: formData.get("category"), 
      instagramUrl: formData.get("instagramUrl"), 
      facebookUrl: formData.get("facebookUrl"), 
      tiktokUrl: formData.get("tiktokUrl"), 
      googleBusinessUrl: formData.get("googleBusinessUrl"), 
      websiteUrl: formData.get("websiteUrl"), 
      plan: formData.get("plan"), 
      tokensBalance: formData.get("tokensBalance"), 
      status: formData.get("status"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Confira os dados da empresa." };
  }

  const data = parsed.data;
  const normalizedCnpj = digitsOnly(data.cnpj);
  const normalizedWhatsapp = digitsOnly(data.responsibleWhatsapp);
  if (normalizedCnpj.length !== 14) {
    return { ok: false, message: "CNPJ deve ter 14 nAºmeros." };
  }
  if (normalizedWhatsapp.length !== 11) {
    return { ok: false, message: "WhatsApp deve ter DDD + nAºmero, total de 11 dA­gitos." };
  }
  const limits = getPlanLimits(data.plan);
  const publicId = await generateCompanyPublicId();
  const tempPassword = Math.random().toString(36).slice(-10) + "A1";
  const passwordHash = await hashPassword(tempPassword);

  const company = await db.$transaction(async (tx) => {
    const created = await tx.company.create({
      data: {
        publicId,
        tradeName: data.tradeName, 
      legalName: data.legalName || "", cnpj: normalizedCnpj, 
      responsibleName: data.responsibleName,
        responsibleWhatsapp: normalizedWhatsapp, 
      email: data.email,
        phone: data.phone || "", city: data.city,
        neighborhood: data.neighborhood || "", category: data.category || "", instagramUrl: data.instagramUrl || "", facebookUrl: data.facebookUrl || "", tiktokUrl: data.tiktokUrl || "", googleBusinessUrl: data.googleBusinessUrl || "", websiteUrl: data.websiteUrl || "", status: data.status,
        approvedAt: data.status === "ACTIVE" ? new Date() : new Date(0), 
      rejectedAt: new Date(0),
      rejectionReason: "",
      plan: data.plan,
        planStatus: "ACTIVE", 
      tokensBalance: data.tokensBalance,
        tokensMonthlyLimit: limits.monthlyTokens, 
      tokensUsedThisCycle: 0,
        billingCycleStart: new Date(), 
      billingCycleEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
        passwordHash,
      },
    });

    await tx.companyTokenLedger.create({
      data: {
        companyId: created.id, 
      type: "MONTHLY_GRANT",
        amount: data.tokensBalance, 
      description: `CrA©dito inicial da empresa (${data.plan})`,
        referenceId: "",
      },
    });

    const existingUser = await tx.user.findUnique({ where: { email: data.email } });
    if (!existingUser) {
      await tx.user.create({
        data: {
          name: data.responsibleName, 
      email: data.email,
          passwordHash, 
      phone: normalizedWhatsapp,
          role: "COMPANY", 
      status: data.status === "PENDING" ? "PENDING"  : "ACTIVE",
          companyId: created.id, 
      onboardingCompleted: false,
        },
      });
    }

    return created;
  });

  revalidatePath("/admin/empresas");
  revalidatePath("/admin/dashboard");
  return { ok: true, message: `Empresa cadastrada com sucesso (${company.publicId}). Senha temporA¡ria gerada.` };
}

async function applyCompanyStatus(
  adminId: string, 
      companyId: string,
  status: "ACTIVE" | "REJECTED" | "BLOCKED", 
      rejectionReason?: string,
): Promise<ActionState> {
  const company = await db.company.findUnique({
    where: { id: companyId },
    select: { id: true, tradeName: true, status: true },
  });

  if (!company) {
    return { ok: false, message: "Empresa nA£o encontrada." };
  }

  const updates =
    status === "ACTIVE" ? { status, approvedAt: new Date(), rejectedAt: new Date(0), rejectionReason: "" }
      : status === "REJECTED" ? { status, approvedAt: new Date(0), rejectedAt: new Date(), rejectionReason: rejectionReason ?? "Cadastro reprovado." }
        : { status, approvedAt: new Date(0), rejectedAt: new Date(0), rejectionReason: "" };

  await db.$transaction(async (tx) => {
    await tx.company.update({
      where: { id: companyId },
      data: updates,
    });

    await tx.user.updateMany({
      where: { companyId },
      data: {
        status: status === "ACTIVE" ? "ACTIVE" : "BLOCKED",
      },
    });
  });

  await createAdminAuditLog({
    adminId,
    targetType: "COMPANY", 
      targetId: companyId, 
      action: `COMPANY_${status}`,
    description: `Status da empresa ${company.tradeName} alterado para ${status}.`,
    metadata: rejectionReason ? { rejectionReason } : undefined,
  });

  revalidatePath("/admin/empresas");
  revalidatePath(`/admin/empresas/${companyId}`);
  revalidatePath("/admin/dashboard");
  revalidatePath("/empresa/status");
  revalidatePath("/empresa/dashboard");
  return {
    ok: true, 
      message: status === "ACTIVE" ? "Empresa aprovada com sucesso." : status === "REJECTED" ? "Empresa reprovada com motivo registrado." : "Empresa bloqueada com sucesso.",
  };
}

export async function approveCompany(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = companyActionSchema.safeParse({ companyId: formData.get("companyId") });
  if (!parsed.success) {
    return { ok: false, message: "Empresa invA¡lida para aprovaA§A£o." };
  }
  return applyCompanyStatus(admin.id, parsed.data.companyId, "ACTIVE", undefined);
}

export async function rejectCompany(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = rejectCompanySchema.safeParse({
    companyId: formData.get("companyId"), 
      rejectionReason: formData.get("rejectionReason"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Informe um motivo vA¡lido para reprovar a empresa." };
  }

  return applyCompanyStatus(admin.id, parsed.data.companyId, "REJECTED", parsed.data.rejectionReason);
}

export async function blockCompany(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = companyActionSchema.safeParse({ companyId: formData.get("companyId") });
  if (!parsed.success) {
    return { ok: false, message: "Empresa invA¡lida para bloqueio." };
  }
  return applyCompanyStatus(admin.id, parsed.data.companyId, "BLOCKED");
}

export async function activateCompany(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  return approveCompany(_prevState, formData);
}

export async function updateCompany(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = companyUpdateSchema.safeParse({
    companyId: formData.get("companyId"), 
      tradeName: formData.get("tradeName"), 
      legalName: formData.get("legalName"), 
      responsibleName: formData.get("responsibleName"), 
      responsibleWhatsapp: formData.get("responsibleWhatsapp"), 
      phone: formData.get("phone"), 
      city: formData.get("city"), 
      neighborhood: formData.get("neighborhood"), 
      category: formData.get("category"), 
      instagramUrl: formData.get("instagramUrl"), 
      facebookUrl: formData.get("facebookUrl"), 
      tiktokUrl: formData.get("tiktokUrl"), 
      googleBusinessUrl: formData.get("googleBusinessUrl"), 
      websiteUrl: formData.get("websiteUrl"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Dados invA¡lidos para atualizar a empresa." };
  }

  const data = parsed.data;
  const normalizedWhatsapp = data.responsibleWhatsapp ? digitsOnly(data.responsibleWhatsapp) : undefined;
  if (normalizedWhatsapp && normalizedWhatsapp.length !== 11) {
    return { ok: false, message: "WhatsApp deve ter DDD + nAºmero, total de 11 dA­gitos." };
  }

  await db.company.update({
    where: { id: data.companyId },
    data: {
      tradeName: data.tradeName, 
      legalName: data.legalName || "", responsibleName: data.responsibleName, 
      responsibleWhatsapp: normalizedWhatsapp,
      phone: data.phone || "", city: data.city,
      neighborhood: data.neighborhood || "", category: data.category || "", instagramUrl: data.instagramUrl || "", facebookUrl: data.facebookUrl || "", tiktokUrl: data.tiktokUrl || "", googleBusinessUrl: data.googleBusinessUrl || "", websiteUrl: data.websiteUrl || "",
    },
  });

  revalidatePath("/admin/empresas");
  revalidatePath(`/admin/empresas/${data.companyId}`);
  return { ok: true, message: "Empresa atualizada com sucesso." };
}

export async function updateCompanyStatus(formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = companyStatusSchema.safeParse({
    companyId: formData.get("companyId"), 
      status: formData.get("status"), 
      rejectionReason: formData.get("rejectionReason"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Status invA¡lido para empresa." };
  }

  if (parsed.data.status === "REJECTED" && (!parsed.data.rejectionReason || parsed.data.rejectionReason.length < 6)) { return { ok: false, message: "Informe um motivo vA¡lido para reprovar a empresa." };
  }

  return applyCompanyStatus(admin.id, parsed.data.companyId, parsed.data.status, parsed.data.rejectionReason);
}

export async function addCompanySocialPost(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = companyPostSchema.safeParse({
    companyId: formData.get("companyId"), 
      platform: formData.get("platform"), 
      url: formData.get("url"), 
      title: formData.get("title"), 
      description: formData.get("description"), 
      thumbnailUrl: formData.get("thumbnailUrl"), 
      durationSeconds: formData.get("durationSeconds"), 
      source: formData.get("source"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Dados invA¡lidos para adicionar post." };
  }

  await db.companySocialPost.create({
    data: {
      companyId: parsed.data.companyId, 
      platform: parsed.data.platform,
      url: parsed.data.url, 
      title: parsed.data.title || "", description: parsed.data.description || "", thumbnailUrl: parsed.data.thumbnailUrl || "", durationSeconds: parsed.data.durationSeconds ?? 0, 
      publishedAt: new Date(),
      source: parsed.data.source,
    },
  });

  revalidatePath(`/admin/empresas/${parsed.data.companyId}`);
  revalidatePath("/admin/campanhas/nova");
  return { ok: true, message: "Post social adicionado com sucesso." };
}

export async function importCompanyTestPosts(formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = importPostsSchema.safeParse({
    companyId: formData.get("companyId"), 
      platform: formData.get("platform"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Plataforma invA¡lida para importaA§A£o de teste." };
  }

  const items = Array.from({ length: 10 }).map((_, index) => {
    const n = index + 1;
    return {
      companyId: parsed.data.companyId, 
      platform: parsed.data.platform, 
      url: `https://exemplo.com/${parsed.data.platform.toLowerCase()}/post-${n}`,
      title: `Post de teste ${n}`,
      description: `ConteAºdo de teste para ${parsed.data.platform}.`,
      thumbnailUrl: `https://picsum.photos/seed/${parsed.data.platform}-${n}/640/360`,
      durationSeconds: 15 + n * 3, 
      publishedAt: new Date(),
      source: "PUBLIC_LINK" as const, 
      status: "ACTIVE" as const,
    };
  });

  await db.companySocialPost.createMany({ data: items });
  revalidatePath(`/admin/empresas/${parsed.data.companyId}`);
  revalidatePath("/admin/campanhas/nova");
  return { ok: true, message: "10 posts de teste importados com sucesso." };
}

export async function startCompanyImpersonationAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = impersonationSchema.safeParse({ companyId: formData.get("companyId") });
  if (!parsed.success) return;

  const company = await db.company.findUnique({ where: { id: parsed.data.companyId }, select: { id: true } });
  if (!company) return;

  await startCompanyImpersonation(admin.id, company.id);
  redirect("/empresa/dashboard");
}

export async function stopCompanyImpersonationAction(): Promise<void> {
  await stopImpersonation();
  redirect("/admin/empresas");
}

export async function toggleCampaignStatusAction(formData: FormData): Promise<void> {
  await toggleCampaignStatus(formData);
}

export async function approveSubmissionAction(formData: FormData): Promise<void> {
  await approveSubmission(formData);
}

export async function rejectSubmissionAction(formData: FormData): Promise<void> {
  await rejectSubmission(formData);
}

export async function approveWithdrawalAction(formData: FormData): Promise<void> {
  await approveWithdrawal(formData);
}

export async function markWithdrawalPaidAction(formData: FormData): Promise<void> {
  await markWithdrawalPaid(formData);
}

export async function rejectWithdrawalAction(formData: FormData): Promise<void> {
  await rejectWithdrawal(formData);
}

export async function blockUserAction(formData: FormData): Promise<void> {
  await blockUser(formData);
}

export async function unblockUserAction(formData: FormData): Promise<void> {
  await unblockUser(formData);
}

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  await updateUserRole(formData);
}

export async function adjustCompanyTokensAction(formData: FormData): Promise<void> {
  await adjustCompanyTokens(formData);
}

export async function updateCompanyPlanAction(formData: FormData): Promise<void> {
  await updateCompanyPlan(formData);
}

export async function createCompanyAction(formData: FormData): Promise<void> {
  await createCompany(formData);
}

export async function updateCompanyStatusAction(formData: FormData): Promise<void> {
  await updateCompanyStatus(formData);
}

export async function approveCompanyAction(formData: FormData): Promise<void> {
  await approveCompany({ ok: false }, formData);
}

export async function rejectCompanyAction(formData: FormData): Promise<void> {
  await rejectCompany({ ok: false }, formData);
}

export async function blockCompanyAction(formData: FormData): Promise<void> {
  await blockCompany({ ok: false }, formData);
}

export async function activateCompanyAction(formData: FormData): Promise<void> {
  await activateCompany({ ok: false }, formData);
}

export async function updateCompanyAction(formData: FormData): Promise<void> {
  await updateCompany({ ok: false }, formData);
}

export async function addCompanySocialPostAction(formData: FormData): Promise<void> {
  await addCompanySocialPost(formData);
}

export async function importCompanyTestPostsAction(formData: FormData): Promise<void> {
  await importCompanyTestPosts(formData);
}

export async function updateCampaignOperationalConfigAction(formData: FormData): Promise<void> {
  await updateCampaignOperationalConfig({ ok: false }, formData);
}

export async function approveCampaignReviewAction(formData: FormData): Promise<void> {
  await approveCampaignReview({ ok: false }, formData);
}

export async function rejectCampaignReviewAction(formData: FormData): Promise<void> {
  await rejectCampaignReview({ ok: false }, formData);
}

export async function pauseCampaignAction(formData: FormData): Promise<void> {
  await pauseCampaign({ ok: false }, formData);
}

export async function activateCampaignAction(formData: FormData): Promise<void> {
  await activateCampaign({ ok: false }, formData);
}
