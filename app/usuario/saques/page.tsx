import Link from "next/link";

import { WithdrawalForm } from "@/components/carteira/WithdrawalForm";
import { EnergyBar, GamificationShell, StatsCard, WalletCard, XPBar } from "@/components/gamification";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { IdentityVerificationCard } from "@/components/usuario/IdentityVerificationCard";
import { requireUser } from "@/lib/auth";
import { getWalletAvailableBalance } from "@/lib/campaign-rules";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

export default async function SaquesPage() {
  const user = await requireUser();
  const [withdrawals, available] = await Promise.all([
    db.withdrawalRequest.findMany({ where: { userId: user.id }, orderBy: { requestedAt: "desc" }, take: 10 }),
    getWalletAvailableBalance(user.id),
  ]);

  const missingPayoutData = !user.onboardingCompleted || !user.cpf || !user.pixKey || !user.bankName;
  const canWithdraw = !missingPayoutData && user.identityVerificationStatus === "VERIFIED";

  return (
    <GamificationShell title="Saques" subtitle="Seguranca, analise e historico de recompensas.">
      <section className="grid gap-3 md:grid-cols-3">
        <WalletCard balance={formatMoney(available)} />
        <div className="rounded-2xl border border-[#6f45a3] bg-[#1a1030]/85 p-4 backdrop-blur-md"><XPBar xp={user.xp} nextXp={15500} /></div>
        <div className="rounded-2xl border border-[#6f45a3] bg-[#1a1030]/85 p-4 backdrop-blur-md"><EnergyBar energy={user.energy} maxEnergy={user.maxEnergy} /></div>
      </section>

      {!canWithdraw ? (
        <section className="rounded-2xl border border-[#7f4ab6] bg-[#20143a]/85 p-4">
          <h2 className="text-lg font-extrabold text-white">Liberacao de saque pendente</h2>
          <p className="mt-1 text-sm text-[#d7c2f1]">Complete cadastro, Pix e verificacao para sacar.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/usuario/completar-cadastro" className="rounded-xl bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc] px-4 py-2 text-sm font-semibold text-white">Completar cadastro</Link>
            <Link href="/usuario/perfil" className="rounded-xl border border-[#7f4ab6] bg-[#241640] px-4 py-2 text-sm font-semibold text-[#e2ccff]">Atualizar Pix</Link>
          </div>
        </section>
      ) : (
        <WithdrawalForm available={available} pixKey={user.pixKey ?? ""} />
      )}

      <section className="grid gap-3 md:grid-cols-3">
        <StatsCard label="Status identidade" value={user.identityVerificationStatus} />
        <StatsCard label="Onboarding" value={user.onboardingCompleted ? "COMPLETO" : "PENDENTE"} />
        <StatsCard label="Saques" value={String(withdrawals.length)} />
      </section>

      <IdentityVerificationCard status={user.identityVerificationStatus} />

      <section className="space-y-2 rounded-2xl border border-[#6f45a3] bg-[#1a1030]/85 p-4 backdrop-blur-md">
        <h2 className="text-lg font-semibold text-white">Historico de saques</h2>
        {withdrawals.map((item) => (
          <article key={item.id} className="flex items-center justify-between rounded-xl border border-[#7a4daf] bg-[#261944]/90 p-3">
            <div>
              <p className="text-sm font-semibold text-[#f1e7ff]">{formatMoney(item.amount)}</p>
              <p className="text-xs text-[#c9b0e8]">Solicitado em {formatDate(item.requestedAt)}</p>
              {item.rejectionReason ? <p className="text-xs text-[#ff9ad9]">{item.rejectionReason}</p> : null}
            </div>
            <StatusBadge status={item.status} />
          </article>
        ))}
      </section>
    </GamificationShell>
  );
}
