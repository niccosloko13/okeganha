"use client";

import { useActionState } from "react";

import { companyRegisterAction } from "@/app/actions/company-actions";
import type { ActionState } from "@/types";

const initialState: ActionState = { ok: false, message: "" };

export function RelaRegisterForm() {
  const [state, formAction, pending] = useActionState(companyRegisterAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-2">
      <input type="hidden" name="source" value="rela" />
      <input name="tradeName" placeholder="Nome fantasia" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
      <input name="legalName" placeholder="Razao social" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
      <input name="cnpj" placeholder="CNPJ" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
      <input name="responsibleName" placeholder="Responsavel" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
      <input name="responsibleWhatsapp" placeholder="WhatsApp com DDD" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
      <input type="email" name="email" placeholder="E-mail empresarial" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
      <input type="password" name="password" placeholder="Senha (min. 8)" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
      <input name="city" placeholder="Cidade" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
      <input name="neighborhood" placeholder="Bairro" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
      <input name="category" placeholder="Categoria" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
      <input name="instagramUrl" placeholder="Instagram (opcional)" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" />
      <input name="tiktokUrl" placeholder="TikTok (opcional)" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" />
      <input name="facebookUrl" placeholder="Facebook (opcional)" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" />
      <input name="googleBusinessUrl" placeholder="Google Business (opcional)" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" />
      <input name="websiteUrl" placeholder="Site (opcional)" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc] md:col-span-2" />
      {state.message ? <p className={`text-xs md:col-span-2 ${state.ok ? "text-[#79d8b4]" : "text-[#ff9fb1]"}`}>{state.message}</p> : null}
      <button type="submit" disabled={pending} className="rounded-xl bg-gradient-to-r from-[#3c76ff] to-[#21b8d9] px-4 py-3 text-sm font-bold text-white disabled:opacity-60 md:col-span-2">
        {pending ? "Criando conta..." : "Criar conta empresarial"}
      </button>
    </form>
  );
}
