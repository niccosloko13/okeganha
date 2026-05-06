"use client";

import { useActionState, useMemo, useState } from "react";

import { createCampaign, updateCampaign } from "@/app/actions/admin-actions";
import { estimateCampaignTokens } from "@/lib/campaign-token-estimator";
import type { ActionState } from "@/types";

type CompanyOption = {
  id: string;
  tradeName: string;
  city: string;
  neighborhood: string | null;
  category: string | null;
  socialPosts: Array<{
    id: string;
    platform: string;
    title: string | null;
    url: string;
  }>;
};

type CampaignFormValues = {
  id: string;
  companyId: string;
  companySocialPostId: string;
  title: string;
  description: string;
  city: string;
  neighborhood: string;
  category: string;
  socialPlatform: string;
  contentUrl: string;
  objective: string;
  goalQuantity: number;
  rewardPerTask: number;
  dailyLimitPerUser: number;
  totalBudget: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "PAUSED";
};

type CampaignFormProps = {
  mode: "create" | "edit";
  companies: CompanyOption[];
  initial: CampaignFormValues;
};

const initialState: ActionState = { ok: false };

export function CampaignForm({ mode, companies, initial }: CampaignFormProps) {
  const action = mode === "create" ? createCampaign : updateCampaign;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [companyId, setCompanyId] = useState(initial.companyId ?? companies[0].id ?? "");
  const [objective, setObjective] = useState(initial.objective ?? "WATCH_VIDEO");
  const [goalQuantity, setGoalQuantity] = useState(initial.goalQuantity ?? 100);

  const selectedCompany = useMemo(() => companies.find((company) => company.id === companyId), [companies, companyId]);
  const estimatedTokens = estimateCampaignTokens({
    objective: objective as Parameters<typeof estimateCampaignTokens>[0]["objective"], quantity: goalQuantity,
  });

  return (
    <form action={formAction} className="ok-card space-y-3 p-4">
      {mode === "edit" && initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="companyId" value={companyId} />

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="ok-label">Empresa cadastrada</label>
          <select className="ok-input" value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.tradeName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="ok-label">Post da empresa</label>
          <select name="companySocialPostId" defaultValue={initial.companySocialPostId ?? ""} className="ok-input">
            <option value="">Sem post selecionado</option>
            {(selectedCompany?.socialPosts ?? []).map((post) => (
              <option key={post.id} value={post.id}>
                {post.platform} â€¢ {post.title ?? post.url}
              </option>
            ))}
          </select>
        </div>
        <Field label="Título sugerido" name="title" defaultValue={initial.title} required />
      </div>

      <div>
        <label className="ok-label">Descrição</label>
        <textarea name="description" defaultValue={initial.description} required className="ok-input h-28" />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Field label="Cidade" name="city" defaultValue={initial.city ?? selectedCompany?.city ?? ""} required />
        <Field label="Bairro/Região" name="neighborhood" defaultValue={initial.neighborhood ?? selectedCompany?.neighborhood ?? ""} required />
        <Field label="Categoria" name="category" defaultValue={initial.category ?? selectedCompany?.category ?? ""} required />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Select
          label="Rede social"
          name="socialPlatform"
          defaultValue={initial.socialPlatform ?? "INSTAGRAM"}
          options={[
            ["INSTAGRAM", "INSTAGRAM"],
            ["FACEBOOK", "FACEBOOK"],
            ["TIKTOK", "TIKTOK"],
            ["YOUTUBE", "YOUTUBE"],
            ["GOOGLE", "GOOGLE"],
            ["LOCAL", "LOCAL"],
            ["OTHER", "OTHER"],
          ]}
        />

        <Select
          label="Tipo de ação"
          name="objective"
          defaultValue={initial.objective ?? "WATCH_VIDEO"}
          onChange={(value) => setObjective(value)}
          options={[
            ["WATCH_VIDEO", "WATCH_VIDEO"],
            ["VIEW_STORY", "VIEW_STORY"],
            ["LIKE_POST", "LIKE_POST"],
            ["COMMENT_POST", "COMMENT_POST"],
            ["FOLLOW_PROFILE", "FOLLOW_PROFILE"],
            ["REVIEW_BUSINESS", "REVIEW_BUSINESS"],
            ["CHECKIN_BUSINESS", "CHECKIN_BUSINESS"],
            ["VISIT_LOCAL", "VISIT_LOCAL"],
            ["OTHER", "OTHER"],
          ]}
        />

        <Select
          label="Status inicial"
          name="status"
          defaultValue={initial.status ?? "ACTIVE"}
          options={[
            ["ACTIVE", "ACTIVE"],
            ["PAUSED", "PAUSED"],
          ]}
        />
      </div>

      <Field label="URL da campanha/conteúdo" name="contentUrl" defaultValue={initial.contentUrl ?? ""} />

      <div className="grid gap-3 md:grid-cols-4">
        <Field label="Recompensa por ação (centavos)" name="rewardPerTask" type="number" defaultValue={String(initial.rewardPerTask ?? 800)} required />
        <Field label="Limite diário por usuário" name="dailyLimitPerUser" type="number" defaultValue={String(initial.dailyLimitPerUser ?? 2)} required />
        <Field
          label="Meta de ações"
          name="goalQuantity"
          type="number"
          defaultValue={String(initial.goalQuantity ?? 100)}
          required
          onChange={(value) => setGoalQuantity(Number(value))}
        />
        <Field label="Orçamento total (centavos)" name="totalBudget" type="number" defaultValue={String(initial.totalBudget ?? 250000)} required />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Data início" name="startDate" type="date" defaultValue={initial.startDate} required />
        <Field label="Data fim" name="endDate" type="date" defaultValue={initial.endDate} required />
      </div>

      <div className="rounded-2xl border border-[#f0e2ff] bg-[#fcf5ff] p-3 text-sm text-[#6e4b92]">
        Esta campanha consumirá aproximadamente <strong>{estimatedTokens} tokens</strong>.
      </div>

      {state.message ? <p className={state.ok ? "text-sm text-okBlueDark" : "text-sm text-okPink"}>{state.message}</p> : null}

      <button type="submit" disabled={pending} className="ok-btn-primary w-full disabled:opacity-60">
        {pending ? "Salvando..." : mode === "create" ? "Criar campanha" : "Salvar campanha"}
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  onChange?: (value: string) => void;
};

function Field({ label, name, defaultValue, required, type = "text", onChange }: FieldProps) {
  return (
    <div>
      <label className="ok-label">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        type={type}
        required={required}
        className="ok-input"
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      />
    </div>
  );
}

type SelectProps = {
  label: string;
  name: string;
  defaultValue?: string;
  options: [string, string][];
  onChange?: (value: string) => void;
};

function Select({ label, name, defaultValue, options, onChange }: SelectProps) {
  return (
    <div>
      <label className="ok-label">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue}
        className="ok-input"
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      >
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}
