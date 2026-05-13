"use client";

import { useActionState } from "react";

import { companyLoginAction } from "@/app/actions/company-actions";
import type { ActionState } from "@/types";

const initialState: ActionState = { ok: false, message: "" };

export function RelaLoginForm() {
  const [state, formAction, pending] = useActionState(companyLoginAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="source" value="rela" />
      <div>
        <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#b7cdf0]">E-mail empresarial</label>
        <input id="email" name="email" type="email" className="w-full rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white outline-none placeholder:text-[#7f96bc] focus:border-[#4b8bff]" placeholder="empresa@exemplo.com" required />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[#b7cdf0]">Senha</label>
        <input id="password" name="password" type="password" className="w-full rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white outline-none placeholder:text-[#7f96bc] focus:border-[#4b8bff]" required />
      </div>
      {state.message ? <p className={`text-xs ${state.ok ? "text-[#79d8b4]" : "text-[#ff9fb1]"}`}>{state.message}</p> : null}
      <button type="submit" disabled={pending} className="w-full rounded-xl bg-gradient-to-r from-[#3c76ff] to-[#21b8d9] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
        {pending ? "Entrando..." : "Entrar no RELA"}
      </button>
    </form>
  );
}
