import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

const statusMeta = {
  PENDING: {
    title: "Cadastro em analise",
    message: "Sua empresa esta em revisao. Nossa equipe valida dados e compliance antes da liberacao.",
    badge: "PENDING",
  },
  ACTIVE: {
    title: "Conta ativa",
    message: "Sua empresa esta aprovada e pronta para operar campanhas locais no RELA.",
    badge: "ACTIVE",
  },
  REJECTED: {
    title: "Cadastro reprovado",
    message: "Seu cadastro foi reprovado. Revise as informacoes e entre em contato para novo envio.",
    badge: "REJECTED",
  },
  BLOCKED: {
    title: "Conta bloqueada",
    message: "Conta bloqueada por politica interna. Fale com o suporte para regularizacao.",
    badge: "BLOCKED",
  },
} as const;

export default async function RelaStatusPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/rela/login");
  if (user.role === "USER") redirect("/usuario/dashboard");
  if (user.role === "ADMIN") redirect("/admin");
  if (user.role !== "COMPANY" || !user.companyId) redirect("/rela/login");

  const company = await db.company.findUnique({ where: { id: user.companyId } });
  if (!company) redirect("/rela/login");

  if (company.status === "ACTIVE") {
    redirect("/rela/dashboard");
  }

  const meta = statusMeta[company.status];

  return (
    <main className="min-h-screen bg-[#090b13] text-white">
      <section className="mx-auto flex w-full max-w-2xl flex-col justify-center px-4 py-10">
        <div className="rounded-3xl border border-[#2b3d61] bg-[#10182d]/95 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8eb4e6]">RELA Business</p>
          <h1 className="mt-3 text-3xl font-black text-[#ebf3ff]">{meta.title}</h1>
          <p className="mt-2 text-sm text-[#9fb6d8]">{meta.message}</p>

          <div className="mt-6 rounded-2xl border border-[#334b75] bg-[#0f182c] p-4">
            <p className="text-xs uppercase tracking-wide text-[#91add6]">Empresa</p>
            <p className="mt-1 text-lg font-bold text-[#e8f2ff]">{company.tradeName}</p>
            <p className="mt-2 text-xs text-[#9fb6d8]">Status: <span className="font-semibold text-[#cfe4ff]">{meta.badge}</span></p>
            {company.status === "REJECTED" ? (
              <p className="mt-2 text-xs text-[#f6b7c3]">Motivo: {company.rejectionReason || "Nao informado."}</p>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/rela/login" className="rounded-xl border border-[#37507d] bg-[#121a2f] px-4 py-3 text-sm font-semibold text-[#cde2ff]">Voltar ao login</Link>
            <Link href="/rela/suporte" className="rounded-xl bg-gradient-to-r from-[#3c76ff] to-[#21b8d9] px-4 py-3 text-sm font-bold text-white">Falar com suporte</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
