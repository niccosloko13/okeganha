import { approveSubmissionAction, rejectSubmissionAction } from "@/app/actions/admin-actions";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { formatMoney } from "@/lib/money";

type SubmissionReviewCardProps = {
  id: string;
  userName: string;
  campaignTitle: string;
  taskTitle: string;
  rewardAmount: number;
  proofText: string;
  proofImageUrl: string | null;
  status: string;
};

export function SubmissionReviewCard(props: SubmissionReviewCardProps) {
  return (
    <article className="ok-card space-y-3 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#4d2e75]">{props.userName}</p>
          <p className="text-xs text-[#8269a0]">{props.campaignTitle} • {props.taskTitle}</p>
        </div>
        <AdminStatusBadge status={props.status} />
      </div>

      <p className="text-sm text-[#6c4d90]">{props.proofText}</p>
      {props.proofImageUrl ? (
        <a href={props.proofImageUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-okBlueDark underline">
          Abrir prova enviada
        </a>
      ) : null}

      <p className="text-sm font-semibold text-[#4d2e75]">Valor: {formatMoney(props.rewardAmount)}</p>

      <div className="grid gap-2 md:grid-cols-2">
        <form action={approveSubmissionAction}>
          <input type="hidden" name="submissionId" value={props.id} />
          <button type="submit" className="ok-btn-primary w-full">Aprovar</button>
        </form>

        <form action={rejectSubmissionAction} className="space-y-2">
          <input type="hidden" name="submissionId" value={props.id} />
          <input name="rejectionReason" required minLength={8} className="ok-input" placeholder="Motivo da reprovação" />
          <button type="submit" className="ok-btn-secondary w-full">Reprovar</button>
        </form>
      </div>
    </article>
  );
}
