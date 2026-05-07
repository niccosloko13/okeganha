import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { DailyRewardCard, EnergyBar, LevelBadge, ProfileCard, RankingCard, RewardChest, StatsCard, WalletCard, XPBar } from "@/components/gamification";
import { requireRegularUser } from "@/lib/auth";
import { getWalletAvailableBalance } from "@/lib/campaign-rules";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export default async function DashboardPage() {
  const user = await requireRegularUser();
  const [availableCampaigns, pendingTasks, approvedTasks, balance] = await Promise.all([
    db.campaign.count({ where: { status: "ACTIVE", reviewStatus: "APPROVED" } }),
    db.taskSubmission.count({ where: { userId: user.id, status: "PENDING" } }),
    db.taskSubmission.count({ where: { userId: user.id, status: "APPROVED" } }),
    getWalletAvailableBalance(user.id),
  ]);

  return (
    <AppShell title="Game Hub" subtitle="Sua jornada gamificada no OKEGANHA.">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-3xl border border-[#d9b6ff] bg-white/70 p-5 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between"><ProfileCard name={user.name} /><LevelBadge level={user.level} /></div>
          <XPBar xp={user.xp} nextXp={15500} />
          <div className="mt-4"><EnergyBar energy={user.energy} maxEnergy={user.maxEnergy} /></div>
          <div className="mt-4 flex gap-2"><Link href="/usuario/missoes" className="rounded-xl bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc] px-4 py-2 text-sm font-semibold text-white">Ir para missoes</Link><Link href="/usuario/carteira" className="rounded-xl border border-[#d9b6ff] bg-white px-4 py-2 text-sm font-semibold text-[#643394]">Carteira</Link></div>
        </div>
        <WalletCard balance={formatMoney(balance)} />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <StatsCard label="Campanhas" value={String(availableCampaigns)} />
        <StatsCard label="Pendentes" value={String(pendingTasks)} />
        <StatsCard label="Aprovadas" value={String(approvedTasks)} />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <DailyRewardCard />
        <RewardChest />
        <RankingCard />
      </section>
    </AppShell>
  );
}
