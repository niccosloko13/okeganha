import { approveWithdrawalAction, markWithdrawalPaidAction, rejectWithdrawalAction } from "@/app/actions/admin-actions";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { formatMoney } from "@/lib/money";

type WithdrawalReviewCardProps = {
  id: string;
  userName: string;
  amount: number;
  pixKey: string;
  bankName: string | null;
  cpf: string | null;
  status: string;
  identityVerificationStatus: string;
};

export function WithdrawalReviewCard(props: WithdrawalReviewCardProps) {
  return (
    <article className="ok-card space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#4d2e75]">{props.userName}</p>
          <p className="text-xs text-[#8269a0]">{formatMoney(props.amount)}</p>
        </div>
        <AdminStatusBadge status={props.status} />
      </div>

      <div className="grid gap-1 text-xs text-[#7a5a99]">
        <p>Pix: {props.pixKey}</p>
        <p>Banco: {props.bankName ?? "Não informado"}</p>
        <p>CPF: {props.cpf ?? "Não informado"}</p>
        <p>Verificação facial: {props.identityVerificationStatus}</p>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <form action={approveWithdrawalAction}>
          <input type="hidden" name="requestId" value={props.id} />
          <button type="submit" className="ok-btn-primary w-full">Aprovar</button>
        </form>
        <form action={markWithdrawalPaidAction}>
          <input type="hidden" name="requestId" value={props.id} />
          <button type="submit" className="ok-btn-secondary w-full">Marcar pago</button>
        </form>
        <form action={rejectWithdrawalAction} className="space-y-2">
          <input type="hidden" name="requestId" value={props.id} />
          <input name="rejectionReason" required minLength={8} className="ok-input" placeholder="Motivo da reprovação" />
          <button type="submit" className="ok-btn-secondary w-full">Reprovar</button>
        </form>
      </div>
    </article>
  );
}
