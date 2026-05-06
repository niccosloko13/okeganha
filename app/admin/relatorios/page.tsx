import { AdminMetricCard } from "@/components/admin/AdminMetricCard";
import { AdminTable } from "@/components/admin/AdminTable";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/money";

export default async function AdminRelatoriosPage() {
  const [
    campaignsCount,
    usersCount,
    submissionsCount,
    approvedCount,
    totalApproved,
    totalPaid,
    pendingWithdrawals,
    campaignPerformance,
    activeUsers,
  ] = await Promise.all([
    db.campaign.count(),
    db.user.count(),
    db.taskSubmission.count(),
    db.taskSubmission.count({ where: { status: "APPROVED" } }),
    db.walletTransaction.aggregate({ where: { type: "CREDIT" }, _sum: { amount: true } }),
    db.walletTransaction.aggregate({ where: { type: "WITHDRAWAL_PAID" }, _sum: { amount: true } }),
    db.withdrawalRequest.count({ where: { status: "PENDING" } }),
    db.campaign.findMany({
      include: {
        _count: {
          select: { taskSubmissions: true },
        },
      },
      orderBy: { taskSubmissions: { _count: "desc" } },
      take: 8,
    }),
    db.user.findMany({
      where: { role: "USER" },
      include: {
        _count: {
          select: { taskSubmissions: true },
        },
      },
      orderBy: { taskSubmissions: { _count: "desc" } },
      take: 8,
    }),
  ]);

  const approvalRate = submissionsCount > 0 ? (approvedCount / submissionsCount) * 100 : 0;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-extrabold text-[#34134f]">Relatórios</h1>

      <section className="grid gap-3 md:grid-cols-4">
        <AdminMetricCard label="Total de campanhas" value={String(campaignsCount)} />
        <AdminMetricCard label="Total de usuários" value={String(usersCount)} />
        <AdminMetricCard label="Total de submissões" value={String(submissionsCount)} />
        <AdminMetricCard label="Taxa de aprovação" value={`${approvalRate.toFixed(1)}%`} />
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <AdminMetricCard label="Total aprovado" value={formatMoney(totalApproved._sum.amount ?? 0)} />
        <AdminMetricCard label="Total pago" value={formatMoney(totalPaid._sum.amount ?? 0)} />
        <AdminMetricCard label="Saques pendentes" value={String(pendingWithdrawals)} />
        <AdminMetricCard label="Submissões aprovadas" value={String(approvedCount)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <AdminTable>
          <div className="p-4">
            <h2 className="text-lg font-extrabold text-[#3a1658]">Campanhas com melhor performance</h2>
          </div>
          <table className="w-full min-w-[540px] text-sm">
            <thead className="bg-[#faf4ff] text-left text-xs uppercase tracking-wide text-[#7e62a0]">
              <tr>
                <th className="px-4 py-2">Campanha</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Envios</th>
              </tr>
            </thead>
            <tbody>
              {campaignPerformance.map((campaign) => (
                <tr key={campaign.id} className="border-t border-[#f0e3ff]">
                  <td className="px-4 py-2 font-semibold text-[#4d2e75]">{campaign.title}</td>
                  <td className="px-4 py-2">{campaign.status}</td>
                  <td className="px-4 py-2">{campaign._count.taskSubmissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTable>

        <AdminTable>
          <div className="p-4">
            <h2 className="text-lg font-extrabold text-[#3a1658]">Usuários mais ativos</h2>
          </div>
          <table className="w-full min-w-[540px] text-sm">
            <thead className="bg-[#faf4ff] text-left text-xs uppercase tracking-wide text-[#7e62a0]">
              <tr>
                <th className="px-4 py-2">Usuário</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Envios</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map((user) => (
                <tr key={user.id} className="border-t border-[#f0e3ff]">
                  <td className="px-4 py-2 font-semibold text-[#4d2e75]">{user.name}</td>
                  <td className="px-4 py-2">{user.status}</td>
                  <td className="px-4 py-2">{user._count.taskSubmissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTable>
      </section>
    </section>
  );
}
