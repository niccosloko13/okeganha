"use client";

import { useActionState } from "react";

import { requestWithdrawalAction } from "@/app/actions/user-actions";
import { formatMoney } from "@/lib/money";
import type { ActionState } from "@/types";

const initialState: ActionState = { ok: false };

type WithdrawalFormProps = {
  available: number;
  pixKey: string;
};

export function WithdrawalForm({ available, pixKey }: WithdrawalFormProps) {
  const [state, formAction, pending] = useActionState(requestWithdrawalAction, initialState);

  return (
    <form action={formAction} className="ok-card space-y-3 p-4">
      <h2 className="text-lg font-semibold text-[#4d2e75]">Solicitar saque</h2>
      <p className="text-sm text-[#8269a0]">Saldo disponível: {formatMoney(available)}</p>
      <input name="amount" type="number" min={20} step={0.01} required className="ok-input" placeholder="Valor do saque (ex: 25.50)" />
      <input name="pixKey" defaultValue={pixKey} required className="ok-input" placeholder="Chave Pix" />
      {state.message ? <p className={state.ok ? "text-sm text-okBlueDark" : "text-sm text-okPink"}>{state.message}</p> : null}
      <button disabled={pending} type="submit" className="ok-btn-primary w-full disabled:opacity-60">
        {pending ? "Solicitando..." : "Solicitar saque"}
      </button>
      <p className="text-xs text-[#8269a0]">Valor mínimo: R$ 20,00. Saques apenas às sextas-feiras.</p>
    </form>
  );
}
