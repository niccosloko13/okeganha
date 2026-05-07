import { MissionRarity } from "@/lib/gamification-assets";

export const GT = {
  bg: "bg-[radial-gradient(circle_at_20%_10%,rgba(194,72,255,0.25),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(255,79,176,0.2),transparent_30%),linear-gradient(180deg,#13061f_0%,#0d0417_100%)]",
  card: "rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_20px_60px_-28px_rgba(183,74,255,0.6)]",
  cardSoft: "rounded-2xl border border-[#4d2b71] bg-[#1a0d2a]/80 backdrop-blur-lg",
  title: "text-[#f5eaff] font-extrabold tracking-tight",
  text: "text-[#d1b8ef]",
  neonBtn: "rounded-2xl px-4 py-2 font-semibold text-white bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc] shadow-[0_12px_26px_-12px_rgba(255,79,176,0.8)] transition hover:scale-[1.02]",
};

export const RARITY_STYLE: Record<MissionRarity, string> = {
  COMMON: "border-[#4d3f63] shadow-[0_0_0_1px_rgba(133,114,162,0.25)]",
  RARE: "border-[#4a66ff] shadow-[0_0_24px_-10px_rgba(74,102,255,0.9)]",
  EPIC: "border-[#b15bff] shadow-[0_0_24px_-10px_rgba(177,91,255,0.9)]",
  LEGENDARY: "border-[#ff8a2b] shadow-[0_0_24px_-10px_rgba(255,138,43,0.95)]",
  MYTHIC: "border-[#ff4fb0] shadow-[0_0_28px_-10px_rgba(255,79,176,0.95)]",
};
