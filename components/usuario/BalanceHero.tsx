import { formatMoney } from "@/lib/money";
import { QuickActionButton } from "@/components/usuario/QuickActionButton";

type BalanceHeroProps = {
  balance: number;
};

export function BalanceHero({ balance }: BalanceHeroProps) {
  return (
    <section className="ok-fade-up ok-card-premium rounded-3xl border border-[#7a3bc2] bg-gradient-to-br from-[#ff5bb8] via-[#c247ff] to-[#6d2fb4] p-6 text-white shadow-[0_28px_42px_-26px_rgba(94,28,153,0.95)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Saldo disponível</p>
      <p className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">{formatMoney(balance)}</p>
      <p className="mt-1 text-sm text-white/85">Use seu saldo com segurança e saque semanal.</p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <QuickActionButton href="/usuario/saques" label="Sacar agora" pulse />
        <QuickActionButton href="/usuario/campanhas" label="Ver campanhas" variant="secondary" />
      </div>
    </section>
  );
}
