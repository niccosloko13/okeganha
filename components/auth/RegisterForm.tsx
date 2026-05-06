"use client";

import { useActionState } from "react";

import { registerAction } from "@/app/actions/auth-actions";
import { BANK_OPTIONS } from "@/lib/banks";
import type { ActionState } from "@/types";

const initialState: ActionState = { ok: false };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="ok-card space-y-4 p-6">
      <input type="hidden" name="pixType" value="CPF" />
      <div>
        <label className="ok-label">Nome completo</label>
        <input name="name" required className="ok-input" />
        {state.fieldErrors?.name ? <p className="mt-1 text-xs text-okPink">{state.fieldErrors.name[0]}</p> : null}
      </div>
      <div>
        <label className="ok-label">Email</label>
        <input name="email" type="email" required className="ok-input" />
        {state.fieldErrors?.email ? <p className="mt-1 text-xs text-okPink">{state.fieldErrors.email[0]}</p> : null}
      </div>
      <div>
        <label className="ok-label">Senha</label>
        <input name="password" type="password" required className="ok-input" />
        {state.fieldErrors?.password ? <p className="mt-1 text-xs text-okPink">{state.fieldErrors.password[0]}</p> : null}
      </div>
      <div>
        <label className="ok-label">Telefone</label>
        <input name="phone" required className="ok-input" />
        {state.fieldErrors?.phone ? <p className="mt-1 text-xs text-okPink">{state.fieldErrors.phone[0]}</p> : null}
      </div>
      <div>
        <label className="ok-label">CPF</label>
        <input name="cpf" required className="ok-input" placeholder="Somente números" />
        {state.fieldErrors?.cpf ? <p className="mt-1 text-xs text-okPink">{state.fieldErrors.cpf[0]}</p> : null}
      </div>
      <div>
        <label className="ok-label">Tipo de Pix</label>
        <input value="CPF" readOnly className="ok-input border-okBorder/70 bg-okBlueLight/35" />
      </div>
      <div>
        <label className="ok-label">Chave Pix (CPF)</label>
        <input name="pixKey" required className="ok-input" />
        {state.fieldErrors?.pixKey ? <p className="mt-1 text-xs text-okPink">{state.fieldErrors.pixKey[0]}</p> : null}
      </div>
      <div>
        <label className="ok-label">Banco</label>
        <select name="bankName" defaultValue="" required className="ok-input">
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
      {state.message ? <p className="text-sm text-okPink">{state.message}</p> : null}
      <button disabled={pending} type="submit" className="ok-btn-primary w-full disabled:opacity-60">
        {pending ? "Criando conta..." : "Criar conta grátis"}
      </button>
    </form>
  );
}
