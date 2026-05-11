type RelaMetricCardProps = {
  label: string;
  value: string;
  helper: string;
};

export function RelaMetricCard({ label, value, helper }: RelaMetricCardProps) {
  return (
    <article className="rounded-2xl border border-[#2a3b5f] bg-[#121a2f]/85 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#7f9bc1]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#ebf3ff]">{value}</p>
      <p className="mt-1 text-xs text-[#9bb1d4]">{helper}</p>
    </article>
  );
}
