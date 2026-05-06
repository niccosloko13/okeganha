"use client";

import { useActionState } from "react";

import { registerAction } from "@/app/actions/auth-actions";
import type { ActionState } from "@/types";

const initialState: ActionState = { ok: false };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="ok-card space-y-4 rounded-3xl border border-[#eddcfb] bg-white/95 p-6 shadow-[0_18px_40px_-26px_rgba(87,24,142,0.45)]">
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
      {state.message ? <p className="text-sm text-okPink">{state.message}</p> : null}
      <button disabled={pending} type="submit" className="ok-btn-primary w-full disabled:opacity-60">
        {pending ? "Criando conta..." : "Criar conta gratis"}
      </button>
    </form>
  );
}
