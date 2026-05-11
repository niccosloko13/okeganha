import { UserRiskBadge } from "@/components/admin/UserRiskBadge";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/dates";

function riskFromCounters(value: number): "LOW" | "MEDIUM" | "HIGH" {
  if (value >= 6) return "HIGH";
  if (value >= 3) return "MEDIUM";
  return "LOW";
}

export default async function AdminSegurancaPage() {
  const [users, submissions, withdrawals] = await Promise.all([
    db.user.findMany({
      include: {
        _count: {
          select: {
            taskSubmissions: true,
          },
        },
        taskSubmissions: {
          select: {
            status: true, submittedAt: true, proofText: true,
          },
        },
      },
    }),
    db.taskSubmission.findMany({
      orderBy: { submittedAt: "desc" },
      include: { user: { select: { name: true } } },
      take: 120,
    }),
    db.withdrawalRequest.findMany({
      orderBy: { requestedAt: "desc" },
      include: { user: { select: { name: true, onboardingCompleted: true, cpf: true, pixKey: true, bankName: true } } },
      take: 60,
    }),
  ]);

  const manyPending = users.filter((u) => u.taskSubmissions.filter((s) => s.status === "PENDING").length >= 6);
  const manyRejected = users.filter((u) => u.taskSubmissions.filter((s) => s.status === "REJECTED").length >= 4);
  const incompleteWithdrawalTry = withdrawals.filter(
    (w) => !w.user.onboardingCompleted || !w.user.cpf || !w.user.pixKey || !w.user.bankName,
  );

  const dayCounter = new Map<string, number>();
  for (const submission of submissions) {
    const day = submission.submittedAt.toISOString().slice(0, 10);
    const key = `${submission.userId}-${day}`;
    dayCounter.set(key, (dayCounter.get(key) ?? 0) + 1);
  }
  const manySameDay = Array.from(dayCounter.entries()).filter(([, count]) => count >= 4).length;

  const shortProofs = submissions.filter((s) => s.proofText.trim().length < 20);
  const referenceTime = withdrawals[0]?.requestedAt ?? submissions[0]?.submittedAt ?? new Date(0);
  const sevenDaysAgo = new Date(referenceTime.getTime() - 1000 * 60 * 60 * 24 * 7);
  const recentWithdrawals = withdrawals.filter((w) => w.requestedAt >= sevenDaysAgo);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-extrabold text-[#34134f]">Segurança e antifraude</h1>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="ok-card p-4">
          <p className="text-sm font-semibold text-[#4d2e75]">Usuários com muitas pendências</p>
          <p className="mt-1 text-2xl font-extrabold text-[#3a1658]">{manyPending.length}</p>
          <UserRiskBadge level={riskFromCounters(manyPending.length)} />
        </article>
        <article className="ok-card p-4">
          <p className="text-sm font-semibold text-[#4d2e75]">Usuários com muitas reprovações</p>
          <p className="mt-1 text-2xl font-extrabold text-[#3a1658]">{manyRejected.length}</p>
          <UserRiskBadge level={riskFromCounters(manyRejected.length)} />
        </article>
        <article className="ok-card p-4">
          <p className="text-sm font-semibold text-[#4d2e75]">Saques com cadastro incompleto</p>
          <p className="mt-1 text-2xl font-extrabold text-[#3a1658]">{incompleteWithdrawalTry.length}</p>
          <UserRiskBadge level={riskFromCounters(incompleteWithdrawalTry.length)} />
        </article>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="ok-card p-4">
          <p className="text-sm font-semibold text-[#4d2e75]">Múltiplas tarefas no mesmo dia</p>
          <p className="mt-1 text-2xl font-extrabold text-[#3a1658]">{manySameDay}</p>
          <UserRiskBadge level={riskFromCounters(manySameDay)} />
        </article>
        <article className="ok-card p-4">
          <p className="text-sm font-semibold text-[#4d2e75]">Provas curtas demais</p>
          <p className="mt-1 text-2xl font-extrabold text-[#3a1658]">{shortProofs.length}</p>
          <UserRiskBadge level={riskFromCounters(shortProofs.length)} />
        </article>
        <article className="ok-card p-4">
          <p className="text-sm font-semibold text-[#4d2e75]">Saques recentes (7 dias)</p>
          <p className="mt-1 text-2xl font-extrabold text-[#3a1658]">{recentWithdrawals.length}</p>
          <UserRiskBadge level={riskFromCounters(recentWithdrawals.length)} />
        </article>
      </section>

      <section className="ok-card p-4">
        <h2 className="text-lg font-extrabold text-[#3a1658]">Alertas detalhados</h2>
        <div className="mt-3 space-y-2 text-sm text-[#6f4f8f]">
          {manyPending.slice(0, 8).map((u) => (
            <p key={`pending-${u.id}`} className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2">
              {u.name}: alto volume de tarefas pendentes.
            </p>
          ))}
          {manyRejected.slice(0, 8).map((u) => (
            <p key={`rejected-${u.id}`} className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2">
              {u.name}: muitas tarefas reprovadas.
            </p>
          ))}
          {incompleteWithdrawalTry.slice(0, 8).map((w) => (
            <p key={`withdraw-${w.id}`} className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2">
              {w.user.name}: tentativa de saque com cadastro incompleto em {formatDate(w.requestedAt)}.
            </p>
          ))}
        </div>
      </section>
    </section>
  );
}
