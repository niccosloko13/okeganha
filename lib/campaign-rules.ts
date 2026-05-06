import { db } from "@/lib/db";
import { getEndOfDay, getStartOfDay, isSameWeekday } from "@/lib/dates";
import { walletSignedAmount } from "@/lib/money";

export async function hasTaskSubmissionToday(userId: string, taskId: string) {
  const start = getStartOfDay();
  const end = getEndOfDay();

  const count = await db.taskSubmission.count({
    where: {
      userId,
      taskId,
      submittedAt: {
        gte: start,
        lte: end,
      },
    },
  });

  return count > 0;
}

export async function hasReachedCampaignDailyLimit(userId: string, campaignId: string, dailyLimit: number) {
  const start = getStartOfDay();
  const end = getEndOfDay();

  const count = await db.taskSubmission.count({
    where: {
      userId,
      campaignId,
      submittedAt: {
        gte: start,
        lte: end,
      },
    },
  });

  return count >= dailyLimit;
}

export async function getWalletAvailableBalance(userId: string): Promise<number> {
  const txs = await db.walletTransaction.findMany({
    where: { userId },
    select: { amount: true, type: true },
  });

  return txs.reduce((acc, tx) => acc + walletSignedAmount(tx.type, tx.amount), 0);
}

export function canRequestWithdrawalToday(now = new Date()): boolean {
  return isSameWeekday(now, 5);
}

