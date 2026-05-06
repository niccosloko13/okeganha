import Link from "next/link";

import { db } from "@/lib/db";
import { formatDate } from "@/lib/dates";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLogsUsuariosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const userId = typeof params.userId === "string" ? params.userId  : "";
  const type = typeof params.type === "string" ? params.type  : "";
  const campaignId = typeof params.campaignId === "string" ? params.campaignId  : "";
  const allowedTypes = [
    "LOGIN",
    "LOGOUT",
    "VIEW_CAMPAIGN",
    "OPEN_TASK",
    "OPEN_EXTERNAL_CONTENT",
    "SUBMIT_PROOF",
    "REQUEST_WITHDRAWAL",
    "PROFILE_UPDATE",
    "SOCIAL_ACCOUNT_UPDATE",
    "SUSPICIOUS_ACTIVITY",
    "ACCOUNT_BLOCKED",
  ] as const;
  const activityType = allowedTypes.includes(type as (typeof allowedTypes)[number])
    ? (type as (typeof allowedTypes)[number])
    : undefined;

  const [users, campaigns, logs] = await Promise.all([
    db.user.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" }, take: 200 }),
    db.campaign.findMany({ select: { id: true, title: true }, orderBy: { createdAt: "desc" }, take: 200 }),
    db.userActivityLog.findMany({
      where: {
        userId: userId || undefined, type: activityType, campaignId: campaignId || undefined,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        campaign: { select: { title: true } },
        task: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
  ]);

  return (
    <section className="space-y-4">
      <header className="ok-card p-4">
        <h1 className="text-2xl font-extrabold text-[#34134f]">Logs detalhados de usuários</h1>
        <p className="mt-1 text-sm text-[#745792]">Timeline de comportamento, tempo de execução e interações de risco.</p>
      </header>

      <form className="ok-card grid gap-2 p-4 md:grid-cols-4">
        <select name="userId" defaultValue={userId} className="ok-input">
          <option value="">Todos os usuários</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
        <select name="type" defaultValue={type} className="ok-input">
          <option value="">Todos os tipos</option>
          <option value="LOGIN">LOGIN</option>
          <option value="OPEN_TASK">OPEN_TASK</option>
          <option value="OPEN_EXTERNAL_CONTENT">OPEN_EXTERNAL_CONTENT</option>
          <option value="SUBMIT_PROOF">SUBMIT_PROOF</option>
          <option value="REQUEST_WITHDRAWAL">REQUEST_WITHDRAWAL</option>
          <option value="SUSPICIOUS_ACTIVITY">SUSPICIOUS_ACTIVITY</option>
        </select>
        <select name="campaignId" defaultValue={campaignId} className="ok-input">
          <option value="">Todas as campanhas</option>
          {campaigns.map((campaign) => (
            <option key={campaign.id} value={campaign.id}>{campaign.title}</option>
          ))}
        </select>
        <button type="submit" className="ok-btn-primary">Filtrar logs</button>
      </form>

      <article className="ok-card p-4">
        <div className="space-y-2">
          {logs.map((log) => (
            <article key={log.id} className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-[#4d2e75]">{log.user.name} • {log.type}</p>
                <span className="text-xs text-[#7a5a99]">{formatDate(log.createdAt)}</span>
              </div>
              <p className="text-xs text-[#7a5a99]">{log.user.email}</p>
                      <p className="text-xs text-[#7a5a99]">Campanha: {log.campaign?.title ?? "-"} • Tarefa: {log.task?.title ?? "-"}</p>
              <p className="text-xs text-[#7a5a99]">Duração: {log.durationSeconds ?? 0}s • Perdas de foco: {log.focusLossCount ?? 0}</p>
              <Link href={`/admin/usuarios/${log.user.id}tab=antifraude`} className="text-xs font-semibold text-[#5f3390] underline">
                Ver usuário
              </Link>
            </article>
          ))}
          {logs.length === 0 ? <p className="text-sm text-[#7a5a99]">Nenhum log encontrado.</p> : null}
        </div>
      </article>
    </section>
  );
}
