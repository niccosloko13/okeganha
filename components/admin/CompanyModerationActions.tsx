"use client";

import Link from "next/link";
import { useActionState } from "react";

import { approveCompany, blockCompany, rejectCompany, startCompanyImpersonationAction } from "@/app/actions/admin-actions";
import type { ActionState } from "@/types";

const INITIAL_STATE: ActionState = { ok: false, message: "" };

type CompanyModerationActionsProps = {
  companyId: string;
  compact?: boolean;
};

function ActionFeedback({ state }: { state: ActionState }) {
  if (!state.message) return null;

  return (
    <p className={`text-[11px] ${state.ok ? "text-emerald-700" : "text-rose-700"}`} role="status" aria-live="polite">
      {state.message}
    </p>
  );
}

export function CompanyModerationActions({ companyId, compact = false }: CompanyModerationActionsProps) {
  const [approveState, approveFormAction, approvePending] = useActionState(approveCompany, INITIAL_STATE);
  const [blockState, blockFormAction, blockPending] = useActionState(blockCompany, INITIAL_STATE);
  const [rejectState, rejectFormAction, rejectPending] = useActionState(rejectCompany, INITIAL_STATE);

  const btnClass = compact ? "rounded-lg border border-[#e8d6ff] px-2.5 py-1 text-xs font-semibold text-[#5a3382] transition hover:bg-[#f6efff] disabled:cursor-not-allowed disabled:opacity-60"
    : "rounded-xl border border-[#e8d6ff] px-3 py-1.5 text-xs font-semibold text-[#5a3382] transition hover:bg-[#f6efff] disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <Link href={`/admin/empresas/${companyId}`} className={btnClass}>
          Ver
        </Link>
        <Link href={`/admin/empresas/${companyId}tab=dados`} className={btnClass}>
          Editar
        </Link>
        <form action={startCompanyImpersonationAction}>
          <input type="hidden" name="companyId" value={companyId} />
          <button type="submit" className={btnClass}>
            Entrar como empresa
          </button>
        </form>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <form action={approveFormAction}>
          <input type="hidden" name="companyId" value={companyId} />
          <button type="submit" disabled={approvePending} className={btnClass}>
            {approvePending ? "Aprovando..." : "Aprovar"}
          </button>
        </form>

        <form action={rejectFormAction} className="flex items-center gap-1">
          <input type="hidden" name="companyId" value={companyId} />
          <input
            name="rejectionReason"
            placeholder="Motivo"
            minLength={6}
            required
            className="h-8 w-32 rounded-lg border border-[#ead9ff] bg-white px-2 text-xs text-[#4a2b70] outline-none focus:border-[#b878ff]"
          />
          <button type="submit" disabled={rejectPending} className={btnClass}>
            {rejectPending ? "Reprovando..." : "Reprovar"}
          </button>
        </form>

        <form action={blockFormAction}>
          <input type="hidden" name="companyId" value={companyId} />
          <button type="submit" disabled={blockPending} className={btnClass}>
            {blockPending ? "Bloqueando..." : "Bloquear"}
          </button>
        </form>
      </div>

      <ActionFeedback state={approveState.message ? approveState : blockState.message ? blockState : rejectState} />
    </div>
  );
}

