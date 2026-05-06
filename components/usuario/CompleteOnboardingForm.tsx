"use client";

import { useActionState } from "react";

import { completeOnboardingAction } from "@/app/actions/user-actions";
import { BANK_OPTIONS } from "@/lib/banks";
import type { ActionState } from "@/types";

const initialState: ActionState = { ok: false };

type CompleteOnboardingFormProps = {
  phone: string;
  cpf: string;
  pixKey: string;
  bankName: string;
};

export function CompleteOnboardingForm({ phone, cpf, pixKey, bankName }: CompleteOnboardingFormProps) {
  const [state, formAction, pending] = useActionState(completeOnboardingAction, initialState);

  return (
    <form action={formAction} className="ok-card space-y-4 p-5">
      <input type="hidden" name="pixType" value="CPF" />
      <div>
        <label className="ok-label">Telefone</label>
        <input name="phone" defaultValue={phone} required className="ok-input" />
        {state.fieldErrors?.phone ? <p className="mt-1 text-xs text-okPink">{state.fieldErrors.phone[0]}</p> : null}
      </div>

      <div>
        <label className="ok-label">CPF</label>
        <input name="cpf" defaultValue={cpf} required className="ok-input" placeholder="Somente números" />
        {state.fieldErrors?.cpf ? <p className="mt-1 text-xs text-okPink">{state.fieldErrors.cpf[0]}</p> : null}
      </div>

      <div>
        <label className="ok-label">Banco</label>
        <select name="bankName" defaultValue={bankName || ""} required className="ok-input">
          <option value="" disabled>
            Selecione seu banco
          </option>
          {BANK_OPTIONS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
        {state.fieldErrors?.bankName ? <p className="mt-1 text-xs text-okPink">{state.fieldErrors.bankName[0]}</p> : null}
      </div>

      <div>
        <label className="ok-label">Chave Pix (CPF)</label>
        <input name="pixKey" defaultValue={pixKey} required className="ok-input" />
        {state.fieldErrors?.pixKey ? <p className="mt-1 text-xs text-okPink">{state.fieldErrors.pixKey[0]}</p> : null}
      </div>

      {state.message ? <p className={state.ok ? "text-sm text-okBlueDark" : "text-sm text-okPink"}>{state.message}</p> : null}

      <button disabled={pending} type="submit" className="ok-btn-primary w-full disabled:opacity-60">
        {pending ? "Salvando..." : "Concluir cadastro"}
      </button>
    </form>
  );
}
