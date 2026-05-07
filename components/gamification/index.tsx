import Image from "next/image";
import { GAMIFICATION_ASSETS } from "@/lib/gamification-assets";

export function XPBar({ xp, nextXp }: { xp: number; nextXp: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((xp / Math.max(1, nextXp)) * 100)));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-[#6f4e93]"><span>XP</span><span>{xp}/{nextXp}</span></div>
      <div className="relative h-4 overflow-hidden rounded-full bg-[#f2e4ff]">
        <div className="h-full bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc]" style={{ width: `${pct}%` }} />
      </div>
      <Image src={GAMIFICATION_ASSETS.xpFull} alt="xp" width={220} height={24} className="h-5 w-auto opacity-80" />
    </div>
  );
}

export function EnergyBar({ energy, maxEnergy }: { energy: number; maxEnergy: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((energy / Math.max(1, maxEnergy)) * 100)));
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-[#6f4e93]"><span>Energia</span><span>{energy}/{maxEnergy}</span></div>
      <div className="relative h-4 overflow-hidden rounded-full bg-[#e8f0ff]"><div className="h-full bg-gradient-to-r from-[#33d6ff] to-[#4f73ff]" style={{ width: `${pct}%` }} /></div>
      <Image src={GAMIFICATION_ASSETS.energyFull} alt="energia" width={220} height={24} className="h-5 w-auto opacity-80" />
    </div>
  );
}

export function StatsCard({ label, value }: { label: string; value: string }) { return <article className="rounded-2xl border border-[#ead6ff] bg-white/80 p-4"><p className="text-xs text-[#8162a5]">{label}</p><p className="text-2xl font-extrabold text-[#3a1658]">{value}</p></article>; }
export function LevelBadge({ level }: { level: number }) { return <div className="rounded-xl border border-[#ffd2f0] bg-[#fff2fb] px-3 py-2 text-sm font-bold text-[#8c2e74]">Nivel {level}</div>; }
export function ProfileCard({ name }: { name: string }) { return <div className="rounded-2xl border border-[#ead6ff] bg-white/75 p-4"><p className="text-sm text-[#7a5a99]">Perfil</p><p className="text-lg font-extrabold text-[#3a1658]">{name}</p></div>; }
export function WalletCard({ balance }: { balance: string }) { return <div className="rounded-2xl border border-[#ead6ff] bg-white/75 p-4"><p className="text-sm text-[#7a5a99]">Carteira</p><p className="text-2xl font-extrabold text-[#3a1658]">{balance}</p></div>; }
export function DailyRewardCard() { return <div className="rounded-2xl border border-[#ffe0f4] bg-[#fff8fd] p-4 text-sm text-[#7d3d92]">Recompensa diaria em breve</div>; }
export function RankingCard() { return <div className="rounded-2xl border border-[#ead6ff] bg-white/75 p-4 text-sm text-[#6f4e93]">Ranking semanal em breve</div>; }
export function RewardChest() { return <div className="rounded-2xl border border-[#ead6ff] bg-white/75 p-4 text-sm text-[#6f4e93]">Caixa misteriosa bloqueada</div>; }
export function MissionCard({ title, reward, href }: { title: string; reward: string; href: string }) { return <article className="rounded-2xl border border-[#ead6ff] bg-white/85 p-4"><p className="text-base font-bold text-[#3a1658]">{title}</p><p className="mt-1 text-sm text-[#7a5a99]">{reward}</p><a href={href} className="mt-3 inline-block rounded-xl bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc] px-3 py-2 text-xs font-semibold text-white">Comecar</a></article>; }
