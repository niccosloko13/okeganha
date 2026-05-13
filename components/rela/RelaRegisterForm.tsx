"use client";

import { useState } from "react";
import { useActionState } from "react";

import { companyRegisterAction } from "@/app/actions/company-actions";
import type { ActionState } from "@/types";

const initialState: ActionState = { ok: false, message: "" };

export function RelaRegisterForm() {
  const [state, formAction, pending] = useActionState(companyRegisterAction, initialState);
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-2">
      <input type="hidden" name="source" value="rela" />
      <input type="hidden" name="instagramUrl" value="" />
      <input type="hidden" name="tiktokUrl" value="" />
      <input type="hidden" name="facebookUrl" value="" />
      <input type="hidden" name="googleBusinessUrl" value="" />
      <input type="hidden" name="websiteUrl" value="" />
      <input type="hidden" name="category" value="GERAL" />

      {step === 1 ? (
        <>
          <p className="text-xs uppercase tracking-wide text-[#9eb6da] md:col-span-2">Etapa 1 de 2 • Dados da empresa</p>
          <input name="tradeName" placeholder="Nome fantasia" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
          <input name="legalName" placeholder="Razao social" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
          <input name="cnpj" placeholder="CNPJ" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
          <input name="phone" placeholder="WhatsApp comercial" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
          <input type="email" name="email" placeholder="E-mail comercial" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
          <input type="password" name="password" placeholder="Senha (min. 8)" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
          <input name="city" placeholder="Cidade" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
          <input name="neighborhood" placeholder="Bairro ou regiao" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
        </>
      ) : (
        <>
          <p className="text-xs uppercase tracking-wide text-[#9eb6da] md:col-span-2">Etapa 2 de 2 • Responsavel legal</p>
          <input name="responsibleName" placeholder="Nome do responsavel" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
          <input name="responsibleCpf" placeholder="CPF do responsavel" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc]" required />
          <input name="responsibleWhatsapp" placeholder="WhatsApp do responsavel" className="rounded-xl border border-[#334d77] bg-[#0d1528] px-3 py-3 text-sm text-white placeholder:text-[#7f96bc] md:col-span-2" required />
          <label className="flex items-start gap-2 text-xs text-[#a8bfde] md:col-span-2">
            <input type="checkbox" name="terms" required className="mt-0.5" />
            Confirmo os dados da empresa e aceito os termos de uso para analise de cadastro.
          </label>
        </>
      )}
      {state.message ? <p className={`text-xs md:col-span-2 ${state.ok ? "text-[#79d8b4]" : "text-[#ff9fb1]"}`}>{state.message}</p> : null}
      {step === 1 ? (
        <button type="button" onClick={() => setStep(2)} className="rounded-xl bg-gradient-to-r from-[#3c76ff] to-[#21b8d9] px-4 py-3 text-sm font-bold text-white md:col-span-2">
          Continuar
        </button>
      ) : (
        <div className="grid gap-2 md:col-span-2 md:grid-cols-2">
          <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-[#3b5684] px-4 py-3 text-sm font-semibold text-[#c8dcfa]">
            Voltar
          </button>
          <button type="submit" disabled={pending} className="rounded-xl bg-gradient-to-r from-[#3c76ff] to-[#21b8d9] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
            {pending ? "Criando conta..." : "Enviar cadastro empresarial"}
          </button>
        </div>
      )}
    </form>
  );
}
