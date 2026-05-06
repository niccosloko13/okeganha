import { WalletSummary } from "@/components/carteira/WalletSummary";
import { TransactionList } from "@/components/carteira/TransactionList";
import { UserShell } from "@/components/layout/UserShell";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { getWalletAvailableBalance } from "@/lib/campaign-rules";

export default async function CarteiraPage() {
  const user = await requireUser();

  const [transactions, pendingSubmissions] = await Promise.all([
    db.walletTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.taskSubmission.findMany({
      where: { userId: user.id, status: "PENDING" },
      select: { rewardAmount: true },
    }),
  ]);

  const available = await getWalletAvailableBalance(user.id);
  const totalEarned = transactions.filter((tx) => tx.type === "CREDIT").reduce((sum, tx) => sum + tx.amount, 0);
  const totalPending = pendingSubmissions.reduce((sum, item) => sum + item.rewardAmount, 0);
  const totalWithdrawn = transactions
    .filter((tx) => tx.type === "WITHDRAWAL_HOLD" || tx.type === "WITHDRAWAL_PAID")
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <UserShell title="Carteira" subtitle="Seus ganhos e movimentações.">
      <div className="ok-fade-up">
        <WalletSummary available={available} totalEarned={totalEarned} totalPending={totalPending} totalWithdrawn={totalWithdrawn} />
      </div>
      <div className="ok-fade-up ok-fade-delay-1">
        <TransactionList transactions={transactions} />
      </div>
    </UserShell>
  );
}

