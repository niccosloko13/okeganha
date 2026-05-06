import Link from "next/link";

import { WithdrawalForm } from "@/components/carteira/WithdrawalForm";
import { UserShell } from "@/components/layout/UserShell";
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
    db.withdrawalRequest.findMany({
      where: { userId: user.id },
      orderBy: { requestedAt: "desc" },
      take: 10,
    }),
    getWalletAvailableBalance(user.id),
  ]);

  const missingPayoutData = !user.onboardingCompleted || !user.cpf || !user.pixKey || !user.bankName;
  const canWithdraw = !missingPayoutData && user.identityVerificationStatus === "VERIFIED";

  return (
    <UserShell title="Saques" subtitle="Solicitações semanais, segurança e histórico.">
      {!canWithdraw ? (
        <section className="ok-card border-[#ffd1ea] bg-[#fff4fb] p-4">
          <h2 className="text-lg font-extrabold text-[#7a2f62]">Liberação de saques pendente</h2>
          <p className="mt-1 text-sm text-[#7a5a99]">
            Para solicitar saque você precisa completar cadastro, configurar dados Pix e finalizar a verificação de identidade.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/usuario/completar-cadastro" className="ok-btn-primary inline-flex">
              Completar cadastro
            </Link>
            <Link href="/usuario/perfil" className="ok-btn-secondary inline-flex">
              Atualizar dados Pix
            </Link>
          </div>
        </section>
      ) : (
        <WithdrawalForm available={available} pixKey={user.pixKey ?? ""} />
      )}

      <IdentityVerificationCard status={user.identityVerificationStatus} />

      <section className="ok-card p-4">
        <h2 className="text-lg font-extrabold text-[#3a1658]">Segurança antifraude</h2>
        <p className="mt-1 text-sm text-[#7a5a99]">
          Atividades suspeitas podem levar ao bloqueio da conta.
        </p>
      </section>

      <section className="ok-card space-y-2 p-4">
        <h2 className="text-lg font-semibold text-[#4d2e75]">Solicitações</h2>
        {withdrawals.map((item) => (
          <article key={item.id} className="ok-card-soft flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-semibold text-[#5a3b7f]">{formatMoney(item.amount)}</p>
              <p className="text-xs text-[#8269a0]">Solicitado em {formatDate(item.requestedAt)}</p>
              {item.rejectionReason ? <p className="text-xs text-okPink">{item.rejectionReason}</p> : null}
            </div>
            <StatusBadge status={item.status} />
          </article>
        ))}
      </section>
    </UserShell>
  );
}
