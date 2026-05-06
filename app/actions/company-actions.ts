"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { isImpersonating, stopImpersonation } from "@/lib/admin-impersonation";
import { clearCompanySession, compareCompanyPassword, createCompanySession, requireCompany } from "@/lib/company-auth";
import { generateCompanyPublicId } from "@/lib/company-id";
import { canSpendCompanyTokens, getPlanLimits, spendCompanyTokens, tokenCostRules } from "@/lib/company-tokens";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import type { ActionState } from "@/types";

const companyLoginSchema = z.object({
  email: z.string().email("E-mail inválido").toLowerCase(), password: z.string().min(1, "Informe a senha"),
});

const companyRegisterSchema = z.object({
  tradeName: z.string().trim().min(2, "Informe o nome fantasia."), legalName: z.string().trim().min(2, "Informe a razão social."), cnpj: z.string().trim(), responsibleName: z.string().trim().min(2, "Informe o responsável."), responsibleWhatsapp: z.string().trim(), email: z.string().email("E-mail inválido.").toLowerCase(), password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."), city: z.string().trim().min(2, "Informe a cidade."), neighborhood: z.string().trim().min(2, "Informe o bairro."), category: z.string().trim().min(2, "Informe a categoria."), instagramUrl: z.string().url("URL inválida.").optional().or(z.literal("")), tiktokUrl: z.string().url("URL inválida.").optional().or(z.literal("")), facebookUrl: z.string().url("URL inválida.").optional().or(z.literal("")), googleBusinessUrl: z.string().url("URL inválida.").optional().or(z.literal("")), websiteUrl: z.string().url("URL inválida.").optional().or(z.literal("")),
});

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

const companyCampaignSchema = z.object({
  title: z.string().min(3), description: z.string().min(10), city: z.string().min(2), neighborhood: z.string().min(2), category: z.string().min(2), socialPlatform: z.enum(["INSTAGRAM", "TIKTOK", "FACEBOOK", "YOUTUBE", "GOOGLE", "LOCAL", "OTHER"]), contentUrl: z.string().url().optional().or(z.literal("")), objective: z.enum(["WATCH_VIDEO", "VIEW_STORY", "LIKE_POST", "COMMENT_POST", "FOLLOW_PROFILE", "REVIEW_BUSINESS", "CHECKIN_BUSINESS", "VISIT_LOCAL", "OTHER"]), desiredActions: z.coerce.number().int().positive(), userInstructions: z.string().min(10), adminNotes: z.string().optional(), startDate: z.string().min(4), endDate: z.string().min(4),
});

const submitReviewSchema = z.object({
  campaignId: z.string().min(1),
});

function objectiveTemplate(objective: z.infer<typeof companyCampaignSchema>["objective"]) {
  if (objective === "WATCH_VIDEO" || objective === "VIEW_STORY") {
    return {
      title: "Assistir conteúdo da campanha", description: "Assista ao conteúdo e envie comprovação válida.",
      instructions: "1. Abra o conteúdo.\n2. Assista integralmente.\n3. Envie prova real.", type: "CONTENT" as const,
      proofType: "LINK" as const, requiredWatchSeconds: 30,
    };
  }

  if (objective === "FOLLOW_PROFILE") {
    return {
      title: "Seguir perfil oficial", description: "Siga o perfil e envie comprovação.",
      instructions: "1. Abra o perfil oficial.\n2. Siga o perfil.\n3. Envie print ou link.", type: "SHARE" as const,
      proofType: "TEXT_AND_IMAGE" as const, requiredWatchSeconds: null,
    };
  }

  if (objective === "REVIEW_BUSINESS") {
    return {
      title: "Publicar avaliação", description: "Publique avaliação real e comprove.",
      instructions: "1. Acesse o local indicado.\n2. Faça avaliação legítima.\n3. Envie comprovação.", type: "REVIEW" as const,
      proofType: "LINK" as const, requiredWatchSeconds: null,
    };
  }

  if (objective === "CHECKIN_BUSINESS" || objective === "VISIT_LOCAL") {
    return {
      title: "Fazer check-in", description: "Realize check-in e envie prova da ação.",
      instructions: "1. Vá ao local.\n2. Faça check-in.\n3. Envie comprovação real.", type: "CHECKIN" as const,
      proofType: "TEXT_AND_IMAGE" as const, requiredWatchSeconds: null,
    };
  }

  return {
    title: "Executar ação da campanha", description: "Realize a ação e envie comprovação válida.",
    instructions: "1. Siga as instruções da campanha.\n2. Execute a ação.\n3. Envie prova real.", type: "OTHER" as const,
    proofType: "TEXT_AND_IMAGE" as const, requiredWatchSeconds: null,
  };
}

