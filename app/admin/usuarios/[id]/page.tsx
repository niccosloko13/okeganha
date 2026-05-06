import { notFound } from "next/navigation";

import {
  approveSubmissionAction,
  approveWithdrawalAction,
  blockUserAction,
  markWithdrawalPaidAction,
  rejectSubmissionAction,
  rejectWithdrawalAction,
  unblockUserAction,
  updateUserRoleAction,
} from "@/app/actions/admin-actions";
import {
  addInternalUserNote,
  adjustUserWallet,
  markUserVerified,
  updateUserSensitiveData,
} from "@/app/actions/admin-user-actions";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { RevealSensitiveField } from "@/components/admin/RevealSensitiveField";
import { UserRiskBadge } from "@/components/admin/UserRiskBadge";
import { calculateRisk, computeUserBalance, maskCpf, maskPix } from "@/lib/admin-user-utils";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const tabs = [
  ["geral", "Visão geral"],
  ["dados", "Dados cadastrais"],
  ["carteira", "Carteira"],
  ["tarefas", "Tarefas"],
  ["saques", "Saques"],
  ["seguranca", "Segurança"],
  ["historico", "Histï¿½rico"],
  ["antifraude", "Antifraude"],
] as const;

export default async function AdminUsuarioDetalhePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const q = await searchParams;
  const tab = typeof q.tab === "string" ? q.tab : "geral";
  const taskStatus = typeof q.taskStatus === "string" ? q.taskStatus : "";
  const withdrawalStatus = typeof q.withdrawalStatus === "string" ? q.withdrawalStatus : "";

  const user = await db.user.findUnique({
    where: { id },
    include: {
      taskSubmissions: {
        include: {
          campaign: { select: { id: true, title: true, companyName: true } },
          task: { select: { title: true } },
        },
        orderBy: { submittedAt: "desc" },
        take: 100,
      },
      withdrawals: { orderBy: { requestedAt: "desc" }, take: 100 },
      walletTxs: { orderBy: { createdAt: "desc" }, take: 120 },
      internalNotes: { include: { admin: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 50 },
      auditLogs: {
        where: { targetType: "USER", targetId: id },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      activityLogs: { orderBy: { createdAt: "desc" }, take: 100 },
      riskEvents: { orderBy: { createdAt: "desc" }, take: 100 },
    },
  });
  if (!user) return notFound();

  const balance = computeUserBalance(user.walletTxs);
  const approved = user.taskSubmissions.filter((item) => item.status === "APPROVED").length;
  const pending = user.taskSubmissions.filter((item) => item.status === "PENDING").length;
  const rejected = user.taskSubmissions.filter((item) => item.status === "REJECTED").length;
  const pendingWithdrawals = user.withdrawals.filter((item) => item.status === "PENDING").length;
  const incomplete = !user.onboardingCompleted || !user.cpf || !user.pixKey || !user.bankName;
  const sameDayCount = user.taskSubmissions.filter((item) => item.submittedAt >= new Date(Date.now() - 1000 * 60 * 60 * 24)).length;
  const shortProofs = user.taskSubmissions.filter((item) => item.proofText.trim().length < 25).length;
  const recentWithdrawals = user.withdrawals.filter((item) => item.requestedAt >= new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)).length;
  const risk = calculateRisk({
    pending,
    rejected, blocked: user.status === "BLOCKED",
    incomplete,
    sameDayCount,
    recentWithdrawals,
    shortProofs,
  });

  const totalCredits = user.walletTxs.filter((tx) => tx.amount > 0).reduce((acc, tx) => acc + tx.amount, 0);
  const totalDebits = user.walletTxs.filter((tx) => tx.amount < 0).reduce((acc, tx) => acc + Math.abs(tx.amount), 0);
  const totalHolds = user.walletTxs.filter((tx) => tx.type === "WITHDRAWAL_HOLD").reduce((acc, tx) => acc + tx.amount, 0);
  const totalPaid = user.walletTxs.filter((tx) => tx.type === "WITHDRAWAL_PAID").reduce((acc, tx) => acc + tx.amount, 0);
  const approvalRate = approved + rejected > 0 ? Math.round((approved / (approved + rejected)) * 100) : 0;
  const filteredTasks = taskStatus ? user.taskSubmissions.filter((item) => item.status === taskStatus) : user.taskSubmissions;
  const filteredWithdrawals = withdrawalStatus ? user.withdrawals.filter((item) => item.status === withdrawalStatus) : user.withdrawals;
  const recentRiskEvents = user.riskEvents.filter((event) => event.createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const highOrCriticalRecent = recentRiskEvents.filter((event) => event.severity === "HIGH" || event.severity === "CRITICAL").length;
  const suspiciousLogsRecent = user.activityLogs.filter(
    (log) => log.type === "SUSPICIOUS_ACTIVITY" && log.createdAt >= new Date(Date.now() - 24 * 60 * 60 * 1000),
  ).length;

  const summary =
    user.status === "BLOCKED" ? "Usuário bloqueado. Requer revisão manual antes de qualquer operação."
      : pendingWithdrawals > 0 ? "Usuário com saque pendente aguardando análise do time financeiro."
        : rejected >= 4 ? "Usuário com índice elevado de reprovações. Recomenda-se revisão antifraude."
          : approved >= 5 ? "Usuário ativo com boa recorrência de tarefas aprovadas."
            : "Usuário novo em acompanhamento inicial.";

  return (
    <section className="space-y-4">
      <section className="ok-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-[#34134f]">{user.name}</h1>
          <div className="flex items-center gap-2">
            <AdminStatusBadge status={user.status} />
            <AdminStatusBadge status={user.role} />
            <UserRiskBadge level={risk.level} />
          </div>
        </div>
        <p className="text-sm text-[#7a5a99]">{user.email}</p>
      </section>

      <nav className="ok-card flex flex-wrap gap-2 p-3">
        {tabs.map(([value, label]) => (
          <a key={value} href={`tab=${value}`} className={`rounded-xl px-3 py-2 text-sm font-semibold ${tab === value ? "bg-[#f5e8ff] text-[#4f2379]" : "text-[#785b99] hover:bg-[#f7efff]"}`}>
            {label}
          </a>
        ))}
      </nav>

      {tab === "geral" ? (
        <>
          <section className="grid gap-2 md:grid-cols-3">
            <Metric label="Saldo disponível" value={formatMoney(balance)} />
            <Metric label="Total ganho" value={formatMoney(totalCredits)} />
            <Metric label="Total sacado" value={formatMoney(totalPaid)} />
            <Metric label="Tarefas aprovadas" value={String(approved)} />
            <Metric label="Tarefas pendentes" value={String(pending)} />
            <Metric label="Tarefas reprovadas" value={String(rejected)} />
            <Metric label="Taxa de aprovação" value={`${approvalRate}%`} />
            <Metric label="Risco antifraude" value={risk.level} />
            <Metric label="Data de cadastro" value={formatDate(user.createdAt)} />
          </section>
          <article className="ok-card p-4">
            <h2 className="text-lg font-extrabold text-[#3a1658]">Resumo operacional</h2>
            <p className="mt-2 text-sm text-[#6f4f8f]">{summary}</p>
          </article>
        </>
      ) : null}

      {tab === "dados" ? (
        <section className="ok-card space-y-3 p-4">
          <div className="grid gap-2 text-sm text-[#6f4f8f] md:grid-cols-2">
            <p>Nome: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Telefone: {user.phone ?? "-"}</p>
            <p>CPF: {maskCpf(user.cpf)}</p>
            <p>Banco: {user.bankName ?? "-"}</p>
            <p>Pix: {maskPix(user.pixKey)}</p>
            <p>Status: {user.status}</p>
            <p>Role: {user.role}</p>
            <p>Cadastro completo: {user.onboardingCompleted ? "Sim" : "Não"}</p>
            <p>Criado em: {formatDate(user.createdAt)}</p>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <RevealSensitiveField userId={user.id} field="cpf" masked={maskCpf(user.cpf)} />
            <RevealSensitiveField userId={user.id} field="pixKey" masked={maskPix(user.pixKey)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {user.status === "ACTIVE" ? (
              <form action={blockUserAction}><input type="hidden" name="userId" value={user.id} /><button type="submit" className="ok-btn-secondary">Bloquear usuário</button></form>
            ) : (
              <form action={unblockUserAction}><input type="hidden" name="userId" value={user.id} /><button type="submit" className="ok-btn-secondary">Desbloquear usuário</button></form>
            )}
            <form action={updateUserRoleAction}>
              <input type="hidden" name="userId" value={user.id} />
              <input type="hidden" name="role" value={user.role === "ADMIN" ? "USER" : "ADMIN"} />
              <button type="submit" className="ok-btn-secondary">{user.role === "ADMIN" ? "Remover admin" : "Tornar admin"}</button>
            </form>
            <form action={markUserVerified}><input type="hidden" name="userId" value={user.id} /><button type="submit" className="ok-btn-secondary">Marcar cadastro revisado/verificado</button></form>
          </div>
          <form action={updateUserSensitiveData} className="grid gap-2 md:grid-cols-4">
            <input type="hidden" name="userId" value={user.id} />
            <input className="ok-input" name="phone" defaultValue={user.phone ?? ""} placeholder="Telefone" required />
            <input className="ok-input" name="pixKey" defaultValue={user.pixKey ?? ""} placeholder="Pix" required />
            <input className="ok-input" name="bankName" defaultValue={user.bankName ?? ""} placeholder="Banco" required />
            <button type="submit" className="ok-btn-primary">Salvar dados sensíveis</button>
          </form>
        </section>
      ) : null}

      {tab === "carteira" ? (
        <section className="space-y-3">
          <section className="grid gap-2 md:grid-cols-4">
            <Metric label="Saldo disponível" value={formatMoney(balance)} />
            <Metric label="Créditos" value={formatMoney(totalCredits)} />
            <Metric label="Débitos" value={formatMoney(totalDebits)} />
            <Metric label="Em hold" value={formatMoney(totalHolds)} />
          </section>
          <article className="ok-card p-4">
            <h2 className="text-lg font-extrabold text-[#3a1658]">Ajustar saldo</h2>
            <form action={adjustUserWallet} className="mt-2 grid gap-2 md:grid-cols-4">
              <input type="hidden" name="userId" value={user.id} />
              <select name="direction" className="ok-input"><option value="CREDIT">Crédito</option><option value="DEBIT">Débito</option></select>
              <input className="ok-input" name="amount" type="number" min={1} placeholder="Valor em centavos" required />
              <input className="ok-input" name="reason" placeholder="Motivo obrigatório" required />
              <button type="submit" className="ok-btn-primary">Aplicar ajuste</button>
            </form>
          </article>
          <article className="ok-card p-4">
            <h2 className="text-lg font-extrabold text-[#3a1658]">Histórico de transações</h2>
            <div className="mt-2 space-y-2">
              {user.walletTxs.map((tx) => (
                <div key={tx.id} className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-sm">
                  <p className="font-semibold text-[#4d2e75]">{tx.type} • {formatMoney(Math.abs(tx.amount))}</p>
                  <p className="text-xs text-[#7a5a99]">{tx.description} • {formatDate(tx.createdAt)}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      {tab === "tarefas" ? (
        <section className="ok-card p-4">
          <form className="mb-3 flex gap-2">
            <input type="hidden" name="tab" value="tarefas" />
            <select name="taskStatus" defaultValue={taskStatus} className="ok-input max-w-xs">
              <option value="">Todos os status</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
            <button className="ok-btn-secondary" type="submit">Filtrar</button>
          </form>
          <div className="space-y-2">
            {filteredTasks.map((submission) => (
              <article key={submission.id} className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-sm">
                <p className="font-semibold text-[#4d2e75]">{submission.campaign.title} • {submission.task.title}</p>
                <p className="text-xs text-[#7a5a99]">{submission.campaign.companyName} • {formatMoney(submission.rewardAmount)} • {submission.status}</p>
                <p className="text-xs text-[#7a5a99]">Envio: {formatDate(submission.submittedAt)} • Revisão: {submission.reviewedAt ? formatDate(submission.reviewedAt) : "-"}</p>
                <p className="text-xs text-[#7a5a99]">Motivo reprovação: {submission.rejectionReason ?? "-"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {submission.proofImageUrl ? <a href={submission.proofImageUrl} target="_blank" rel="noopener noreferrer" className="ok-btn-secondary">Abrir prova</a> : null}
                  <a href={`/admin/campanhas/${submission.campaign.id}`} className="ok-btn-secondary">Ver campanha</a>
                  {submission.status === "PENDING" ? (
                    <>
                      <form action={approveSubmissionAction}><input type="hidden" name="submissionId" value={submission.id} /><button type="submit" className="ok-btn-secondary">Aprovar</button></form>
                      <form action={rejectSubmissionAction} className="flex gap-2">
                        <input type="hidden" name="submissionId" value={submission.id} />
                        <input name="rejectionReason" className="ok-input" placeholder="Motivo" required />
                        <button type="submit" className="ok-btn-secondary">Reprovar</button>
                      </form>
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "saques" ? (
        <section className="ok-card p-4">
          <form className="mb-3 flex gap-2">
            <input type="hidden" name="tab" value="saques" />
            <select name="withdrawalStatus" defaultValue={withdrawalStatus} className="ok-input max-w-xs">
              <option value="">Todos os status</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="PAID">PAID</option>
              <option value="REJECTED">REJECTED</option>
            </select>
            <button className="ok-btn-secondary" type="submit">Filtrar</button>
          </form>
          <div className="space-y-2">
            {filteredWithdrawals.map((withdrawal) => (
              <article key={withdrawal.id} className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-sm">
                <p className="font-semibold text-[#4d2e75]">{formatMoney(withdrawal.amount)} • {withdrawal.status}</p>
                <p className="text-xs text-[#7a5a99]">Pix: {maskPix(withdrawal.pixKey)} • Solicitação: {formatDate(withdrawal.requestedAt)} • Pago: {withdrawal.paidAt ? formatDate(withdrawal.paidAt) : "-"}</p>
                <p className="text-xs text-[#7a5a99]">Motivo reprovação: {withdrawal.rejectionReason ?? "-"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {withdrawal.status === "PENDING" ? (
                    <>
                      <form action={approveWithdrawalAction}><input type="hidden" name="requestId" value={withdrawal.id} /><button type="submit" className="ok-btn-secondary">Aprovar</button></form>
                      <form action={rejectWithdrawalAction} className="flex gap-2">
                        <input type="hidden" name="requestId" value={withdrawal.id} />
                        <input name="rejectionReason" className="ok-input" placeholder="Motivo" required />
                        <button type="submit" className="ok-btn-secondary">Rejeitar</button>
                      </form>
                    </>
                  ) : null}
                  {withdrawal.status === "APPROVED" ? (
                    <form action={markWithdrawalPaidAction}><input type="hidden" name="requestId" value={withdrawal.id} /><button type="submit" className="ok-btn-secondary">Marcar como pago</button></form>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {tab === "seguranca" ? (
        <section className="ok-card space-y-2 p-4">
          <h2 className="text-lg font-extrabold text-[#3a1658]">Score antifraude</h2>
          <div className="flex items-center gap-2">
            <UserRiskBadge level={risk.level} />
            <span className="text-sm text-[#6f4f8f]">Motivos: {risk.reasons.length > 0 ? risk.reasons.join(", ") : "Sem alertas relevantes."}</span>
          </div>
          <div className="space-y-1 text-sm text-[#6f4f8f]">
            <p>• Muitas pendências: {pending}</p>
            <p>• Reprovações: {rejected}</p>
            <p>• Tarefas no último dia: {sameDayCount}</p>
            <p>• Saques recentes: {recentWithdrawals}</p>
            <p>• Provas curtas: {shortProofs}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.status === "ACTIVE" ? (
              <form action={blockUserAction}><input type="hidden" name="userId" value={user.id} /><button type="submit" className="ok-btn-secondary">Bloquear usuário</button></form>
            ) : (
              <form action={unblockUserAction}><input type="hidden" name="userId" value={user.id} /><button type="submit" className="ok-btn-secondary">Liberar usuário</button></form>
            )}
            <form action={markUserVerified}><input type="hidden" name="userId" value={user.id} /><button type="submit" className="ok-btn-secondary">Marcar como verificado</button></form>
          </div>
          <form action={addInternalUserNote} className="grid gap-2 md:grid-cols-4">
            <input type="hidden" name="userId" value={user.id} />
            <input name="note" className="ok-input md:col-span-3" placeholder="Adicionar observação interna" required />
            <button type="submit" className="ok-btn-primary">Salvar observação</button>
          </form>
        </section>
      ) : null}

      {tab === "antifraude" ? (
        <section className="space-y-3">
          <article className="ok-card p-4">
            <h2 className="text-lg font-extrabold text-[#3a1658]">Score atual de risco</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <UserRiskBadge level={risk.level} />
              <span className="text-sm text-[#6f4f8f]">
                Frequência recente: {highOrCriticalRecent} eventos HIGH/CRITICAL (7 dias) e {suspiciousLogsRecent} logs suspeitos (24h).
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {user.status === "ACTIVE" ? (
                <form action={blockUserAction}><input type="hidden" name="userId" value={user.id} /><button type="submit" className="ok-btn-secondary">Bloquear</button></form>
              ) : (
                <form action={unblockUserAction}><input type="hidden" name="userId" value={user.id} /><button type="submit" className="ok-btn-secondary">Desbloquear</button></form>
              )}
              <form action={markUserVerified}><input type="hidden" name="userId" value={user.id} /><button type="submit" className="ok-btn-secondary">Marcar como revisado</button></form>
            </div>
          </article>
          <article className="ok-card p-4">
            <h2 className="text-lg font-extrabold text-[#3a1658]">Eventos de risco</h2>
            <div className="mt-2 space-y-2">
              {user.riskEvents.length === 0 ? (
                <p className="text-sm text-[#7a5a99]">Nenhum evento de risco registrado.</p>
              ) : (
                user.riskEvents.map((event) => (
                  <article key={event.id} className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-sm">
                    <p className="font-semibold text-[#4d2e75]">{event.severity} • {event.reason}</p>
                    <p className="text-xs text-[#7a5a99]">{formatDate(event.createdAt)}</p>
                  </article>
                ))
              )}
            </div>
          </article>
          <article className="ok-card p-4">
            <h2 className="text-lg font-extrabold text-[#3a1658]">Logs de atividade</h2>
            <div className="mt-2 space-y-2">
              {user.activityLogs.length === 0 ? (
                <p className="text-sm text-[#7a5a99]">Nenhum log de atividade disponível.</p>
              ) : (
                user.activityLogs.map((log) => (
                  <article key={log.id} className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-sm">
                    <p className="font-semibold text-[#4d2e75]">{log.type}</p>
                    <p className="text-xs text-[#7a5a99]">{formatDate(log.createdAt)}</p>
                  </article>
                ))
              )}
            </div>
          </article>
        </section>
      ) : null}

      {tab === "historico" ? (
        <section className="ok-card p-4">
          <h2 className="text-lg font-extrabold text-[#3a1658]">Histórico</h2>
          <div className="mt-2 space-y-2">
            {user.auditLogs.map((log) => (
              <article key={log.id} className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-sm">
                <p className="font-semibold text-[#4d2e75]">{log.action}</p>
                <p className="text-xs text-[#7a5a99]">{log.description}</p>
                <p className="text-xs text-[#7a5a99]">{formatDate(log.createdAt)}</p>
              </article>
            ))}
            {user.internalNotes.map((note) => (
              <article key={note.id} className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2 text-sm">
                <p className="font-semibold text-[#4d2e75]">{note.admin.name}</p>
                <p className="text-xs text-[#7a5a99]">{note.note}</p>
                <p className="text-xs text-[#7a5a99]">{formatDate(note.createdAt)}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
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



