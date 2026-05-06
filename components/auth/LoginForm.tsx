"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/actions/auth-actions";
import type { ActionState } from "@/types";

const initialState: ActionState = { ok: false };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="ok-card space-y-4 p-6">
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
      {state.message ? <p className="text-sm text-okPink">{state.message}</p> : null}
      <button disabled={pending} type="submit" className="ok-btn-primary w-full disabled:opacity-60">
        {pending ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}