export async function companyLoginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = companyLoginSchema.safeParse({
    email: formData.get("email"), password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Credenciais inválidas.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const company = await db.company.findUnique({ where: { email: parsed.data.email } });
  if (!company) {
    return { ok: false, message: "E-mail ou senha incorretos." };
  }
  const companyUser = await db.user.findFirst({
    where: { email: parsed.data.email, role: "COMPANY", companyId: company.id },
    select: { id: true },
  });
  if (!companyUser) {
    return { ok: false, message: "Esta conta não possui perfil de empresa válido." };
  }

  const validPassword = await compareCompanyPassword(parsed.data.password, company.passwordHash);
  if (!validPassword) {
    return { ok: false, message: "E-mail ou senha incorretos." };
  }

  await createCompanySession(company.id, company.email);
  if (company.status === "ACTIVE") {
    redirect("/empresa/dashboard");
  }
  redirect("/empresa/status");
}

export async function companyRegisterAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = companyRegisterSchema.safeParse({
    tradeName: formData.get("tradeName"), legalName: formData.get("legalName"), cnpj: formData.get("cnpj"), responsibleName: formData.get("responsibleName"), responsibleWhatsapp: formData.get("responsibleWhatsapp"), email: formData.get("email"), password: formData.get("password"), city: formData.get("city"), neighborhood: formData.get("neighborhood"), category: formData.get("category"), instagramUrl: formData.get("instagramUrl"), tiktokUrl: formData.get("tiktokUrl"), facebookUrl: formData.get("facebookUrl"), googleBusinessUrl: formData.get("googleBusinessUrl"), websiteUrl: formData.get("websiteUrl"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Confira os dados do cadastro da empresa.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const data = {
    ...parsed.data,
    cnpj: digitsOnly(parsed.data.cnpj), responsibleWhatsapp: digitsOnly(parsed.data.responsibleWhatsapp),
  };

  if (data.cnpj.length !== 14) {
    return { ok: false, message: "CNPJ deve ter 14 números.", fieldErrors: { cnpj: ["CNPJ deve ter 14 números."] } };
  }

  if (data.responsibleWhatsapp.length !== 11) {
    return {
      ok: false, message: "WhatsApp deve ter DDD + número, total de 11 dígitos.", fieldErrors: { responsibleWhatsapp: ["WhatsApp deve ter DDD + número, total de 11 dígitos."] },
    };
  }
  const emailExists = await db.user.findUnique({ where: { email: data.email }, select: { id: true } });
  if (emailExists) {
    return { ok: false, message: "Este e-mail já está em uso." };
  }

  const cnpjExists = await db.company.findFirst({
    where: { cnpj: data.cnpj },
    select: { id: true },
  });
  if (cnpjExists) {
    return { ok: false, message: "Este CNPJ já está cadastrado." };
  }

  const publicId = await generateCompanyPublicId();
  const passwordHash = await hashPassword(data.password);

  const company = await db.$transaction(async (tx) => {
    const createdCompany = await tx.company.create({
      data: {
        publicId,
        tradeName: data.tradeName, legalName: data.legalName,
        cnpj: data.cnpj, responsibleName: data.responsibleName,
        responsibleWhatsapp: data.responsibleWhatsapp, email: data.email,
        passwordHash, city: data.city,
        neighborhood: data.neighborhood, category: data.category,
        instagramUrl: data.instagramUrl || null, tiktokUrl: data.tiktokUrl || null, facebookUrl: data.facebookUrl || null, googleBusinessUrl: data.googleBusinessUrl || null, websiteUrl: data.websiteUrl || null, status: "PENDING", plan: "FREE", planStatus: "TRIAL",
        tokensBalance: 50, tokensMonthlyLimit: 50,
        tokensUsedThisCycle: 0, billingCycleStart: new Date(), billingCycleEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });

    await tx.companyTokenLedger.create({
      data: {
        companyId: createdCompany.id, type: "MONTHLY_GRANT",
        amount: 50, description: "Crédito inicial de trial da empresa",
      },
    });

    await tx.user.create({
      data: {
        name: data.responsibleName, email: data.email,
        passwordHash, phone: data.responsibleWhatsapp,
        role: "COMPANY", status: "PENDING",
        companyId: createdCompany.id, onboardingCompleted: false,
      },
    });

    return createdCompany;
  });

  await createCompanySession(company.id, company.email);
  revalidatePath("/admin/empresas");
  redirect("/empresa/status");
}

export async function companyLogoutAction() {
  if (await isImpersonating()) {
    await stopImpersonation();
    redirect("/admin/empresas");
  }
  await clearCompanySession();
  redirect("/empresa/login");
}

export async function createCompanyCampaignAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const company = await requireCompany();

  if (company.planStatus === "CANCELED" || company.planStatus === "PAST_DUE") { return { ok: false, message: "Seu plano está indisponível. Regularize o plano para criar campanhas." };
  }

  const parsed = companyCampaignSchema.safeParse({
    title: formData.get("title"), description: formData.get("description"), city: formData.get("city"), neighborhood: formData.get("neighborhood"), category: formData.get("category"), socialPlatform: formData.get("socialPlatform"), contentUrl: formData.get("contentUrl"), objective: formData.get("objective"), desiredActions: formData.get("desiredActions"), userInstructions: formData.get("userInstructions"), adminNotes: formData.get("adminNotes"), startDate: formData.get("startDate"), endDate: formData.get("endDate"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Confira os dados da campanha.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const rules = tokenCostRules();
  const estimatedTokens = rules.campaignCreation + rules.submitForReview;
  const hasTokens = await canSpendCompanyTokens(company.id, estimatedTokens);
  if (!hasTokens) {
    return {
      ok: false, message: "Você não possui tokens suficientes para enviar esta campanha para análise. Faça upgrade ou adicione tokens.",
    };
  }

  const limits = getPlanLimits(company.plan);
  const activeCampaigns = await db.campaign.count({ where: { companyId: company.id, status: "ACTIVE" } });
  if (activeCampaigns >= limits.activeCampaignLimit) {
    return {
      ok: false, message: `Seu plano atual permite até ${limits.activeCampaignLimit} campanha(s) ativa(s). Faça upgrade para escalar.`,
    };
  }

  const data = parsed.data;
  const template = objectiveTemplate(data.objective);
  const operationalReward = 100;
  const operationalDailyLimit = 1;
  const operationalBudget = Math.max(data.desiredActions * operationalReward, 1000);
  const fullDescription = [
    data.description,
    `Quantidade desejada de ações: ${data.desiredActions}.`,
    data.adminNotes ? `Observações para análise: ${data.adminNotes}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const createdCampaign = await db.$transaction(async (tx) => {
    const creationSpent = await spendCompanyTokens(
      company.id,
      rules.campaignCreation,
      "CAMPAIGN_CREATION",
      "Criação de campanha",
      "",
      tx,
    );

    if (!creationSpent) {
      throw new Error("TOKEN_INSUFFICIENT");
    }

    const reviewSpent = await spendCompanyTokens(
      company.id,
      rules.submitForReview,
      "CAMPAIGN_ACTION",
      "Envio de campanha para análise",
      "",
      tx,
    );

    if (!reviewSpent) {
      throw new Error("TOKEN_INSUFFICIENT");
    }

    return tx.campaign.create({
      data: {
        companyId: company.id, companyName: company.tradeName,
        title: data.title, description: fullDescription,
        city: data.city, neighborhood: data.neighborhood,
        category: data.category, socialPlatform: data.socialPlatform,
        contentUrl: data.contentUrl || null, objective: data.objective, rewardPerTask: operationalReward, dailyLimitPerUser: operationalDailyLimit,
        totalBudget: operationalBudget, status: "PAUSED",
        reviewStatus: "UNDER_REVIEW", submittedForReviewAt: new Date(), startDate: new Date(data.startDate), endDate: new Date(data.endDate), tasks: {
          create: {
            title: template.title, description: template.description,
            instructions: data.userInstructions, reward: operationalReward,
            type: template.type, externalUrl: data.contentUrl || null, proofType: template.proofType, requiredWatchSeconds: template.requiredWatchSeconds, status: "PAUSED",
          },
        },
      },
    });
  });

  revalidatePath("/empresa/campanhas");
  revalidatePath("/empresa/dashboard");
  revalidatePath("/empresa/plano");
  revalidatePath("/admin/empresas");
  revalidatePath("/admin/campanhas");

  return { ok: true, message: `Solicitação enviada para análise: ${createdCampaign.title}.` };
}

export async function submitCompanyCampaignForReviewAction(formData: FormData): Promise<ActionState> {
  const company = await requireCompany();

  const parsed = submitReviewSchema.safeParse({
    campaignId: formData.get("campaignId"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Campanha inválida para análise." };
  }

  const campaign = await db.campaign.findFirst({
    where: {
      id: parsed.data.campaignId, companyId: company.id,
    },
  });

  if (!campaign) {
    return { ok: false, message: "Campanha não encontrada." };
  }

  if (campaign.reviewStatus === "UNDER_REVIEW" || campaign.reviewStatus === "APPROVED") { return { ok: false, message: "Esta campanha já está em análise ou aprovada." };
  }

  const rules = tokenCostRules();
  const hasTokens = await canSpendCompanyTokens(company.id, rules.submitForReview);
  if (!hasTokens) {
    return {
      ok: false, message: "Tokens insuficientes para envio. Adicionar tokens ou Fazer upgrade para Premium.",
    };
  }

  await db.$transaction(async (tx) => {
    const spent = await spendCompanyTokens(
      company.id,
      rules.submitForReview,
      "CAMPAIGN_ACTION",
      "Envio de campanha para análise",
      campaign.id,
      tx,
    );

    if (!spent) {
      throw new Error("TOKEN_INSUFFICIENT");
    }

    await tx.campaign.update({
      where: { id: campaign.id },
      data: {
        reviewStatus: "UNDER_REVIEW", submittedForReviewAt: new Date(),
      },
    });
  });

  revalidatePath("/empresa/campanhas");
  revalidatePath("/empresa/dashboard");
  revalidatePath("/empresa/plano");
  revalidatePath("/admin/campanhas");
  revalidatePath("/admin/empresas");

  return { ok: true, message: "Campanha enviada para análise." };
}

export async function requestCompanyUpgradeAction(): Promise<ActionState> {
  await requireCompany();
  return { ok: true, message: "Solicitação de upgrade registrada (mock). Nossa equipe entrará em contato." };
}

export async function requestCompanyTokensTopUpAction(): Promise<ActionState> {
  await requireCompany();
  return { ok: true, message: "Solicitação de tokens registrada (mock)." };
}

export async function submitCompanyCampaignForReviewFormAction(formData: FormData): Promise<void> {
  await submitCompanyCampaignForReviewAction(formData);
}

export async function requestCompanyUpgradeFormAction(): Promise<void> {
  await requestCompanyUpgradeAction();
}

export async function requestCompanyTokensTopUpFormAction(): Promise<void> {
  await requestCompanyTokensTopUpAction();
}
