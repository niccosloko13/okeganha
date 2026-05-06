import Link from "next/link";
import { redirect } from "next/navigation";

import { CompanyAccessTabs } from "@/components/empresa/CompanyAccessTabs";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { getCurrentCompany } from "@/lib/company-auth";

export default async function EmpresaAcessoPage() {
  const company = await getCurrentCompany();
  if (company) {
    if (company.status === "ACTIVE") redirect("/empresa/dashboard");
    redirect("/empresa/status");
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
      <div className="ok-blob left-[-70px] top-[20px] h-40 w-40 bg-[#ff7bc6]" />
      <div className="ok-blob right-[-80px] bottom-[10px] h-44 w-44 bg-[#af64ff]" />

      <div className="space-y-5">
        <div className="text-center">
          <div className="flex justify-center">
            <BrandLogo height={48} />
          </div>
          <h1 className="mt-3 text-3xl font-extrabold text-[#351456]">Conta Empresa</h1>
          <p className="mt-1 text-sm text-[#765694]">Acesse ou crie sua conta para anunciar campanhas no OKEGANHA.</p>
        </div>

        <CompanyAccessTabs />

        <p className="text-center text-xs text-[#8c71aa]">
          Precisa entrar como usuário{" "}
          <Link href="/login" className="font-semibold text-[#7a2fbc] underline">
            Fazer login no app
          </Link>
        </p>
      </div>
    </main>
  );
}
