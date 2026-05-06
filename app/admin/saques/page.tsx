import { WithdrawalStatus } from "@prisma/client";

import { WithdrawalReviewCard } from "@/components/admin/WithdrawalReviewCard";
import { db } from "@/lib/db";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminSaquesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status  : "";

  const withdrawals = await db.withdrawalRequest.findMany({
    where: {
      status: status ? (status as WithdrawalStatus) : undefined,
    },
    include: {
      user: {
        select: {
          name: true, cpf: true,
          bankName: true, onboardingCompleted: true, identityVerificationStatus: true,
        },
      },
    },
    orderBy: { requestedAt: "desc" },
    take: 50,
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-extrabold text-[#34134f]">Saques</h1>

      <form className="ok-card flex flex-wrap items-center gap-2 p-4">
        <select name="status" defaultValue={status} className="ok-input max-w-xs">
          <option value="">Todos os status</option>
          <option value="PENDING">PENDING</option>
          <option value="APPROVED">APPROVED</option>
          <option value="PAID">PAID</option>
          <option value="REJECTED">REJECTED</option>
        </select>
        <button type="submit" className="ok-btn-primary">Filtrar</button>
      </form>

      <div className="space-y-3">
        {withdrawals.map((item) => (
          <WithdrawalReviewCard
            key={item.id}
            id={item.id}
            userName={item.user.name}
            amount={item.amount}
            pixKey={item.pixKey}
            bankName={item.user.bankName}
            cpf={item.user.cpf}
            status={item.status}
            identityVerificationStatus={item.user.identityVerificationStatus}
          />
        ))}
      </div>
    </section>
  );
}
