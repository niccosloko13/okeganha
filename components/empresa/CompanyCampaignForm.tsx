"use client";

import { useActionState, useMemo } from "react";

import { createCompanyCampaignAction } from "@/app/actions/company-actions";
import type { ActionState } from "@/types";

const initialState: ActionState = { ok: false };

const CAMPAIGN_TYPES: Array<{ value: string; label: string }> = [
  { value: "WATCH_VIDEO", label: "Assistir vídeo/Reels" },
  { value: "VIEW_STORY", label: "Ver story" },
  { value: "LIKE_POST", label: "Curtir publicação" },
  { value: "COMMENT_POST", label: "Comentar publicação" },
  { value: "FOLLOW_PROFILE", label: "Seguir perfil" },
  { value: "REVIEW_BUSINESS", label: "Avaliar no Google" },
  { value: "CHECKIN_BUSINESS", label: "Check-in presencial" },
  { value: "VISIT_LOCAL", label: "Visitar local" },
  { value: "OTHER", label: "Outro" },
];

export function CompanyCampaignForm() {
  const [state, formAction, pending] = useActionState(createCompanyCampaignAction, initialState);
  const estimatedTokens = useMemo(() => 30, []);

  return (
    <form action={formAction} className="ok-card space-y-4 p-4 md:p-5">
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Título da campanha" name="title" required />
        <Field label="Categoria" name="category" required />
      </div>

      <div>
        <label className="ok-label">Descrição</label>
        <textarea
          name="description"
          required
          minLength={10}
          className="ok-input h-28"
          placeholder="Descreva o objetivo da campanha e o resultado esperado."
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Cidade" name="city" required />
        <Field label="Bairro/região" name="neighborhood" required />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Select
          label="Plataforma social"
          name="socialPlatform"
          options={[
            ["INSTAGRAM", "Instagram"],
            ["TIKTOK", "TikTok"],
            ["FACEBOOK", "Facebook"],
            ["YOUTUBE", "YouTube"],
            ["GOOGLE", "Google"],
            ["LOCAL", "Local"],
            ["OTHER", "Outra"],
          ]}
        />
        <Select
          label="Tipo de campanha"
          name="objective"
          options={CAMPAIGN_TYPES.map((item) => [item.value, item.label])}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="URL do conteúdo" name="contentUrl" type="url" />
        <Field label="Quantidade desejada de ações" name="desiredActions" type="number" defaultValue="100" required />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Data de início" name="startDate" type="date" required />
        <Field label="Data de término" name="endDate" type="date" required />
      </div>

      <div>
        <label className="ok-label">Instruções para o usuário</label>
        <textarea
          name="userInstructions"
          required
          minLength={10}
          className="ok-input h-28"
          placeholder="Explique o passo a passo que o usuário deve seguir para realizar a ação."
        />
      </div>

      <div>
        <label className="ok-label">Observações para análise do admin</label>
        <textarea
          name="adminNotes"
          className="ok-input h-24"
          placeholder="Inclua detalhes adicionais importantes para a revisão interna."
        />
      </div>

      {state.message ? (
        <p className={state.ok ? "text-sm text-okBlueDark" : "text-sm text-okPink"}>{state.message}</p>
      ) : null}

      <div className="rounded-2xl border border-[#f1dcff] bg-[#fcf6ff] p-3 text-sm text-[#755598]">
        Esta solicitação usará aproximadamente <strong>{estimatedTokens} tokens</strong>.
      </div>

      <button type="submit" disabled={pending} className="ok-btn-primary w-full disabled:opacity-60">
        {pending ? "Enviando para análise..." : "Enviar campanha para análise"}
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
};

function Field({ label, name, type = "text", required, defaultValue }: FieldProps) {
  return (
    <div>
      <label className="ok-label">{label}</label>
      <input name={name} type={type} required={required} defaultValue={defaultValue} className="ok-input" />
    </div>
  );
}

type SelectProps = {
  label: string;
  name: string;
  options: [string, string][];
};

function Select({ label, name, options }: SelectProps) {
  return (
    <div>
      <label className="ok-label">{label}</label>
      <select name={name} className="ok-input">
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}
