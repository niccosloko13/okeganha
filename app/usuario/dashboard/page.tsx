import Link from "next/link";
import Image from "next/image";

import { EnergyBar, GamificationShell, LevelBadge, ProfileCard, RewardChest, XPBar } from "@/components/gamification";
import { PremiumStateCard } from "@/components/gamification/PremiumStateCard";
import { requireRegularUser } from "@/lib/auth";
import { getWalletAvailableBalance } from "@/lib/campaign-rules";
import { db } from "@/lib/db";
import { GAMIFICATION_ASSETS } from "@/lib/gamification-assets";
import { formatMoney } from "@/lib/money";

function rarityFromReward(value: number) {
  if (value >= 1200) return "MYTHIC";
  if (value >= 800) return "LEGENDARY";
  if (value >= 500) return "EPIC";
  if (value >= 300) return "RARE";
  return "COMMON";
}

export default async function DashboardPage() {
  const user = await requireRegularUser();
  const [balance, pendingTasks, approvedTasks, latestMission, weekApproved] = await Promise.all([
    getWalletAvailableBalance(user.id),
    db.taskSubmission.count({ where: { userId: user.id, status: "PENDING" } }),
    db.taskSubmission.count({ where: { userId: user.id, status: "APPROVED" } }),
    db.task.findFirst({
      where: { status: "ACTIVE", campaign: { status: "ACTIVE", reviewStatus: "APPROVED" } },
      include: { campaign: { select: { title: true, socialPlatform: true } } },
      orderBy: { reward: "desc" },
    }),
    db.taskSubmission.findMany({ where: { userId: user.id, status: "APPROVED" }, orderBy: { submittedAt: "desc" }, take: 7, select: { rewardAmount: true } }),
  ]);

  const xpToNext = Math.max(0, 15500 - user.xp);
  const saqueTarget = 2000;
  const saqueProgress = Math.max(0, Math.min(100, Math.round((balance / saqueTarget) * 100)));
  const streakDays = 3;
  const xpToday = Math.min(220, approvedTasks * 24);
  const weekEarnings = weekApproved.reduce((sum, row) => sum + row.rewardAmount, 0);
  const missionRarity = latestMission ? rarityFromReward(latestMission.reward) : "COMMON";
  const missionEnergy = latestMission ? Math.max(20, Math.round(latestMission.reward / 20)) : 30;
  const missionXp = latestMission ? Math.max(12, Math.round(latestMission.reward / 8)) : 20;

  return (
    <GamificationShell title="Inicio" subtitle="Sistema ao vivo: progresso, recompensas e missao ideal para agora.">
      <section className="grid gap-3 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-3xl border border-[#6f45a3] bg-[#1a1030]/90 p-4 shadow-[0_24px_50px_-32px_rgba(181,89,255,0.8)] backdrop-blur-md md:p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
            <div>
              <ProfileCard name={user.name} />
              <div className="mt-3"><XPBar xp={user.xp} nextXp={15500} /></div>
              <div className="mt-3"><EnergyBar energy={user.energy} maxEnergy={user.maxEnergy} /></div>
              <p className="mt-3 text-xs text-[#ccb3e9]">Faltam <strong>{xpToNext} XP</strong> para o proximo nivel.</p>
            </div>
            <div className="space-y-2">
              <LevelBadge level={user.level} />
              <div className="rounded-xl border border-[#7b4eb1] bg-[#24183f] p-2 text-center text-xs text-[#e6d6fa]">
                Streak diaria
                <div className="mt-1 flex items-center justify-center gap-1">
                  <Image src={GAMIFICATION_ASSETS.effects.streak} alt="streak" width={42} height={42} className="h-8 w-8 object-contain" loading="lazy" />
                  <span className="text-lg font-black">{streakDays} dias</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href="/usuario/missoes" className="ok-pulse min-h-[48px] rounded-xl bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc] px-4 py-3 text-center text-sm font-semibold text-white active:scale-95">Subir de nivel</Link>
            <Link href="/usuario/carteira" className="min-h-[48px] rounded-xl border border-[#6f45a3] bg-[#201339] px-4 py-3 text-center text-sm font-semibold text-[#e4d1ff] active:scale-95">Ver carteira</Link>
          </div>
        </div>

        <div className="rounded-3xl border border-[#6f45a3] bg-[#1a1030]/90 p-4 shadow-[0_24px_50px_-32px_rgba(181,89,255,0.8)] backdrop-blur-md">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#d8c2ef]">Carteira ao vivo</p>
            <Image src={GAMIFICATION_ASSETS.rewards.coin} alt="moeda" width={110} height={110} className="h-20 w-20 object-contain" loading="lazy" />
          </div>
          <p className="text-3xl font-black text-white md:text-4xl">{formatMoney(balance)}</p>
          <p className="mt-1 text-xs text-[#cdb7e9]">XP hoje: +{xpToday}</p>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#2a1740]"><div className="h-full bg-gradient-to-r from-[#33d6ff] to-[#4f73ff]" style={{ width: `${saqueProgress}%` }} /></div>
          <p className="mt-1 text-[11px] text-[#cbb4e8]">Progresso para saque: {saqueProgress}%</p>
          <Link href="/usuario/saques" className="mt-3 inline-block min-h-[44px] rounded-xl bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc] px-4 py-3 text-xs font-semibold text-white active:scale-95">Sacar recompensa</Link>
        </div>
      </section>

      <section className="rounded-3xl border border-[#7b4eb1] bg-[#1b1132]/92 p-4 shadow-[0_24px_50px_-32px_rgba(181,89,255,0.8)] md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-[#f2e8ff]">Missao recomendada para voce</p>
          <span className="rounded-lg border border-[#8a59c2] bg-[#2a1845] px-2 py-1 text-[10px] font-black text-[#ffe3f5]">{missionRarity}</span>
        </div>

        {latestMission ? (
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h3 className="text-lg font-black text-white">{latestMission.title}</h3>
              <p className="text-xs text-[#d4bdea]">Plataforma: {latestMission.campaign.socialPlatform}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-md bg-[#2a1845] px-2 py-1 text-[#f8e9ff]">Recompensa {formatMoney(latestMission.reward)}</span>
                <span className="rounded-md bg-[#1d2445] px-2 py-1 text-[#cde1ff]">Energia {missionEnergy}</span>
                <span className="rounded-md bg-[#2a1845] px-2 py-1 text-[#f8e9ff]">XP +{missionXp}</span>
              </div>
            </div>
            <Link href={`/usuario/tarefas/${latestMission.id}`} className="ok-pulse min-h-[50px] rounded-xl bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc] px-5 py-3 text-center text-sm font-bold text-white active:scale-95">Comecar</Link>
          </div>
        ) : (
          <PremiumStateCard title="Sem missao no momento" description="Novas oportunidades estao chegando." type="empty" />
        )}
      </section>

      <section className="grid gap-3 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative overflow-hidden rounded-3xl border border-[#6f45a3] bg-[#1a1030]/90 p-4">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,79,176,0.22),transparent_45%)]" />
          <RewardChest />
          <div className="mt-2 flex items-center justify-between text-xs text-[#cdb7e9]"><span>Faltam 3 missoes para abrir</span><span>Raridade: EPIC</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#2a1740]"><div className="h-full w-1/3 bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc]" /></div>
        </div>

        <div className="grid gap-3">
          <PremiumStateCard title="Atividade recente" description={`${pendingTasks} envio(s) em analise e ${approvedTasks} aprovados.`} type="review" />
          <PremiumStateCard title="Ultima recompensa" description={`Voc acumulou ${formatMoney(weekEarnings)} nesta semana.`} type="completed" />
          <PremiumStateCard title="Booster ativo" description={user.energy < Math.round(user.maxEnergy * 0.3) ? "Booster recomendado para recuperar energia." : "Booster de XP pronto para uso nas proximas missoes."} type="energy_low" />
        </div>
      </section>
    </GamificationShell>
  );
}
