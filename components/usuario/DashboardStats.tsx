import { formatMoney } from "@/lib/money";

type DashboardStatsProps = {
  balance: number;
  weekEarnings: number;
  pendingTasks: number;
  approvedTasks: number;
  availableCampaigns: number;
  nextWithdrawalLabel: string;
};

export function DashboardStats(props: DashboardStatsProps) {
  const cards = [
    { label: "Saldo disponível", value: formatMoney(props.balance), icon: "R$" },
    { label: "Ganhos da semana", value: formatMoney(props.weekEarnings), icon: "7D" },
    { label: "Pendentes", value: String(props.pendingTasks), icon: "PD" },
    { label: "Aprovadas", value: String(props.approvedTasks), icon: "AP" },
    { label: "Campanhas ativas", value: String(props.availableCampaigns), icon: "CP" },
    { label: "Próximo saque", value: props.nextWithdrawalLabel, icon: "SX" },
  ];

  return (
    <section className="ok-fade-up ok-fade-delay-1 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
      {cards.map((card) => (
        <article key={card.label} className="ok-card ok-hover-lift p-4">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7c5a9f]">{card.label}</p>
            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-xl bg-[#f6ecff] px-2 text-[11px] font-bold text-[#6e2ea7]">
              {card.icon}
            </span>
          </div>
          <p className="mt-3 text-2xl font-extrabold tracking-tight text-[#34134f]">{card.value}</p>
        </article>
      ))}
    </section>
  );
}
