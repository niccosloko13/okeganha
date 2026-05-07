import { SocialPlatform, type User } from "@prisma/client";

import { db } from "@/lib/db";

type MissionActionType =
  | "LIKE"
  | "FOLLOW"
  | "COMMENT"
  | "WATCH_SHORT"
  | "WATCH_LONG"
  | "VISIT"
  | "OTHER";

const LEVEL_XP_THRESHOLDS: Array<{ level: number; minXp: number }> = [
  { level: 1, minXp: 0 },
  { level: 2, minXp: 300 },
  { level: 3, minXp: 900 },
  { level: 4, minXp: 1800 },
  { level: 5, minXp: 3000 },
  { level: 6, minXp: 4500 },
  { level: 7, minXp: 6500 },
  { level: 8, minXp: 9000 },
  { level: 9, minXp: 12000 },
  { level: 10, minXp: 15500 },
];

const BASE_ENERGY = 1000;

const XP_REWARD_TABLE: Record<string, number> = {
  "INSTAGRAM:LIKE": 12,
  "INSTAGRAM:FOLLOW": 20,
  "INSTAGRAM:COMMENT": 28,
  "INSTAGRAM:WATCH_SHORT": 18,

  "TIKTOK:LIKE": 10,
  "TIKTOK:FOLLOW": 18,
  "TIKTOK:COMMENT": 26,
  "TIKTOK:WATCH_SHORT": 16,

  "FACEBOOK:LIKE": 8,
  "FACEBOOK:FOLLOW": 15,
  "FACEBOOK:COMMENT": 22,
  "FACEBOOK:WATCH_SHORT": 14,

  "YOUTUBE:LIKE": 18,
  "YOUTUBE:FOLLOW": 30,
  "YOUTUBE:COMMENT": 40,
  "YOUTUBE:WATCH_LONG": 50,
};

const ENERGY_COST_TABLE: Record<string, number> = {
  "INSTAGRAM:LIKE": 24,
  "INSTAGRAM:FOLLOW": 30,
  "INSTAGRAM:COMMENT": 40,
  "INSTAGRAM:WATCH_SHORT": 32,

  "TIKTOK:LIKE": 22,
  "TIKTOK:FOLLOW": 28,
  "TIKTOK:COMMENT": 38,
  "TIKTOK:WATCH_SHORT": 30,

  "FACEBOOK:LIKE": 20,
  "FACEBOOK:FOLLOW": 26,
  "FACEBOOK:COMMENT": 34,
  "FACEBOOK:WATCH_SHORT": 28,

  "YOUTUBE:LIKE": 30,
  "YOUTUBE:FOLLOW": 40,
  "YOUTUBE:COMMENT": 52,
  "YOUTUBE:WATCH_LONG": 60,
};

function missionKey(platform: SocialPlatform, actionType: MissionActionType) {
  return `${platform}:${actionType}`;
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateMaxEnergy(user: Pick<User, "isVerifiedProfile" | "level">): number {
  if (user.level >= 10) return 2200;
  if (user.level >= 8) return 2000;
  if (user.level >= 6) return 1800;
  if (user.isVerifiedProfile) return 1400;
  return BASE_ENERGY;
}

export function getLevelFromXp(xp: number): number {
  let level = 1;
  for (const threshold of LEVEL_XP_THRESHOLDS) {
    if (xp >= threshold.minXp) {
      level = threshold.level;
    }
  }
  return level;
}

export function getXpForNextLevel(level: number): number | null {
  const currentLevel = Math.max(1, level);
  const next = LEVEL_XP_THRESHOLDS.find((item) => item.level === currentLevel + 1);
  return next ? next.minXp : null;
}

export function getEnergyCostForMission(platform: SocialPlatform, actionType: MissionActionType, durationSeconds?: number): number {
  const base = ENERGY_COST_TABLE[missionKey(platform, actionType)] ?? 30;
  if (durationSeconds && durationSeconds > 0) {
    return base + Math.min(20, Math.floor(durationSeconds / 15));
  }
  return base;
}

export function getXpRewardForMission(platform: SocialPlatform, actionType: MissionActionType, durationSeconds?: number): number {
  const base = XP_REWARD_TABLE[missionKey(platform, actionType)] ?? 10;
  if (durationSeconds && durationSeconds >= 60) {
    return base + Math.min(20, Math.floor(durationSeconds / 60) * 4);
  }
  return base;
}

export async function refillDailyEnergy(user: Pick<User, "id" | "level" | "isVerifiedProfile" | "lastEnergyRefill">) {
  const now = new Date();
  const last = user.lastEnergyRefill ? startOfDay(user.lastEnergyRefill) : null;
  const today = startOfDay(now);

  if (last && last.getTime() === today.getTime()) {
    return null;
  }

  const maxEnergy = calculateMaxEnergy(user);
  return db.user.update({
    where: { id: user.id },
    data: {
      maxEnergy,
      energy: maxEnergy,
      lastEnergyRefill: now,
    },
  });
}

export function canStartMission(user: Pick<User, "energy">, energyCost: number): boolean {
  return user.energy >= Math.max(0, energyCost);
}

export async function applyMissionStartCost(userId: string, energyCost: number) {
  const cost = Math.max(0, energyCost);

  return db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, energy: true },
    });

    if (!user) return { ok: false as const, reason: "USER_NOT_FOUND" as const };
    if (user.energy < cost) return { ok: false as const, reason: "INSUFFICIENT_ENERGY" as const };

    const updated = await tx.user.update({
      where: { id: userId },
      data: { energy: { decrement: cost } },
      select: { id: true, energy: true },
    });

    return { ok: true as const, user: updated };
  });
}

export async function applyMissionApprovalReward(userId: string, xpReward: number) {
  const reward = Math.max(0, xpReward);

  return db.$transaction(async (tx) => {
    const updatedXp = await tx.user.update({
      where: { id: userId },
      data: { xp: { increment: reward } },
      select: { id: true, xp: true, level: true },
    });

    const nextLevel = getLevelFromXp(updatedXp.xp);

    if (nextLevel !== updatedXp.level) {
      const leveled = await tx.user.update({
        where: { id: userId },
        data: { level: nextLevel },
        select: { id: true, xp: true, level: true },
      });
      return { ok: true as const, user: leveled };
    }

    return { ok: true as const, user: updatedXp };
  });
}
