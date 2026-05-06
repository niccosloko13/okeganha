import { WalletTransactionType } from "@prisma/client";

import { formatDate } from "@/lib/dates";
import { formatMoney, walletSignedAmount } from "@/lib/money";

type TxItem = {
  id: string;
  type: WalletTransactionType;
  amount: number;
  description: string;
  createdAt: Date;
};

type TransactionListProps = {
  transactions: TxItem[];
};

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <section className="ok-card space-y-2 p-4">
      <h2 className="text-lg font-semibold text-[#4d2e75]">Histrico</h2>
      {transactions.map((tx) => {
        const signed = walletSignedAmount(tx.type, tx.amount);
        const positive = signed >= 0;

        return (
          <article key={tx.id} className="ok-card-soft flex items-center justify-between p-3">
            <div>
              <p className="text-sm font-medium text-[#5a3b7f]">{tx.description}</p>
              <p className="text-xs text-[#8269a0]">{formatDate(tx.createdAt)}</p>
            </div>
            <p className={positive ? "text-sm font-bold text-okBlueDark" : "text-sm font-bold text-okPink"}>
              {positive ? "+" : "-"}
              {formatMoney(Math.abs(tx.amount))}
            </p>
          </article>
        );
      })}
    </section>
  );
}


