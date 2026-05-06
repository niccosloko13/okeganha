import Link from "next/link";
import { redirect } from "next/navigation";

import { BrandLogo } from "@/components/ui/BrandLogo";
import { getCurrentCompany } from "@/lib/company-auth";

export default async function EmpresaStatusPage() {
  const company = await getCurrentCompany();
  if (!company) {
    redirect("/empresa/acesso");
  }

  const message =
    company.status === "PENDING" ? "Cadastro enviado para análise." : company.status === "REJECTED" ? "Cadastro reprovado." : company.status === "BLOCKED" ? "Conta bloqueada." : "Conta ativa.";

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-10">
      <section className="ok-card w-full space-y-4 p-6 text-center">
        <div className="flex justify-center">
          <BrandLogo height={44} />
        </div>
        <h1 className="text-2xl font-extrabold text-[#351456]">Status da empresa</h1>
        <p className="text-sm text-[#6f4f8f]">{company.tradeName}</p>
        <p className="text-base font-semibold text-[#4f2379]">{message}</p>

        {company.status === "PENDING" ? <p className="text-sm text-[#7a5a99]">Seu cadastro está em análise pelo time OKEGANHA.</p>  : null}
        {company.status === "REJECTED" ? (
          <div className="space-y-2">
            <p className="text-sm text-[#7a5a99]">Motivo: {company.rejectionReason ?? "Não informado."}</p>
            <Link href="/empresa/acesso" className="ok-btn-secondary inline-flex">Atualizar cadastro</Link>
          </div>
        ) : null}
        {company.status === "BLOCKED" ? <p className="text-sm text-[#7a5a99]">Entre em contato com suporte para regularização.</p>  : null}
        {company.status === "ACTIVE" ? <Link href="/empresa/dashboard" className="ok-btn-primary inline-flex">Ir para o painel</Link>  : null}
      </section>
    </main>
  );
}
