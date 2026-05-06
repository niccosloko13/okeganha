import type { CompanyPlan, CompanyTokenLedgerType, Prisma, PrismaClient } from "@prisma/client";

import { db } from "@/lib/db";

type DBLike = PrismaClient | Prisma.TransactionClient;

type PlanLimits = {
  monthlyTokens: number;
  activeCampaignLimit: number;
  label: string;
};

export function getPlanLimits(plan: CompanyPlan): PlanLimits {
  switch (plan) {
    case "FREE":
      return { monthlyTokens: 50, activeCampaignLimit: 1, label: "Free" };
    case "BASIC":
      return { monthlyTokens: 300, activeCampaignLimit: 3, label: "Basic" };
    case "PREMIUM":
      return { monthlyTokens: 1500, activeCampaignLimit: 15, label: "Premium" };
    case "ENTERPRISE":
      return { monthlyTokens: 5000, activeCampaignLimit: 9999, label: "Enterprise" };
    default:
      return { monthlyTokens: 50, activeCampaignLimit: 1, label: "Free" };
  }
}

export async function getCompanyTokenBalance(companyId: string): Promise<number> {
  const company = await db.company.findUnique({ where: { id: companyId }, select: { tokensBalance: true } });
  return company?.tokensBalance ?? 0;
}

export async function canSpendCompanyTokens(companyId: string, amount: number): Promise<boolean> {
  const balance = await getCompanyTokenBalance(companyId);
  return balance >= amount;
}

export async function spendCompanyTokens(
  companyId: string, amount: number,
  type: CompanyTokenLedgerType, description: string,
  referenceId: string, tx: DBLike,
): Promise<boolean> {
  const client = tx ?? db;

  const company = await client.company.findUnique({
    where: { id: companyId },
    select: { tokensBalance: true },
  });

  if (!company || company.tokensBalance < amount) {
    return false;
  }

  await client.company.update({
    where: { id: companyId },
    data: {
      tokensBalance: { decrement: amount },
      tokensUsedThisCycle: { increment: amount },
    },
  });

  await client.companyTokenLedger.create({
    data: {
      companyId,
      type, amount: -Math.abs(amount),
      description, referenceId: referenceId ?? null,
    },
  });

  return true;
}

export async function grantMonthlyTokens(companyId: string, tx: DBLike): Promise<void> {
  const client = tx ?? db;
  const company = await client.company.findUnique({ where: { id: companyId } });
  if (!company) return;

  const limits = getPlanLimits(company.plan);
  const now = new Date();
  const next = new Date(now);
  next.setMonth(next.getMonth() + 1);

  await client.company.update({
    where: { id: companyId },
    data: {
      tokensBalance: { increment: limits.monthlyTokens },
      tokensMonthlyLimit: limits.monthlyTokens, tokensUsedThisCycle: 0,
      billingCycleStart: now, billingCycleEnd: next,
    },
  });

  await client.companyTokenLedger.create({
    data: {
      companyId,
      type: "MONTHLY_GRANT", amount: limits.monthlyTokens, description: `Crédito mensal do plano ${limits.label}`,
    },
  });
}

export function tokenCostRules() {
  return {
    campaignCreation: 20, submitForReview: 10,
    approvedAction: 5, duplicateCampaign: 10, advancedReport: 15,
  };
}
