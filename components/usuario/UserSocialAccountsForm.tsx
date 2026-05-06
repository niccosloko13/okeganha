"use client";

import { useActionState } from "react";

import { upsertUserSocialAccountAction } from "@/app/actions/user-actions";
import type { ActionState } from "@/types";

const initialState: ActionState = { ok: false };

type UserSocialAccountsFormProps = {
  platform: "INSTAGRAM" | "TIKTOK" | "FACEBOOK" | "GOOGLE" | "YOUTUBE";
  platformLabel: string;
  profileUrl: string;
  username: string;
  status: "CONNECTED" | "PENDING" | "DISCONNECTED";
};

const statusLabel: Record<UserSocialAccountsFormProps["status"], string> = {
  CONNECTED: "Conectada", PENDING: "Pendente",
  DISCONNECTED: "Não conectada",
};

export function UserSocialAccountsForm({ platform, platformLabel, profileUrl, username, status }: UserSocialAccountsFormProps) {
  const [state, formAction, pending] = useActionState(upsertUserSocialAccountAction, initialState);

  return (
    <article className="ok-card ok-hover-lift p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#4d2e75]">{platformLabel}</p>
          <p className="text-xs text-[#8269a0]">{statusLabel[status]}</p>
        </div>
        <span className="ok-badge">Teste manual</span>
      </div>

      <form action={formAction} className="space-y-2">
        <input type="hidden" name="platform" value={platform} />

        <div>
          <label className="ok-label">URL do perfil</label>
          <input
            name="profileUrl"
            required
            defaultValue={profileUrl}
            className="ok-input"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="ok-label">Usuário (opcional)</label>
          <input name="username" defaultValue={username} className="ok-input" placeholder="@seuusuario" />
        </div>

        {state.message ? (
          <p className={`text-xs ${state.ok ? "text-okBlueDark" : "text-okPink"}`}>{state.message}</p>
        ) : null}

        <button type="submit" className="ok-btn-primary w-full" disabled={pending}>
          {pending ? "Salvando..." : "Salvar conexão"}
        </button>
      </form>
    </article>
  );
}
