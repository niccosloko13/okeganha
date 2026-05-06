import Link from "next/link";
import { formatMoney } from "@/lib/money";

type MissionCardProps = {
  title: string;
  companyName: string;
  reward: number;
  href: string;
};

export function MissionCard({ title, companyName, reward, href }: MissionCardProps) {
  return (
    <article className="ok-card ok-hover-lift min-w-[240px] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#8a6aa8]">{companyName}</p>
      <h3 className="mt-1 text-base font-bold text-[#3a1658]">{title}</h3>
      <span className="ok-badge mt-3">{formatMoney(reward)}</span>
      <Link href={href} className="ok-btn-primary mt-4 inline-flex text-sm">
        Começar
      </Link>
    </article>
  );
}
