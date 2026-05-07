import Image from "next/image";
import Link from "next/link";
import { ReactNode, memo } from "react";

import { GAMIFICATION_ASSETS, MissionRarity } from "@/lib/gamification-assets";
import { imgProps } from "@/lib/gamification-image";
import { GT, RARITY_STYLE } from "@/styles/gamification-theme";

export function GamificationShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className={`${GT.bg} min-h-screen pb-[calc(84px+env(safe-area-inset-bottom))] text-white`}>
      <div className="mx-auto grid w-full max-w-7xl gap-3 px-3 pb-3 pt-3 md:grid-cols-[250px_1fr] md:gap-4 md:px-6 md:pt-4">
        <aside className={`${GT.card} hidden p-4 md:sticky md:top-4 md:block md:h-fit`}>
          <p className="text-lg font-black text-white">OKEGANHA</p>
          <nav className="mt-4 space-y-2 text-sm">
            <Link href="/usuario/dashboard" className="block rounded-xl bg-white/10 px-3 py-2">Inicio</Link>
            <Link href="/usuario/missoes" className="block rounded-xl px-3 py-2 hover:bg-white/10">Missoes</Link>
            <Link href="/usuario/carteira" className="block rounded-xl px-3 py-2 hover:bg-white/10">Carteira</Link>
            <Link href="/usuario/perfil" className="block rounded-xl px-3 py-2 hover:bg-white/10">Perfil</Link>
          </nav>
        </aside>
        <main className="space-y-3 md:space-y-4">
          <header className={`${GT.card} sticky top-2 z-20 p-3 md:static md:p-4`}>
            <h1 className={`${GT.title} text-xl md:text-2xl`}>{title}</h1>
            <p className={`${GT.text} text-xs md:text-sm`}>{subtitle}</p>
          </header>
          {children}
        </main>
      </div>
      <BottomUserNav />
    </div>
  );
}

export function BottomUserNav() {
  const cls = "rounded-xl px-2 py-2 active:scale-95 transition-transform";
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#12081f]/95 px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm md:hidden">
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-1 text-center text-[11px] text-[#d6bfef]">
        <Link href="/usuario/dashboard" className={cls}>Inicio</Link>
        <Link href="/usuario/missoes" className={cls}>Missoes</Link>
        <Link href="/usuario/dashboard" className={cls}>Caixa</Link>
        <Link href="/usuario/carteira" className={cls}>Carteira</Link>
        <Link href="/usuario/perfil" className={cls}>Perfil</Link>
      </div>
    </nav>
  );
}

export const XPBar = memo(function XPBar({ xp, nextXp }: { xp: number; nextXp: number }) { const pct = Math.max(0, Math.min(100, Math.round((xp / Math.max(1, nextXp)) * 100))); return <div className="space-y-2"><div className="flex justify-between text-xs text-[#d8c2ef]"><span>XP</span><span>{xp}/{nextXp}</span></div><div className="h-3 overflow-hidden rounded-full bg-[#2a1740]"><div className="h-full bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc]" style={{ width: `${pct}%` }} /></div><Image src={GAMIFICATION_ASSETS.bars.xpFull} alt="xp" width={200} height={20} className="h-4 w-auto opacity-80" {...imgProps("bar")}/></div>; });
export const EnergyBar = memo(function EnergyBar({ energy, maxEnergy }: { energy: number; maxEnergy: number }) { const pct = Math.max(0, Math.min(100, Math.round((energy / Math.max(1, maxEnergy)) * 100))); return <div className="space-y-2"><div className="flex justify-between text-xs text-[#d8c2ef]"><span>Energia</span><span>{energy}/{maxEnergy}</span></div><div className="h-3 overflow-hidden rounded-full bg-[#122238]"><div className="h-full bg-gradient-to-r from-[#33d6ff] to-[#4f73ff]" style={{ width: `${pct}%` }} /></div><Image src={GAMIFICATION_ASSETS.bars.energyFull} alt="energy" width={200} height={20} className="h-4 w-auto opacity-80" {...imgProps("bar")}/></div>; });
export const LevelBadge = memo(function LevelBadge({ level }: { level: number }) { return <div className="inline-flex items-center gap-2 rounded-xl border border-[#ff7ad2]/40 bg-[#2a1239] px-3 py-1 text-xs font-bold"><Image src={GAMIFICATION_ASSETS.badges.level} alt="nivel" width={18} height={18} {...imgProps("badge")}/>Nivel {level}</div>; });
export const ProfileCard = memo(function ProfileCard({ name }: { name: string }) { return <div className={`${GT.cardSoft} flex min-h-[62px] items-center gap-3 p-3`}><Image src={GAMIFICATION_ASSETS.profile.avatar} alt="avatar" width={42} height={42} className="rounded-full" {...imgProps("avatar", true)}/><div className="min-w-0"><p className="text-xs text-[#b89ed8]">Perfil</p><p className="truncate font-bold">{name}</p></div></div>; });
export const WalletCard = memo(function WalletCard({ balance }: { balance: string }) { return <div className={`${GT.card} min-h-[112px] p-4`}><p className="text-sm text-[#bfa8de]">Carteira</p><p className="text-2xl font-black md:text-3xl">{balance}</p></div>; });
export const StatsCard = memo(function StatsCard({ label, value }: { label: string; value: string }) { return <article className={`${GT.cardSoft} min-h-[94px] p-4`}><p className="text-xs text-[#b79bd8]">{label}</p><p className="text-xl font-black md:text-2xl">{value}</p></article>; });
export const RewardChest = memo(function RewardChest() { return <div className={`${GT.cardSoft} min-h-[120px] p-4`}><Image src={GAMIFICATION_ASSETS.rewards.chestOpen} alt="chest" width={56} height={56} {...imgProps("icon")}/><p className="mt-2 text-sm text-[#d0b7ec]">Caixa misteriosa</p></div>; });
export const DailyRewardCard = memo(function DailyRewardCard() { return <div className={`${GT.cardSoft} min-h-[120px] p-4`}><p className="text-sm">Recompensa diaria</p><p className="text-xs text-[#c2a9df]">Volte amanha para coletar.</p></div>; });
export const RankingCard = memo(function RankingCard() { return <div className={`${GT.cardSoft} min-h-[120px] p-4`}><p className="text-sm">Ranking</p><p className="text-xs text-[#c2a9df]">Suba para o top semanal.</p></div>; });

export const MissionCard = memo(function MissionCard({ title, reward, href, rarity = "COMMON" }: { title: string; reward: string; href: string; rarity?: MissionRarity }) {
  return (
    <article className={`${GT.cardSoft} ${RARITY_STYLE[rarity]} border p-4 transition hover:-translate-y-0.5 active:scale-[0.99]`}>
      <p className="inline-block rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold">{rarity}</p>
      <h3 className="mt-2 line-clamp-2 text-base font-extrabold">{title}</h3>
      <p className="text-sm text-[#c8b0e5]">{reward}</p>
      <Link href={href} className={`${GT.neonBtn} mt-3 inline-block min-h-[44px] px-4 py-3 text-xs`}>Comecar</Link>
    </article>
  );
});

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return <div className="space-y-3">{Array.from({ length: rows }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/10" />)}</div>;
}
