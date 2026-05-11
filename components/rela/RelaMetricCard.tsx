type RelaMetricCardProps = {
  label: string;
  value: string;
  helper: string;
  trend?: string;
};

export function RelaMetricCard({ label, value, helper, trend }: RelaMetricCardProps) {
  return (
    <article className="rounded-2xl border border-[#2a3b5f] bg-[linear-gradient(145deg,#121a2f_0%,#16213a_100%)] p-4 shadow-[0_14px_28px_-20px_rgba(30,76,166,0.8)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#7f9bc1]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#ebf3ff]">{value}</p>
      <p className="mt-1 text-xs text-[#9bb1d4]">{helper}</p>
      {trend ? <p className="mt-2 inline-flex rounded-full border border-[#335586] bg-[#13203a] px-2 py-1 text-[11px] font-semibold text-[#b7d4ff]">{trend}</p> : null}
    </article>
  );
}
