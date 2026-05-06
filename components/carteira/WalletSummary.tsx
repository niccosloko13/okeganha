import { formatMoney } from "@/lib/money";

type WalletSummaryProps = {
  available: number;
  totalEarned: number;
  totalPending: number;
  totalWithdrawn: number;
};

export function WalletSummary({ available, totalEarned, totalPending, totalWithdrawn }: WalletSummaryProps) {
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <article className="ok-card p-4">
        <p className="text-xs text-[#8269a0]">Saldo disponível</p>
        <p className="text-xl font-bold text-okBlueDark">{formatMoney(available)}</p>
      </article>
      <article className="ok-card p-4">
        <p className="text-xs text-[#8269a0]">Total ganho</p>
        <p className="text-xl font-bold text-[#4d2e75]">{formatMoney(totalEarned)}</p>
      </article>
      <article className="ok-card p-4">
        <p className="text-xs text-[#8269a0]">Total pendente</p>
        <p className="text-xl font-bold text-okLilac">{formatMoney(totalPending)}</p>
      </article>
      <article className="ok-card p-4">
        <p className="text-xs text-[#8269a0]">Total sacado</p>
        <p className="text-xl font-bold text-okBlue">{formatMoney(totalWithdrawn)}</p>
      </article>
    </section>
  );
}


