import Link from "next/link";

import { CampaignStatus } from "@prisma/client";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatMoney } from "@/lib/money";

type CampaignCardProps = {
  id: string;
  companyName: string;
  title: string;
  city: string;
  neighborhood: string;
  platform: string | null;
  rewardPerTask: number;
  dailyLimitPerUser: number;
  status: CampaignStatus;
};

export function CampaignCard(props: CampaignCardProps) {
  return (
    <article className="ok-card ok-hover-lift p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-wide text-[#7f62a0]">{props.companyName}</p>
        <StatusBadge status={props.status} />
      </div>
      <h3 className="mt-2 text-lg font-semibold text-[#3d195d]">{props.title}</h3>
      <p className="text-xs font-semibold text-okLilac">Comunidade ativa</p>
      <p className="text-sm text-[#8269a0]">
        {props.city} - {props.neighborhood}
      </p>
      {props.platform ? <p className="mt-1 text-xs font-semibold text-[#a149d8]">Plataforma: {props.platform}</p> : null}
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-2xl border border-[#f4b5df] bg-[#ffe8f5] p-2 text-[#b23f8a]">
          <p className="text-[11px] font-semibold uppercase tracking-wide">Recompensa</p>
          <p className="text-base font-extrabold">{formatMoney(props.rewardPerTask)}</p>
        </div>
        <div className="ok-card-soft p-2 text-[#5a4d8f]">
          <p className="text-[11px] font-semibold uppercase tracking-wide">Limite diário</p>
          <p className="text-base font-extrabold">{props.dailyLimitPerUser}</p>
        </div>
      </div>
      <Link href={`/usuario/campanhas/${props.id}`} className="ok-btn-primary mt-4 inline-block text-sm">
        Entrar na missão
      </Link>
    </article>
  );
}
