"use client";

import { useActionState } from "react";

import { updateProfileAction } from "@/app/actions/user-actions";
import type { ActionState } from "@/types";

const initialState: ActionState = { ok: false };

type ProfileFormProps = {
  phone: string | null;
  pixKey: string | null;
  email: string;
  name: string;
};

export function ProfileForm({ phone, pixKey, email, name }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="ok-card space-y-3 p-4">
      <h2 className="text-lg font-semibold text-[#4d2e75]">Dados da conta</h2>
      <div>
        <label className="ok-label">Nome</label>
        <input disabled value={name} className="ok-input border-okBorder/70 bg-okBlueLight/35" />
      </div>
      <div>
        <label className="ok-label">Email (não editável)</label>
        <input disabled value={email} className="ok-input border-okBorder/70 bg-okBlueLight/35" />
      </div>
      <div>
        <label className="ok-label">Telefone</label>
        <input name="phone" defaultValue={phone ?? ""} required className="ok-input" />
      </div>
      <div>
        <label className="ok-label">Chave Pix</label>
        <input name="pixKey" defaultValue={pixKey ?? ""} required className="ok-input" />
      </div>
      {state.message ? <p className={state.ok ? "text-sm text-okBlueDark" : "text-sm text-okPink"}>{state.message}</p> : null}
      <button disabled={pending} type="submit" className="ok-btn-primary w-full disabled:opacity-60">
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
