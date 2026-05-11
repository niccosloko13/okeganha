import Link from "next/link";
import { CompanyPlan, CompanyStatus, Prisma } from "@prisma/client";

import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTable } from "@/components/admin/AdminTable";
import { CompanyModerationActions } from "@/components/admin/CompanyModerationActions";
import { db } from "@/lib/db";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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

export default async function AdminEmpresasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.trim()  : "";
  const status = typeof params.status === "string" ? params.status  : "ALL";
  const plan = typeof params.plan === "string" ? params.plan  : "ALL";
  const companyStatus = status !== "ALL" ? (status as CompanyStatus) : undefined;
  const companyPlan = plan !== "ALL" ? (plan as CompanyPlan) : undefined;

  const where: Prisma.CompanyWhereInput = {
    ...(query
      ? {
          OR: [
            { publicId: { contains: query, mode: "insensitive" } },
            { tradeName: { contains: query, mode: "insensitive" } },
            { cnpj: { contains: query, mode: "insensitive" } },
            { responsibleName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(companyStatus ? { status: companyStatus } : {}),
    ...(companyPlan ? { plan: companyPlan } : {}),
  };

  const [companies, totalCount, pendingCount, activeCount, blockedCount, tokensAgg] = await Promise.all([
    db.company.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { campaigns: true },
        },
      },
      take: 200,
    }),
    db.company.count(),
    db.company.count({ where: { status: "PENDING" } }),
    db.company.count({ where: { status: "ACTIVE" } }),
    db.company.count({ where: { status: "BLOCKED" } }),
    db.company.aggregate({ _sum: { tokensBalance: true } }),
  ]);

  const topCards = [
    { label: "Empresas totais", value: String(totalCount) },
    { label: "Pendentes", value: String(pendingCount) },
    { label: "Ativas", value: String(activeCount) },
    { label: "Bloqueadas", value: String(blockedCount) },
    { label: "Tokens totais", value: String(tokensAgg._sum.tokensBalance ?? 0) },
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold text-[#34134f]">Empresas</h1>
        <Link href="/admin/empresas/nova" className="ok-btn-primary">
          Cadastrar empresa
        </Link>
      </div>

      <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {topCards.map((card) => (
          <article key={card.label} className="ok-card rounded-2xl p-3">
            <p className="text-[11px] uppercase tracking-wide text-[#7f60a1]">{card.label}</p>
            <p className="mt-1 text-xl font-black text-[#3a1658]">{card.value}</p>
          </article>
        ))}
      </section>

      <form className="ok-card grid gap-2 p-3 lg:grid-cols-[1fr_170px_170px_auto]">
        <input
          name="q"
          defaultValue={query}
          className="ok-input"
          placeholder="Buscar por nome, ID, CNPJ, responsável ou e-mail"
        />
        <select name="status" defaultValue={status} className="ok-input">
          <option value="ALL">Todos os status</option>
          <option value="PENDING">Pendente</option>
          <option value="ACTIVE">Ativa</option>
          <option value="REJECTED">Reprovada</option>
          <option value="BLOCKED">Bloqueada</option>
        </select>
        <select name="plan" defaultValue={plan} className="ok-input">
          <option value="ALL">Todos os planos</option>
          <option value="FREE">FREE</option>
          <option value="BASIC">BASIC</option>
          <option value="PREMIUM">PREMIUM</option>
          <option value="ENTERPRISE">ENTERPRISE</option>
        </select>
        <button type="submit" className="ok-btn-secondary h-11 px-4">Filtrar</button>
      </form>

      <div className="hidden lg:block">
        <AdminTable>
          <table className="w-full min-w-[1180px] text-sm">
            <thead className="bg-[#faf4ff] text-left text-[11px] uppercase tracking-wide text-[#7e62a0]">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Empresa</th>
                <th className="px-3 py-2">Responsável</th>
                <th className="px-3 py-2">CNPJ</th>
                <th className="px-3 py-2">Plano</th>
                <th className="px-3 py-2">Tokens</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Campanhas</th>
                <th className="px-3 py-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-t border-[#f0e3ff] align-top">
                  <td className="px-3 py-2 font-semibold text-[#4d2e75]">{company.publicId}</td>
                  <td className="px-3 py-2">
                    <p className="font-semibold text-[#3f1d5f]">{company.tradeName}</p>
                    <p className="text-xs text-[#7a5a99]">{company.email}</p>
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-medium text-[#4a2c6e]">{company.responsibleName}</p>
                    <p className="text-xs text-[#7a5a99]">{formatWhatsapp(company.responsibleWhatsapp)}</p>
                  </td>
                  <td className="px-3 py-2 text-[#4a2c6e]">{formatCnpj(company.cnpj)}</td>
                  <td className="px-3 py-2"><AdminStatusBadge status={company.plan} /></td>
                  <td className="px-3 py-2 font-semibold text-[#3f1d5f]">{company.tokensBalance}</td>
                  <td className="px-3 py-2"><AdminStatusBadge status={company.status} /></td>
                  <td className="px-3 py-2 text-[#4a2c6e]">{company._count.campaigns}</td>
                  <td className="px-3 py-2">
                    <CompanyModerationActions companyId={company.id} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTable>
      </div>

      <div className="grid gap-3 lg:hidden">
        {companies.map((company) => (
          <article key={company.id} className="ok-card space-y-3 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-[#7a5a99]">{company.publicId}</p>
                <p className="text-base font-bold text-[#3f1d5f]">{company.tradeName}</p>
                <p className="text-xs text-[#7a5a99]">{company.email}</p>
              </div>
              <AdminStatusBadge status={company.status} />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-[#5a397d]">
              <p><span className="font-semibold">Responsável:</span> {company.responsibleName}</p>
              <p><span className="font-semibold">WhatsApp:</span> {formatWhatsapp(company.responsibleWhatsapp)}</p>
              <p><span className="font-semibold">CNPJ:</span> {formatCnpj(company.cnpj)}</p>
              <p><span className="font-semibold">Plano:</span> {company.plan}</p>
              <p><span className="font-semibold">Tokens:</span> {company.tokensBalance}</p>
              <p><span className="font-semibold">Campanhas:</span> {company._count.campaigns}</p>
            </div>

            <CompanyModerationActions companyId={company.id} />
          </article>
        ))}
      </div>

      {companies.length === 0 ? (
        <article className="ok-card p-6 text-center text-sm text-[#6f4f8f]">
          Nenhuma empresa encontrada com os filtros aplicados.
        </article>
      ) : null}
    </section>
  );
}

