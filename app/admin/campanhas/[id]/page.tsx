import { notFound } from "next/navigation";

import {
  activateCampaignAction,
  approveCampaignReviewAction,
  pauseCampaignAction,
  rejectCampaignReviewAction,
  updateCampaignOperationalConfigAction,
} from "@/app/actions/admin-actions";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";

type PageProps = {
  params: Promise<{ id: string }>;
};

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseCompanyPayload(description: string) {
  const desiredActions = description.match(/Quantidade desejada de ações:\s*(\d+)/i)?.[1];
  const adminNotes = description.match(/Observações para análise:\s*(.*)/i)?.[1] ?? "";
  const maxApprovedActions = description.match(/Meta de ações aprovadas:\s*(\d+)/i)?.[1];
  const priority = description.match(/Prioridade:\s*(LOW|MEDIUM|HIGH)/i)?.[1] ?? "MEDIUM";

  return {
    desiredActions: desiredActions ? Number(desiredActions) : 0,
    adminNotes,
    maxApprovedActions: maxApprovedActions ? Number(maxApprovedActions) : 0,
    priority,
  };
}

function reviewStatusLabel(status: string) {
  if (status === "UNDER_REVIEW") return "Aguardando aprovação";
  if (status === "REJECTED") return "Reprovada";
  if (status === "APPROVED") return "Aprovada";
  return "Rascunho";
}

