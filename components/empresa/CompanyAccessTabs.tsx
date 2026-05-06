"use client";

import { useActionState, useState } from "react";

import { companyLoginAction, companyRegisterAction } from "@/app/actions/company-actions";
import type { ActionState } from "@/types";

const initialState: ActionState = { ok: false };

export function CompanyAccessTabs() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [cnpj, setCnpj] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loginState, loginAction, loginPending] = useActionState(companyLoginAction, initialState);
  const [registerState, registerAction, registerPending] = useActionState(companyRegisterAction, initialState);

  return (
    <section className="ok-card w-full max-w-2xl space-y-4 p-6">
      <div className="flex gap-2">
        <button type="button" onClick={() => setTab("login")} className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === "login" ? "bg-[#f5e8ff] text-[#4f2379]" : "text-[#7a5a99]"}`}>
          Entrar
        </button>
        <button type="button" onClick={() => setTab("register")} className={`rounded-xl px-4 py-2 text-sm font-semibold ${tab === "register" ? "bg-[#f5e8ff] text-[#4f2379]" : "text-[#7a5a99]"}`}>
          Criar conta empresa
        </button>
      </div>

      {tab === "login" ? (
        <form action={loginAction} className="grid gap-3">
          <Field label="E-mail" name="email" type="email" required />
          <Field label="Senha" name="password" type="password" required />
          {loginState.message ? <p className="text-sm text-okPink">{loginState.message}</p> : null}
          <button type="submit" disabled={loginPending} className="ok-btn-primary">
            {loginPending ? "Entrando..." : "Entrar"}
          </button>
        </form>
      ) : (
        <form action={registerAction} className="grid gap-3 md:grid-cols-2">
          <Field label="Nome fantasia" name="tradeName" required />
          <Field label="Razão social" name="legalName" required />
          <div>
            <label className="ok-label">CNPJ</label>
            <input
              name="cnpj"
              required
              className="ok-input"
              value={cnpj}
              onChange={(event) => setCnpj(formatCnpj(event.target.value))}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
            {registerState.fieldErrors?.cnpj ? <p className="mt-1 text-xs text-okPink">{registerState.fieldErrors.cnpj[0]}</p> : null}
          </div>
          <Field label="Nome do responsável" name="responsibleName" required />
          <div>
            <label className="ok-label">WhatsApp</label>
            <input
              name="responsibleWhatsapp"
              required
              className="ok-input"
              value={whatsapp}
              onChange={(event) => setWhatsapp(formatWhatsapp(event.target.value))}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
            {registerState.fieldErrors?.responsibleWhatsapp ? (
              <p className="mt-1 text-xs text-okPink">{registerState.fieldErrors.responsibleWhatsapp[0]}</p>
            ) : null}
          </div>
          <Field label="E-mail" name="email" type="email" required />
          <Field label="Senha" name="password" type="password" required />
          <Field label="Cidade" name="city" required />
          <Field label="Bairro" name="neighborhood" required />
          <Field label="Categoria" name="category" required />
          <Field label="Instagram" name="instagramUrl" />
          <Field label="TikTok" name="tiktokUrl" />
          <Field label="Facebook" name="facebookUrl" />
          <Field label="Google Meu Negócio" name="googleBusinessUrl" />
          <Field label="Site" name="websiteUrl" />
          {registerState.message ? <p className="text-sm text-okPink md:col-span-2">{registerState.message}</p> : null}
          {registerState.fieldErrors?.email ? <p className="text-xs text-okPink md:col-span-2">{registerState.fieldErrors.email[0]}</p> : null}
          {registerState.fieldErrors?.password ? <p className="text-xs text-okPink md:col-span-2">{registerState.fieldErrors.password[0]}</p> : null}
          <button type="submit" disabled={registerPending} className="ok-btn-primary md:col-span-2">
            {registerPending ? "Enviando..." : "Criar conta empresa"}
          </button>
        </form>
      )}
    </section>
  );
}

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function formatWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function Field({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="ok-label">{label}</label>
      <input name={name} type={type} required={required} className="ok-input" />
    </div>
  );
}
