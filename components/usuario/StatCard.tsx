type StatCardProps = {
  label: string;
  value: string;
  icon: "wallet" | "pending" | "approved" | "campaign" | "calendar";
};

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <article className="ok-card ok-hover-lift ok-fade-up p-4">
      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#f7e8ff] text-[#7d37bf]">
        <StatIcon icon={icon} />
      </div>
      <p className="text-xs font-medium text-[#8566a3]">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-[#3a1658]">{value}</p>
    </article>
  );
}

function StatIcon({ icon }: { icon: StatCardProps["icon"] }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current" strokeWidth="1.8">
      {icon === "wallet" ? <path d="M4 8h16v10H4zM4 8V6h12v2M20 13h-4" /> : null}
      {icon === "pending" ? <path d="M12 7v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /> : null}
      {icon === "approved" ? <path d="m6 12 3.2 3.2L18 7.8" /> : null}
      {icon === "campaign" ? <path d="M5 7h14v10H5zM8 7v10M16 7v10M5 12h14" /> : null}
      {icon === "calendar" ? <path d="M6 4v3M18 4v3M4 10h16M5 7h14v13H5z" /> : null}
    </svg>
  );
}
