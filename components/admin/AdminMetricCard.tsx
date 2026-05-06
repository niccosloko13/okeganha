type AdminMetricCardProps = {
  label: string;
  value: string;
  hint?: string;
};

export function AdminMetricCard({ label, value, hint }: AdminMetricCardProps) {
  return (
    <article className="ok-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#8a6aa8]">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-[#3a1658]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#7a5a99]">{hint}</p> : null}
    </article>
  );
}