export default async function AdminCampanhaDetalhePage({ params }: PageProps) {
  const { id } = await params;

  const campaign = await db.campaign.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          tradeName: true,
          responsibleName: true,
          responsibleWhatsapp: true,
          email: true,
        },
      },
      tasks: {
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  if (!campaign) return notFound();

  const parsed = parseCompanyPayload(campaign.description);
  const task = campaign.tasks[0];

  const missing: string[] = [];
  if (!campaign.rewardPerTask) missing.push("Recompensa por tarefa");
  if (!campaign.dailyLimitPerUser) missing.push("Limite diário por usuário");
  if (!campaign.totalBudget) missing.push("Orçamento total");
  if (campaign.socialPlatform !== "LOCAL" && campaign.socialPlatform !== "OTHER" && !campaign.contentUrl) missing.push("URL do conteúdo");
  if (!campaign.startDate || !campaign.endDate) missing.push("Data de início/fim");
  if (!task) missing.push("Tarefa vinculada");

  return (
    <section className="space-y-4">
      <div className="ok-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#34134f]">Revisão de campanha</h1>
            <p className="mt-1 text-sm text-[#7a5a99]">{campaign.title} • {campaign.companyName}</p>
          </div>
          <div className="flex items-center gap-2">
            <AdminStatusBadge status={campaign.status} />
            <AdminStatusBadge status={campaign.reviewStatus} />
          </div>
        </div>
      </div>

      <section className="ok-card space-y-2 p-4">
        <h2 className="text-lg font-extrabold text-[#3a1658]">Dados enviados pela empresa</h2>
        <div className="grid gap-2 text-sm text-[#6f4f8f] md:grid-cols-2">
          <p><strong>Empresa:</strong> {campaign.company?.tradeName ?? campaign.companyName}</p>
          <p><strong>Responsável:</strong> {campaign.company?.responsibleName ?? "-"}</p>
          <p><strong>WhatsApp:</strong> {campaign.company?.responsibleWhatsapp ?? "-"}</p>
          <p><strong>E-mail:</strong> {campaign.company?.email ?? "-"}</p>
          <p><strong>Título:</strong> {campaign.title}</p>
          <p><strong>Categoria:</strong> {campaign.category}</p>
          <p><strong>Cidade/Bairro:</strong> {campaign.city}/{campaign.neighborhood}</p>
          <p><strong>Plataforma:</strong> {campaign.socialPlatform}</p>
          <p><strong>Tipo de campanha:</strong> {campaign.objective}</p>
          <p><strong>URL:</strong> {campaign.contentUrl ?? "-"}</p>
          <p><strong>Quantidade desejada:</strong> {parsed.desiredActions || "-"}</p>
          <p><strong>Status de análise:</strong> {reviewStatusLabel(campaign.reviewStatus)}</p>
          <p className="md:col-span-2"><strong>Descrição:</strong> {campaign.description}</p>
          <p className="md:col-span-2"><strong>Instruções:</strong> {task.instructions ?? "-"}</p>
          <p className="md:col-span-2"><strong>Observações para análise:</strong> {parsed.adminNotes || "-"}</p>
        </div>
      </section>

      <section className="ok-card space-y-3 p-4">
        <h2 className="text-lg font-extrabold text-[#3a1658]">Configuração operacional do admin</h2>
        <form action={updateCampaignOperationalConfigAction} className="grid gap-3 md:grid-cols-2">
          <input type="hidden" name="campaignId" value={campaign.id} />

          <Field label="Recompensa por tarefa" name="rewardPerTask" type="number" defaultValue={String(campaign.rewardPerTask)} required />
          <Field label="Limite diário por usuário" name="dailyLimitPerUser" type="number" defaultValue={String(campaign.dailyLimitPerUser)} required />
          <Field label="Orçamento total" name="totalBudget" type="number" defaultValue={String(campaign.totalBudget)} required />
          <Field
            label="Quantidade máxima de ações aprovadas"
            name="maxApprovedActions"
            type="number"
            defaultValue={String(parsed.maxApprovedActions || parsed.desiredActions || 100)}
            required
          />
          <Field label="Data início" name="startDate" type="date" defaultValue={toDateInput(campaign.startDate)} required />
          <Field label="Data término" name="endDate" type="date" defaultValue={toDateInput(campaign.endDate)} required />

          <Select
            label="Status operacional"
            name="status"
            defaultValue={campaign.status}
            options={[
              ["ACTIVE", "ACTIVE"],
              ["PAUSED", "PAUSED"],
              ["FINISHED", "FINISHED"],
            ]}
          />
          <Select
            label="Prioridade da campanha"
            name="priority"
            defaultValue={parsed.priority}
            options={[
              ["LOW", "LOW"],
              ["MEDIUM", "MEDIUM"],
              ["HIGH", "HIGH"],
            ]}
          />

          <div className="md:col-span-2">
            <label className="ok-label">Instruções para o usuário</label>
            <textarea name="userInstructions" minLength={10} required className="ok-input h-24" defaultValue={task.instructions ?? ""} />
          </div>

          <div className="md:col-span-2">
            <label className="ok-label">Notas internas</label>
            <textarea name="internalNotes" className="ok-input h-20" defaultValue={parsed.adminNotes} />
          </div>

          <button type="submit" className="ok-btn-primary md:col-span-2">Salvar configuração operacional</button>
        </form>
      </section>

      <section className="ok-card space-y-3 p-4">
        <h2 className="text-lg font-extrabold text-[#3a1658]">Preview para usuário</h2>
        <article className="rounded-2xl border border-[#f0e3ff] bg-[#fcf9ff] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8a6aa8]">{campaign.companyName}</p>
          <h3 className="mt-1 text-lg font-extrabold text-[#3a1658]">{campaign.title}</h3>
          <p className="mt-1 text-sm text-[#6f4f8f]">Recompensa: {formatMoney(campaign.rewardPerTask)}</p>
          <p className="mt-1 text-sm text-[#6f4f8f]">Plataforma: {campaign.socialPlatform}</p>
          <p className="mt-2 text-sm text-[#6f4f8f]">Instruções resumidas: {(task.instructions ?? "-").slice(0, 180)}</p>
          {campaign.contentUrl ? <p className="mt-2 text-sm font-semibold text-[#5a3382]">CTA: Abrir conteúdo</p> : null}
        </article>
      </section>

      <section className="ok-card space-y-3 p-4">
        <h2 className="text-lg font-extrabold text-[#3a1658]">Validação antes de aprovar</h2>
        {missing.length > 0 ? (
          <div className="rounded-xl border border-[#ffd2df] bg-[#fff0f6] px-3 py-2 text-sm text-[#8f3b6b]">
            Pendências: {missing.join(", ")}.
          </div>
        ) : (
          <div className="rounded-xl border border-[#d6f4e2] bg-[#eefdf4] px-3 py-2 text-sm text-[#2f7b4f]">
            Todos os campos obrigatórios estão preenchidos para aprovação.
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <form action={approveCampaignReviewAction}>
            <input type="hidden" name="campaignId" value={campaign.id} />
            <button type="submit" className="ok-btn-primary" disabled={missing.length > 0}>Aprovar</button>
          </form>

          <form action={rejectCampaignReviewAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="campaignId" value={campaign.id} />
            <input
              name="rejectionReason"
              required
              minLength={8}
              className="ok-input w-72"
              placeholder="Motivo da reprovação"
            />
            <button type="submit" className="ok-btn-secondary">Reprovar</button>
          </form>

          {campaign.status === "ACTIVE" ? (
            <form action={pauseCampaignAction}>
              <input type="hidden" name="campaignId" value={campaign.id} />
              <button type="submit" className="ok-btn-secondary">Pausar</button>
            </form>
          ) : (
            <form action={activateCampaignAction}>
              <input type="hidden" name="campaignId" value={campaign.id} />
              <button type="submit" className="ok-btn-secondary">Ativar</button>
            </form>
          )}
        </div>
      </section>
    </section>
  );
}

function Field({ label, name, type = "text", defaultValue, required = false }: { label: string; name: string; type: string; defaultValue: string; required: boolean }) {
  return (
    <div>
      <label className="ok-label">{label}</label>
      <input className="ok-input" name={name} type={type} defaultValue={defaultValue} required={required} />
    </div>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: [string, string][];
}) {
  return (
    <div>
      <label className="ok-label">{label}</label>
      <select className="ok-input" name={name} defaultValue={defaultValue}>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </div>
  );
}
