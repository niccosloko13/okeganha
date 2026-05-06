import Link from "next/link";

import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { formatDate } from "@/lib/dates";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export default async function AdminDashboardPage() {
  const [
    campaignAgg,
    paidAgg,
    creditAgg,
    activeUsers,
    activeCampaigns,
    pendingTasks,
    pendingWithdrawals,
    recentSubmissions,
    recentWithdrawals,
    topCampaigns,
    riskyUsers,
  ] = await Promise.all([
    db.campaign.aggregate({ _sum: { totalBudget: true } }),
    db.walletTransaction.aggregate({ where: { type: "WITHDRAWAL_PAID" }, _sum: { amount: true } }),
    db.walletTransaction.aggregate({ where: { type: "CREDIT" }, _sum: { amount: true } }),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.campaign.count({ where: { status: "ACTIVE" } }),
    db.taskSubmission.count({ where: { status: "PENDING" } }),
    db.withdrawalRequest.count({ where: { status: "PENDING" } }),
    db.taskSubmission.findMany({
      orderBy: { submittedAt: "desc" },
      take: 8, include: {
        user: { select: { name: true } },
        campaign: { select: { title: true } },
      },
    }),
    db.withdrawalRequest.findMany({
      orderBy: { requestedAt: "desc" },
      take: 8, include: {
        user: { select: { name: true } },
      },
    }),
    db.campaign.findMany({
      take: 6, orderBy: { taskSubmissions: { _count: "desc" } },
      include: {
        _count: { select: { taskSubmissions: true } },
      },
    }),
    db.user.findMany({
      where: { role: "USER" },
      include: {
        _count: {
          select: {
            taskSubmissions: true, withdrawals: true,
          },
        },
        taskSubmissions: {
          where: { status: "REJECTED" },
          select: { id: true },
        },
      },
      take: 50,
    }),
  ]);

  const revenueForecast = campaignAgg._sum.totalBudget ?? 0;
  const totalPaid = paidAgg._sum.amount ?? 0;
  const approvedCost = creditAgg._sum.amount ?? 0;
  const estimatedProfit = revenueForecast - approvedCost;

  const riskAlerts = riskyUsers.filter((user) => {
    const rejected = user.taskSubmissions.length;
    return rejected >= 3 || user._count.taskSubmissions >= 12;
  }).length;

  return (
    <section className="space-y-4">
      <section className="grid gap-3 md:grid-cols-4">
        <AdminMetricCard label="Receita total prevista" value={formatMoney(revenueForecast)} />
        <AdminMetricCard label="Total pago aos usuários" value={formatMoney(totalPaid)} />
        <AdminMetricCard label="Lucro estimado" value={formatMoney(estimatedProfit)} />
        <AdminMetricCard label="Custo aprovado" value={formatMoney(approvedCost)} />
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <AdminMetricCard label="Usuários ativos" value={String(activeUsers)} />
        <AdminMetricCard label="Campanhas ativas" value={String(activeCampaigns)} />
        <AdminMetricCard label="Tarefas pendentes" value={String(pendingTasks)} />
        <AdminMetricCard label="Saques pendentes" value={String(pendingWithdrawals)} hint={`${riskAlerts} alertas de risco`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <AdminTable>
          <div className="p-4">
            <h2 className="text-lg font-extrabold text-[#3a1658]">Últimas tarefas enviadas</h2>
          </div>
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-[#faf4ff] text-left text-xs uppercase tracking-wide text-[#7e62a0]">
              <tr>
                <th className="px-4 py-2">Usuário</th>
                <th className="px-4 py-2">Campanha</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentSubmissions.map((item) => (
                <tr key={item.id} className="border-t border-[#f0e3ff]">
                  <td className="px-4 py-2">{item.user.name}</td>
                  <td className="px-4 py-2">{item.campaign.title}</td>
                  <td className="px-4 py-2"><AdminStatusBadge status={item.status} /></td>
                  <td className="px-4 py-2">{formatDate(item.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTable>

        <AdminTable>
          <div className="p-4">
            <h2 className="text-lg font-extrabold text-[#3a1658]">Últimos saques solicitados</h2>
          </div>
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-[#faf4ff] text-left text-xs uppercase tracking-wide text-[#7e62a0]">
              <tr>
                <th className="px-4 py-2">Usuário</th>
                <th className="px-4 py-2">Valor</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentWithdrawals.map((item) => (
                <tr key={item.id} className="border-t border-[#f0e3ff]">
                  <td className="px-4 py-2">{item.user.name}</td>
                  <td className="px-4 py-2">{formatMoney(item.amount)}</td>
                  <td className="px-4 py-2"><AdminStatusBadge status={item.status} /></td>
                  <td className="px-4 py-2">{formatDate(item.requestedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTable>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="ok-card p-4">
          <h2 className="text-lg font-extrabold text-[#3a1658]">Campanhas com maior volume</h2>
          <div className="mt-3 space-y-2">
            {topCampaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2">
                <p className="text-sm font-semibold text-[#4d2e75]">{campaign.title}</p>
                <span className="text-xs text-[#7a5a99]">{campaign._count.taskSubmissions} envios</span>
              </div>
            ))}
          </div>
        </article>

        <article className="ok-card p-4">
          <h2 className="text-lg font-extrabold text-[#3a1658]">Alertas rápidos</h2>
          <div className="mt-3 space-y-2 text-sm text-[#6f4f8f]">
            <p className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2">
              {pendingTasks} tarefas pendentes aguardando revisão.
            </p>
            <p className="rounded-xl border border-[#f0e3ff] bg-[#fcf9ff] px-3 py-2">
              {pendingWithdrawals} saques em status pendente.
            </p>
            <p className="rounded-xl border border-[#ffe0f0] bg-[#fff5fb] px-3 py-2">
              {riskAlerts} usuários com possível risco antifraude.
            </p>
            <Link href="/admin/seguranca" className="ok-btn-secondary inline-flex">Ver segurança</Link>
          </div>
        </article>
      </section>
    </section>
  );
}
