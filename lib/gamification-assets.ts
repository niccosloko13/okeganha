type AssetVariant = { webp: string; png: string };
const pick = (asset: AssetVariant) => asset.webp;

export const GAMIFICATION_ASSETS = {
  profile: {
    avatar: "/gamification/profile/avatar.png",
  },
  bars: {
    xpFull: "/gamification/bars/barraxp_cheia.png",
    xpEmpty: "/gamification/bars/barraxp_vazia.png",
    energyFull: "/gamification/bars/barraenergia_cheia.png",
    energyEmpty: "/gamification/bars/barraenergia_vazia2.png",
  },
  badges: {
    level: pick({ webp: "/gamification/badges/nivel.webp", png: "/gamification/badges/nivel.png" }),
    verified: pick({ webp: "/gamification/badges/verificado.webp", png: "/gamification/badges/verificado.png" }),
    crown: pick({ webp: "/gamification/badges/crown-vip.webp", png: "/gamification/badges/crown-vip.png" }),
    rank: pick({ webp: "/gamification/badges/ranking-badge.webp", png: "/gamification/badges/ranking-badge.png" }),
    trophy: pick({ webp: "/gamification/badges/trofeu.webp", png: "/gamification/badges/trofeu.png" }),
  },
  effects: {
    particles: pick({ webp: "/gamification/effects/particles_glow.webp", png: "/gamification/effects/particles_glow.png" }),
    streak: pick({ webp: "/gamification/effects/streak-fire.webp", png: "/gamification/effects/streak-fire.png" }),
  },
  cards: {
    glass: pick({ webp: "/gamification/cards/CARDGLASSBASE.webp", png: "/gamification/cards/CARDGLASSBASE.png" }),
    cta: pick({ webp: "/gamification/cards/botaoprincipal.webp", png: "/gamification/cards/botaoprincipal.png" }),
  },
  rewards: {
    energy: pick({ webp: "/gamification/rewards/energia.webp", png: "/gamification/rewards/energia.png" }),
    xp: pick({ webp: "/gamification/rewards/xp.webp", png: "/gamification/rewards/xp.png" }),
    chest: pick({ webp: "/gamification/rewards/caixa.webp", png: "/gamification/rewards/caixa.png" }),
    chestOpen: pick({ webp: "/gamification/rewards/bau.webp", png: "/gamification/rewards/bau.png" }),
    coin: pick({ webp: "/gamification/rewards/moeda.webp", png: "/gamification/rewards/moeda.png" }),
    locked: pick({ webp: "/gamification/rewards/locked-reward.webp", png: "/gamification/rewards/locked-reward.png" }),
  },
  platforms: {
    instagram: "/gamification/platforms/instagrammissao.png",
    tiktok: "/gamification/platforms/tiktokmissao.png",
    youtube: "/gamification/platforms/youtube.png",
    google: "/gamification/platforms/googlerewards.png",
  },
} as const;

export type MissionRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";

export function getLevelBadgeAsset(level: number): string {
  const safeLevel = Math.max(1, Math.min(99, Math.floor(level || 1)));
  if (safeLevel === 1) return "/gamification/badges/nivel.png";
  return GAMIFICATION_ASSETS.badges.level;
}
