import { TransactionList } from "@/components/carteira/TransactionList";
import { EnergyBar, StatsCard, WalletCard, XPBar } from "@/components/gamification";
import { UserShell } from "@/components/layout/UserShell";
import { requireUser } from "@/lib/auth";
import { getWalletAvailableBalance } from "@/lib/campaign-rules";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export default async function CarteiraPage() {
  const user = await requireUser();

  const [transactions, pendingSubmissions] = await Promise.all([
    db.walletTransaction.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 }),
    db.taskSubmission.findMany({ where: { userId: user.id, status: "PENDING" }, select: { rewardAmount: true } }),
  ]);

  const available = await getWalletAvailableBalance(user.id);
  const totalEarned = transactions.filter((tx) => tx.type === "CREDIT").reduce((sum, tx) => sum + tx.amount, 0);
  const totalPending = pendingSubmissions.reduce((sum, item) => sum + item.rewardAmount, 0);
  const totalWithdrawn = transactions.filter((tx) => tx.type === "WITHDRAWAL_HOLD" || tx.type === "WITHDRAWAL_PAID").reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <UserShell title="Carteira Gamer" subtitle="Saldo, progresso e movimentacoes.">
      <section className="grid gap-4 md:grid-cols-3">
        <WalletCard balance={formatMoney(available)} />
        <div className="rounded-2xl border border-[#ead6ff] bg-white/80 p-4"><XPBar xp={user.xp} nextXp={15500} /></div>
        <div className="rounded-2xl border border-[#ead6ff] bg-white/80 p-4"><EnergyBar energy={user.energy} maxEnergy={user.maxEnergy} /></div>
      </section>
      <section className="grid gap-3 md:grid-cols-3">
        <StatsCard label="Total ganho" value={formatMoney(totalEarned)} />
        <StatsCard label="Em analise" value={formatMoney(totalPending)} />
        <StatsCard label="Saques" value={formatMoney(totalWithdrawn)} />
      </section>
      <TransactionList transactions={transactions} />
    </UserShell>
  );
}
