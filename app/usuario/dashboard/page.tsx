import Link from "next/link";

import { DailyRewardCard, EnergyBar, GamificationShell, LevelBadge, ProfileCard, RankingCard, RewardChest, StatsCard, WalletCard, XPBar } from "@/components/gamification";
import { PremiumStateCard } from "@/components/gamification/PremiumStateCard";
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
    <GamificationShell title="Inicio" subtitle="Continue evoluindo e ganhe recompensas.">
      <section className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2 rounded-3xl border border-[#6f45a3] bg-[#1a1030]/85 p-4 backdrop-blur-md md:p-5">
          <div className="mb-3 flex items-center justify-between"><ProfileCard name={user.name} /><LevelBadge level={user.level} /></div>
          <XPBar xp={user.xp} nextXp={15500} />
          <div className="mt-4"><EnergyBar energy={user.energy} maxEnergy={user.maxEnergy} /></div>
          <div className="mt-4 grid grid-cols-2 gap-2"><Link href="/usuario/missoes" className="min-h-[44px] rounded-xl bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc] px-4 py-3 text-center text-sm font-semibold text-white active:scale-95">Ir para missoes</Link><Link href="/usuario/carteira" className="min-h-[44px] rounded-xl border border-[#6f45a3] bg-[#201339] px-4 py-3 text-center text-sm font-semibold text-[#e4d1ff] active:scale-95">Carteira</Link></div>
        </div>
        <WalletCard balance={formatMoney(balance)} />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <StatsCard label="Missoes ativas" value={String(availableCampaigns)} />
        <StatsCard label="Em analise" value={String(pendingTasks)} />
        <StatsCard label="Aprovadas" value={String(approvedTasks)} />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <DailyRewardCard />
        <RewardChest />
        <RankingCard />
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <PremiumStateCard title="Missao concluida" description="Sua ultima missao foi enviada e esta em analise." type="review" />
        <PremiumStateCard title="Perfil verificado" description={user.isVerifiedProfile ? "Status premium ativo." : "Complete etapas para desbloquear beneficios."} type={user.isVerifiedProfile ? "completed" : "profile_incomplete"} />
      </section>
    </GamificationShell>
  );
}
