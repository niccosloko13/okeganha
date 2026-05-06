"use client";

import { useActionState } from "react";

import { companyLoginAction } from "@/app/actions/company-actions";
import type { ActionState } from "@/types";

const initialState: ActionState = { ok: false };

export function CompanyLoginForm() {
  const [state, formAction, pending] = useActionState(companyLoginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="ok-label">E-mail da empresa</label>
        <input name="email" type="email" required className="ok-input" />
      </div>
      <div>
        <label className="ok-label">Senha</label>
        <input name="password" type="password" required className="ok-input" />
      </div>
      {state.message ? <p className="text-sm text-okPink">{state.message}</p> : null}
      <button disabled={pending} type="submit" className="ok-btn-primary w-full disabled:opacity-60">
        {pending ? "Entrando..." : "Entrar no painel da empresa"}
      </button>
    </form>
  );
}
