import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addCompanySocialPostAction,
  adjustCompanyTokensAction,
  importCompanyTestPostsAction,
  startCompanyImpersonationAction,
  updateCompanyPlanAction,
} from "@/app/actions/admin-actions";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { CompanyModerationActions } from "@/components/admin/CompanyModerationActions";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dates";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const tabs = [
  ["geral", "Visão geral"],
  ["dados", "Dados cadastrais"],
  ["redes", "Redes sociais"],
  ["posts", "Posts detectados"],
  ["campanhas", "Campanhas"],
  ["tokens", "Tokens e plano"],
  ["historico", "Histórico"],
] as const;

function formatCnpj(value: string | null) {
  if (!value) return "-";
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length !== 14) return value;
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

function formatWhatsapp(value: string | null) {
  if (!value) return "-";
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length !== 11) return value;
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

export default async function AdminEmpresaDetalhePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const tab = typeof query.tab === "string" ? query.tab : "geral";

  const company = await db.company.findUnique({
    where: { id },
    include: {
      campaigns: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      tokenLedger: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      impersonationLogs: {
        orderBy: { startedAt: "desc" },
        take: 20,
        include: {
          admin: {
            select: { name: true, email: true },
          },
        },
      },
      socialPosts: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!company) return notFound();

  const activeCampaigns = company.campaigns.filter((campaign) => campaign.status === "ACTIVE").length;

  return (
    <section className="space-y-4">
      <section className="ok-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#34134f]">{company.tradeName}</h1>
            <p className="text-sm text-[#7a5a99]">{company.publicId} • {company.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <AdminStatusBadge status={company.status} />
            <AdminStatusBadge status={company.plan} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <form action={startCompanyImpersonationAction}>
            <input type="hidden" name="companyId" value={company.id} />
            <button type="submit" className="ok-btn-secondary">Entrar como empresa</button>
          </form>
          <CompanyModerationActions companyId={company.id} />
        </div>
      </section>

      <nav className="ok-card flex flex-wrap gap-2 p-3">
        {tabs.map(([value, label]) => (
          <a
            key={value}
            href={`tab=${value}`}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${
              tab === value ? "bg-[#f5e8ff] text-[#4f2379]" : "text-[#785b99] hover:bg-[#f7efff]"
            }`}
          >
            {label}
          </a>
        ))}
      </nav>

      {tab === "geral" ? (
        <section className="grid gap-3 md:grid-cols-3">
          <Card label="ID público" value={company.publicId} />
          <Card label="Tokens disponíveis" value={String(company.tokensBalance)} />
          <Card label="Campanhas ativas" value={String(activeCampaigns)} />
          <Card label="Posts cadastrados" value={String(company.socialPosts.length)} />
          <Card label="Responsável" value={company.responsibleName} />
          <Card label="WhatsApp" value={formatWhatsapp(company.responsibleWhatsapp)} />
        </section>
      ) : null}

      {tab === "dados" ? (
        <section className="ok-card grid gap-2 p-4 text-sm text-[#6f4f8f] md:grid-cols-2">
          <p><span className="font-semibold">Nome fantasia:</span> {company.tradeName}</p>
          <p><span className="font-semibold">Razão social:</span> {company.legalName ?? "-"}</p>
          <p><span className="font-semibold">CNPJ:</span> {formatCnpj(company.cnpj)}</p>
          <p><span className="font-semibold">E-mail:</span> {company.email}</p>
          <p><span className="font-semibold">Telefone:</span> {company.phone ?? "-"}</p>
          <p><span className="font-semibold">Cidade:</span> {company.city}</p>
          <p><span className="font-semibold">Bairro:</span> {company.neighborhood ?? "-"}</p>
          <p><span className="font-semibold">Categoria:</span> {company.category ?? "-"}</p>
        </section>
      ) : null}

      {tab === "redes" ? (
        <section className="space-y-4">
          <article className="ok-card grid gap-2 p-4 text-sm text-[#6f4f8f] md:grid-cols-2">
            <p><span className="font-semibold">Instagram:</span> {company.instagramUrl ?? "-"}</p>
            <p><span className="font-semibold">Facebook:</span> {company.facebookUrl ?? "-"}</p>
            <p><span className="font-semibold">TikTok:</span> {company.tiktokUrl ?? "-"}</p>
            <p><span className="font-semibold">Google Meu Negócio:</span> {company.googleBusinessUrl ?? "-"}</p>
            <p><span className="font-semibold">Site:</span> {company.websiteUrl ?? "-"}</p>
          </article>

          <article className="ok-card space-y-3 p-4">
            <h2 className="text-lg font-extrabold text-[#3a1658]">Adicionar post manualmente</h2>
            <form action={addCompanySocialPostAction} className="grid gap-2 md:grid-cols-2">
              <input type="hidden" name="companyId" value={company.id} />
              <div>
                <label className="ok-label">Plataforma</label>
                <select name="platform" className="ok-input" defaultValue="INSTAGRAM">
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="YOUTUBE">YouTube</option>
                  <option value="GOOGLE">Google</option>
                  <option value="OTHER">Outra</option>
                </select>
              </div>
              <Input name="url" label="URL do post ou vídeo" required />
              <Input name="title" label="Título" />
              <Input name="thumbnailUrl" label="Thumbnail URL" />
              <Input name="durationSeconds" label="Duração em segundos" type="number" />
              <Input name="description" label="Descrição" />
              <button type="submit" className="ok-btn-primary md:col-span-2">Adicionar post</button>
            </form>
          </article>

          <article className="ok-card space-y-3 p-4">
            <h2 className="text-lg font-extrabold text-[#3a1658]">Detectar posts</h2>
            <p className="text-sm text-[#6f4f8f]">
              MVP seguro: sem login em rede social e sem scraping agressivo. Use links públicos.
            </p>
            <form action={importCompanyTestPostsAction} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="companyId" value={company.id} />
              <div>
                <label className="ok-label">Plataforma</label>
                <select name="platform" className="ok-input" defaultValue="INSTAGRAM">
                  <option value="INSTAGRAM">Instagram</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="YOUTUBE">YouTube</option>
                  <option value="GOOGLE">Google</option>
                  <option value="OTHER">Outra</option>
                </select>
              </div>
              <button type="submit" className="ok-btn-secondary">Importar até 10 links de teste</button>
            </form>
          </article>
        </section>
      ) : null}

      {tab === "posts" ? (
        <section className="grid gap-3 md:grid-cols-2">
          {company.socialPosts.map((post) => (
            <article key={post.id} className="ok-card space-y-2 p-3">
              <div className="relative h-40 overflow-hidden rounded-xl border border-[#f0e3ff] bg-[#faf3ff]">
                {post.thumbnailUrl ? (
                  <img src={post.thumbnailUrl} alt={post.title ?? "Thumbnail do post"} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-xs font-semibold text-[#7b5a9c]">OKEGANHA</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#4d2e75]">{post.title ?? "Post sem título"}</p>
                <AdminStatusBadge status={post.status} />
              </div>
              <p className="text-xs text-[#7a5a99]">{post.platform} • {post.durationSeconds ? `${post.durationSeconds}s` : "Duração não informada"}</p>
              <a href={post.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-[#6a3f93] underline">
                {post.url}
              </a>
              <Link href={`/admin/campanhas/novacompanyId=${company.id}&postId=${post.id}`} className="ok-btn-secondary inline-flex">
                Usar em campanha
              </Link>
            </article>
          ))}
        </section>
      ) : null}

      {tab === "campanhas" ? (
        <section className="ok-card space-y-2 p-4">
          {company.campaigns.map((campaign) => (
            <article key={campaign.id} className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-sm">
              <p className="font-semibold text-[#4d2e75]">{campaign.title}</p>
              <p className="text-xs text-[#7a5a99]">{campaign.status} • {campaign.socialPlatform} • {campaign.objective}</p>
            </article>
          ))}
        </section>
      ) : null}

      {tab === "tokens" ? (
        <section className="grid gap-4 md:grid-cols-2">
          <article className="ok-card space-y-3 p-4">
            <h2 className="text-lg font-extrabold text-[#3a1658]">Plano e status</h2>
            <form action={updateCompanyPlanAction} className="space-y-2">
              <input type="hidden" name="companyId" value={company.id} />
              <div>
                <label className="ok-label">Plano</label>
                <select name="plan" className="ok-input" defaultValue={company.plan}>
                  <option value="FREE">FREE</option>
                  <option value="BASIC">BASIC</option>
                  <option value="PREMIUM">PREMIUM</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </div>
              <div>
                <label className="ok-label">Status do plano</label>
                <select name="planStatus" className="ok-input" defaultValue={company.planStatus}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAST_DUE">PAST_DUE</option>
                  <option value="CANCELED">CANCELED</option>
                  <option value="TRIAL">TRIAL</option>
                </select>
              </div>
              <button type="submit" className="ok-btn-primary w-full">Salvar plano</button>
            </form>
          </article>

          <article className="ok-card space-y-3 p-4">
            <h2 className="text-lg font-extrabold text-[#3a1658]">Ajustar tokens</h2>
            <form action={adjustCompanyTokensAction} className="space-y-2">
              <input type="hidden" name="companyId" value={company.id} />
              <Input name="amount" label="Quantidade (+ ou -)" type="number" required />
              <Input name="description" label="Descrição" required />
              <button type="submit" className="ok-btn-secondary w-full">Aplicar ajuste</button>
            </form>
          </article>
        </section>
      ) : null}

      {tab === "historico" ? (
        <section className="ok-card space-y-4 p-4">
          <div>
            <h3 className="text-sm font-extrabold text-[#3a1658]">Movimentações de tokens</h3>
            <div className="mt-2 space-y-2">
              {company.tokenLedger.map((entry) => (
                <article key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-sm">
                  <div>
                    <p className="font-semibold text-[#4d2e75]">{entry.description}</p>
                    <p className="text-xs text-[#7a5a99]">{entry.type} • {formatDate(entry.createdAt)}</p>
                  </div>
                  <p className={`font-bold ${entry.amount >= 0 ? "text-[#2d7d4f]" : "text-[#933f6c]"}`}>
                    {entry.amount >= 0 ? `+${entry.amount}` : entry.amount} tokens
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold text-[#3a1658]">Logs de impersonação</h3>
            <div className="mt-2 space-y-2">
              {company.impersonationLogs.length === 0 ? (
                <p className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-xs text-[#7a5a99]">
                  Sem registros de visualização por admin.
                </p>
              ) : (
                company.impersonationLogs.map((log) => (
                  <article key={log.id} className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-xs text-[#6f4f8f]">
                    <p className="font-semibold text-[#4d2e75]">{log.admin.name} ({log.admin.email})</p>
                    <p>Início: {formatDate(log.startedAt)} • Fim: {log.endedAt ? formatDate(log.endedAt) : "em andamento"}</p>
                    <p>Duração: {log.durationSeconds ? `${log.durationSeconds}s` : "-"}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      ) : null}
    </section>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <article className="ok-card p-4">
      <p className="text-xs uppercase tracking-wide text-[#7a5a99]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[#351456]">{value}</p>
    </article>
  );
}

function Input({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="ok-label">{label}</label>
      <input name={name} type={type} required={required} className="ok-input" />
    </div>
  );
}

