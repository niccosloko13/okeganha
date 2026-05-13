"use client";

import { useActionState } from "react";

import { updateCompanyChannelsAction } from "@/app/actions/company-actions";
import type { ActionState } from "@/types";

const initialState: ActionState = { ok: false, message: "" };

type Props = {
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  googleBusinessUrl: string;
  websiteUrl: string;
};

export function RelaChannelsForm(props: Props) {
  const [state, formAction, pending] = useActionState(updateCompanyChannelsAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-2">
      <input name="instagramUrl" defaultValue={props.instagramUrl} placeholder="https://instagram.com/suaempresa" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" />
      <input name="tiktokUrl" defaultValue={props.tiktokUrl} placeholder="https://tiktok.com/@suaempresa" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" />
      <input name="facebookUrl" defaultValue={props.facebookUrl} placeholder="https://facebook.com/suaempresa" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" />
      <input name="googleBusinessUrl" defaultValue={props.googleBusinessUrl} placeholder="Link do Google Business" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" />
      <input name="websiteUrl" defaultValue={props.websiteUrl} placeholder="https://suaempresa.com.br" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc] md:col-span-2" />
      {state.message ? <p className={`text-xs md:col-span-2 ${state.ok ? "text-[#79d8b4]" : "text-[#ff9fb1]"}`}>{state.message}</p> : null}
      <button type="submit" disabled={pending} className="rounded-xl bg-gradient-to-r from-[#3c76ff] to-[#21b8d9] px-4 py-3 text-sm font-bold text-white disabled:opacity-60 md:col-span-2">
        {pending ? "Salvando..." : "Salvar canais de divulgacao"}
      </button>
    </form>
  );
}
