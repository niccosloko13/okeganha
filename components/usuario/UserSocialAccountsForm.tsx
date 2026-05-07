"use client";

import { useActionState } from "react";
import Image from "next/image";

import { upsertUserSocialAccountAction } from "@/app/actions/user-actions";
import { GAMIFICATION_ASSETS } from "@/lib/gamification-assets";
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
  CONNECTED: "CONNECTED",
  PENDING: "PENDING",
  DISCONNECTED: "NOT_CONNECTED",
};

function platformIcon(platform: UserSocialAccountsFormProps["platform"]) {
  if (platform === "INSTAGRAM") return GAMIFICATION_ASSETS.platforms.instagram;
  if (platform === "TIKTOK") return GAMIFICATION_ASSETS.platforms.tiktok;
  if (platform === "YOUTUBE") return GAMIFICATION_ASSETS.platforms.youtube;
  return GAMIFICATION_ASSETS.platforms.google;
}

export function UserSocialAccountsForm({ platform, platformLabel, profileUrl, username, status }: UserSocialAccountsFormProps) {
  const [state, formAction, pending] = useActionState(upsertUserSocialAccountAction, initialState);

  return (
    <article className="rounded-2xl border border-[#6f45a3] bg-[#1a1030]/85 p-4 backdrop-blur-md transition hover:-translate-y-0.5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Image src={platformIcon(platform)} alt={platformLabel} width={44} height={44} className="h-11 w-11 rounded-xl object-cover" loading="lazy" />
          <div>
            <p className="text-sm font-semibold text-[#f3e9ff]">{platformLabel}</p>
            <p className="text-xs text-[#cbb4e8]">{statusLabel[status]}</p>
          </div>
        </div>
        <span className="rounded-lg border border-[#7f4ab6] bg-[#2a1845] px-2 py-1 text-[10px] font-bold text-[#f0dcff]">Seguro</span>
      </div>

      <form action={formAction} className="space-y-2">
        <input type="hidden" name="platform" value={platform} />

        <div>
          <label className="mb-1 block text-xs text-[#cbb4e8]">URL do perfil</label>
          <input name="profileUrl" required defaultValue={profileUrl} className="w-full rounded-xl border border-[#6f45a3] bg-[#25183f] px-3 py-2 text-sm text-white" placeholder="https://..." />
        </div>

        <div>
          <label className="mb-1 block text-xs text-[#cbb4e8]">Usuario (opcional)</label>
          <input name="username" defaultValue={username} className="w-full rounded-xl border border-[#6f45a3] bg-[#25183f] px-3 py-2 text-sm text-white" placeholder="@seuusuario" />
        </div>

        {state.message ? <p className={`text-xs ${state.ok ? "text-[#8ff0c7]" : "text-[#ff9ad9]"}`}>{state.message}</p> : null}

        <button type="submit" className="min-h-[44px] w-full rounded-xl bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc] px-4 py-2 text-sm font-semibold text-white active:scale-95" disabled={pending}>
          {pending ? "Salvando..." : "Conectar perfil"}
        </button>
      </form>
    </article>
  );
}
