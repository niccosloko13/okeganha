import Link from "next/link";

import { blockUserAction, unblockUserAction } from "@/app/actions/admin-actions";
import { markUserVerified } from "@/app/actions/admin-user-actions";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { UserRiskBadge } from "@/components/admin/UserRiskBadge";
import { calculateRisk, computeUserBalance, maskCpf } from "@/lib/admin-user-utils";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminUsuariosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim().toLowerCase()  : "";
  const status = typeof params.status === "string" ? params.status  : "";
  const onboarding = typeof params.onboarding === "string" ? params.onboarding  : "";
  const verification = typeof params.verification === "string" ? params.verification  : "";
  const withBalance = params.withBalance === "1";
  const withPendingWithdrawal = params.withPendingWithdrawal === "1";
  const withPendingTask = params.withPendingTask === "1";
  const riskFilter = typeof params.risk === "string" ? params.risk  : "";

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      taskSubmissions: { select: { status: true, submittedAt: true, proofText: true } },
      walletTxs: { select: { type: true, amount: true } },
      withdrawals: { select: { status: true, requestedAt: true } },
    },
  });

  const enriched = users.map((user) => {
    const approved = user.taskSubmissions.filter((item) => item.status === "APPROVED").length;
    const pending = user.taskSubmissions.filter((item) => item.status === "PENDING").length;
    const rejected = user.taskSubmissions.filter((item) => item.status === "REJECTED").length;
    const pendingWithdrawals = user.withdrawals.filter((item) => item.status === "PENDING").length;
    const incomplete = !user.onboardingCompleted || !user.cpf || !user.pixKey || !user.bankName;
    const sameDayCount = user.taskSubmissions.filter((item) => item.submittedAt >= new Date(Date.now() - 1000 * 60 * 60 * 24)).length;
    const shortProofs = user.taskSubmissions.filter((item) => item.proofText.trim().length < 25).length;
    const recentWithdrawals = user.withdrawals.filter((item) => item.requestedAt >= new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)).length;
    const balance = computeUserBalance(user.walletTxs);
    const risk = calculateRisk({
      pending,
      rejected, blocked: user.status === "BLOCKED",
      incomplete,
      sameDayCount,
      recentWithdrawals,
      shortProofs,
    });

    return { user, approved, pending, rejected, pendingWithdrawals, incomplete, balance, risk };
  });

  const filtered = enriched.filter((row) => {
    const content = `${row.user.id} ${row.user.name} ${row.user.email} ${row.user.cpf ?? ""} ${row.user.phone ?? ""}`.toLowerCase();
    if (q && !content.includes(q)) return false;
    if (status && row.user.status !== status) return false;
    if (onboarding === "complete" && row.incomplete) return false;
    if (onboarding === "incomplete" && !row.incomplete) return false;
    if (verification && row.user.identityVerificationStatus !== verification) return false;
    if (withBalance && row.balance <= 0) return false;
    if (withPendingWithdrawal && row.pendingWithdrawals === 0) return false;
    if (withPendingTask && row.pending === 0) return false;
    if (riskFilter && row.risk.level !== riskFilter) return false;
    return true;
  });

  const metrics = {
    total: enriched.length, active: enriched.filter((row) => row.user.status === "ACTIVE").length, blocked: enriched.filter((row) => row.user.status === "BLOCKED").length, incomplete: enriched.filter((row) => row.incomplete).length, pendingWithdrawals: enriched.reduce((acc, row) => acc + row.pendingWithdrawals, 0), highRisk: enriched.filter((row) => row.risk.level === "HIGH").length, totalBalance: enriched.reduce((acc, row) => acc + row.balance, 0), pendingTasks: enriched.reduce((acc, row) => acc + row.pending, 0),
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-extrabold text-[#34134f]">Usuários</h1>

      <section className="grid gap-2 md:grid-cols-4">
        <Metric label="Usuários totais" value={String(metrics.total)} />
        <Metric label="Ativos" value={String(metrics.active)} />
        <Metric label="Bloqueados" value={String(metrics.blocked)} />
        <Metric label="Cadastros incompletos" value={String(metrics.incomplete)} />
        <Metric label="Saques pendentes" value={String(metrics.pendingWithdrawals)} />
        <Metric label="Risco alto" value={String(metrics.highRisk)} />
        <Metric label="Saldo total disponível" value={formatMoney(metrics.totalBalance)} />
        <Metric label="Tarefas pendentes" value={String(metrics.pendingTasks)} />
      </section>

      <form className="ok-card grid gap-2 p-4 md:grid-cols-4">
        <input name="q" defaultValue={q} className="ok-input" placeholder="Buscar por nome, email, CPF, telefone, ID" />
        <select name="status" defaultValue={status} className="ok-input">
          <option value="">Todos os status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="BLOCKED">BLOCKED</option>
          <option value="PENDING">PENDING</option>
        </select>
        <select name="onboarding" defaultValue={onboarding} className="ok-input">
          <option value="">Cadastro completo/incompleto</option>
          <option value="complete">Completo</option>
          <option value="incomplete">Incompleto</option>
        </select>
        <select name="verification" defaultValue={verification} className="ok-input">
          <option value="">Verificação facial</option>
          <option value="PENDING">Pendente</option>
          <option value="VERIFIED">Verificado</option>
          <option value="NOT_VERIFIED">Não verificado</option>
        </select>
        <select name="risk" defaultValue={riskFilter} className="ok-input">
          <option value="">Risco</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-[#6f4f8f]"><input type="checkbox" name="withBalance" value="1" defaultChecked={withBalance} /> Saldo maior que zero</label>
        <label className="flex items-center gap-2 text-sm text-[#6f4f8f]"><input type="checkbox" name="withPendingWithdrawal" value="1" defaultChecked={withPendingWithdrawal} /> Com saque pendente</label>
        <label className="flex items-center gap-2 text-sm text-[#6f4f8f]"><input type="checkbox" name="withPendingTask" value="1" defaultChecked={withPendingTask} /> Com tarefas pendentes</label>
        <button type="submit" className="ok-btn-primary">Aplicar filtros</button>
      </form>

      <AdminTable>
        <table className="w-full min-w-[1450px] text-sm">
          <thead className="bg-[#faf4ff] text-left text-xs uppercase tracking-wide text-[#7e62a0]">
            <tr>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">CPF</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Saldo disponível</th>
              <th className="px-4 py-3">Aprovadas</th>
              <th className="px-4 py-3">Pendentes</th>
              <th className="px-4 py-3">Reprovadas</th>
              <th className="px-4 py-3">Saques pendentes</th>
              <th className="px-4 py-3">Risco</th>
              <th className="px-4 py-3">Cadastro</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.user.id} className="border-t border-[#f0e3ff] align-top">
                <td className="px-4 py-3 font-semibold text-[#4d2e75]">{row.user.name}</td>
                <td className="px-4 py-3">{row.user.email}</td>
                <td className="px-4 py-3">{row.user.phone ?? "-"}</td>
                <td className="px-4 py-3">{maskCpf(row.user.cpf)}</td>
                <td className="px-4 py-3"><AdminStatusBadge status={row.user.status} /></td>
                <td className="px-4 py-3">{formatMoney(row.balance)}</td>
                <td className="px-4 py-3">{row.approved}</td>
                <td className="px-4 py-3">{row.pending}</td>
                <td className="px-4 py-3">{row.rejected}</td>
                <td className="px-4 py-3">{row.pendingWithdrawals}</td>
                <td className="px-4 py-3"><UserRiskBadge level={row.risk.level} /></td>
                <td className="px-4 py-3">{formatDate(row.user.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/usuarios/${row.user.id}`} className="ok-btn-secondary">Ver detalhes</Link>
                    {row.user.status === "ACTIVE" ? (
                      <form action={blockUserAction}>
                        <input type="hidden" name="userId" value={row.user.id} />
                        <button type="submit" className="ok-btn-secondary">Bloquear</button>
                      </form>
                    ) : (
                      <form action={unblockUserAction}>
                        <input type="hidden" name="userId" value={row.user.id} />
                        <button type="submit" className="ok-btn-secondary">Desbloquear</button>
                      </form>
                    )}
                    <form action={markUserVerified}>
                      <input type="hidden" name="userId" value={row.user.id} />
                      <button type="submit" className="ok-btn-secondary">Marcar verificado</button>
                    </form>
                    <Link href={`/admin/usuarios/${row.user.id}tab=carteira`} className="ok-btn-secondary">Ajustar saldo</Link>
                    <Link href={`/admin/usuarios/${row.user.id}tab=seguranca`} className="ok-btn-secondary">Enviar para revisão</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTable>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="ok-card p-3">
      <p className="text-xs uppercase tracking-wide text-[#7a5a99]">{label}</p>
      <p className="mt-1 text-xl font-black text-[#351456]">{value}</p>
    </article>
  );
}
