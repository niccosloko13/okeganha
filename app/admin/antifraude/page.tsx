import Link from "next/link";

import { UserRiskBadge } from "@/components/admin/UserRiskBadge";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dates";

export default async function AdminAntifraudePage() {
  const [users, recentEvents, suspiciousLogs, blockedUsers] = await Promise.all([
    db.user.findMany({
      select: {
        id: true, name: true,
        email: true, status: true, riskEvents: {
          orderBy: { createdAt: "desc" },
          take: 10, select: { severity: true, reason: true, createdAt: true },
        },
      },
      take: 100,
    }),
    db.userRiskEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 50, include: { user: { select: { id: true, name: true, email: true } } },
    }),
    db.userActivityLog.findMany({
      where: { type: "SUSPICIOUS_ACTIVITY" },
      orderBy: { createdAt: "desc" },
      take: 50, include: { user: { select: { id: true, name: true, email: true } } },
    }),
    db.user.count({ where: { status: "BLOCKED" } }),
  ]);

  const usersByRisk = {
    low: 0, medium: 0,
    high: 0, critical: 0,
  };

  for (const user of users) {
    const hasCritical = user.riskEvents.some((event) => event.severity === "CRITICAL");
    const hasHigh = user.riskEvents.some((event) => event.severity === "HIGH");
    const hasMedium = user.riskEvents.some((event) => event.severity === "MEDIUM");

    if (hasCritical) usersByRisk.critical += 1;
    else if (hasHigh) usersByRisk.high += 1;
    else if (hasMedium) usersByRisk.medium += 1;
    else usersByRisk.low += 1;
  }

  return (
    <section className="space-y-4">
      <header className="ok-card p-4">
        <h1 className="text-2xl font-extrabold text-[#34134f]">Painel antifraude</h1>
        <p className="mt-1 text-sm text-[#745792]">Monitoramento comportamental, risco dinâmico e bloqueios automáticos.</p>
      </header>

      <section className="grid gap-3 md:grid-cols-5">
        <Metric label="Risco LOW" value={String(usersByRisk.low)} />
        <Metric label="Risco MEDIUM" value={String(usersByRisk.medium)} />
        <Metric label="Risco HIGH" value={String(usersByRisk.high)} />
        <Metric label="Risco CRITICAL" value={String(usersByRisk.critical)} />
        <Metric label="Contas bloqueadas" value={String(blockedUsers)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="ok-card p-4">
          <h2 className="text-lg font-extrabold text-[#3a1658]">Alertas recentes</h2>
          <div className="mt-3 space-y-2">
            {recentEvents.map((event) => (
              <article key={event.id} className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-[#4d2e75]">{event.user.name}</p>
                  <UserRiskBadge level={event.severity === "CRITICAL" ? "HIGH" : event.severity === "HIGH" ? "HIGH" : event.severity === "MEDIUM" ? "MEDIUM" : "LOW"} />
                </div>
                <p className="text-xs text-[#7a5a99]">{event.reason}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-[#7a5a99]">
                  <span>{event.user.email}</span>
                  <span>{formatDate(event.createdAt)}</span>
                </div>
                <Link href={`/admin/usuarios/${event.user.id}tab=antifraude`} className="mt-2 inline-flex text-xs font-semibold text-[#5f3390] underline">
                  Abrir usuário
                </Link>
              </article>
            ))}
          </div>
        </article>

        <article className="ok-card p-4">
          <h2 className="text-lg font-extrabold text-[#3a1658]">Logs suspeitos</h2>
          <div className="mt-3 space-y-2">
            {suspiciousLogs.map((log) => (
              <article key={log.id} className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-sm">
                <p className="font-semibold text-[#4d2e75]">{log.user.name}</p>
                <p className="text-xs text-[#7a5a99]">{log.interactionType ?? "SUSPICIOUS_ACTIVITY"}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-[#7a5a99]">
                  <span>{log.user.email}</span>
                  <span>{formatDate(log.createdAt)}</span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="ok-card p-3">
      <p className="text-xs uppercase tracking-wide text-[#7a5a99]">{label}</p>
      <p className="mt-1 text-2xl font-black text-[#351456]">{value}</p>
    </article>
  );
}
