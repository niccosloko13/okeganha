import { SubmissionStatus } from "@prisma/client";

import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/components/ui/StatusBadge";

type TaskCardProps = {
  campaign: string;
  task: string;
  value: number;
  status: SubmissionStatus;
  submittedAt: Date;
  rejectionReason: string | null;
};

export function TaskCard(props: TaskCardProps) {
  return (
    <article className="ok-card ok-hover-lift p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#3c1a5a]">{props.task}</p>
        <StatusBadge status={props.status} />
      </div>
      <p className="mt-1 text-sm text-[#7b5d9a]">Campanha: {props.campaign}</p>
      <p className="mt-1 text-sm font-medium text-okBlueDark">{formatMoney(props.value)}</p>
      <p className="mt-1 text-xs text-[#967db3]">Enviado em {formatDate(props.submittedAt)}</p>
      {props.rejectionReason ? <p className="mt-2 text-xs text-okPink">Motivo: {props.rejectionReason}</p> : null}
    </article>
  );
}

