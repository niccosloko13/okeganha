import type { CampaignObjective } from "@prisma/client";

const BASE_CREATION_TOKENS = 20;
const COST_BY_OBJECTIVE: Partial<Record<CampaignObjective, number>> = {
  WATCH_VIDEO: 5, VIEW_STORY: 3,
  LIKE_POST: 5, COMMENT_POST: 5,
  FOLLOW_PROFILE: 5, REVIEW_BUSINESS: 8,
  CHECKIN_BUSINESS: 8, VISIT_LOCAL: 8,
  OTHER: 5,
};

export function getActionTokenCost(objective: CampaignObjective): number {
  return COST_BY_OBJECTIVE[objective] ?? 5;
}

export function estimateCampaignTokens(params: { objective: CampaignObjective; quantity: number }): number {
  const qty = Math.max(0, Math.floor(params.quantity));
  const actionCost = getActionTokenCost(params.objective);
  return BASE_CREATION_TOKENS + qty * actionCost;
}

export const campaignTokenRules = {
  baseCreation: BASE_CREATION_TOKENS,
};
