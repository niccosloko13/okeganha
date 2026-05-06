"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { stopCompanyImpersonationAction } from "@/app/actions/admin-actions";
import { companyLogoutAction } from "@/app/actions/company-actions";
import { BrandLogo } from "@/components/ui/BrandLogo";

type CompanyShellProps = {
  companyName: string;
  isImpersonating: boolean;
  children: React.ReactNode;
};

const items = [
  { href: "/empresa/dashboard", label: "Dashboard" },
  { href: "/empresa/campanhas", label: "Campanhas" },
  { href: "/empresa/campanhas/nova", label: "Nova campanha" },
  { href: "/empresa/plano", label: "Plano" },
  { href: "/empresa/perfil", label: "Perfil" },
];

export function CompanyShell({ companyName, isImpersonating = false, children }: CompanyShellProps) {
  const pathname = usePathname();

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-5xl px-4 pb-24 pt-24 md:px-8 md:pb-8">
      {isImpersonating ? (
        <div className="fixed inset-x-0 top-0 z-[70] bg-[#fff4d6] px-4 py-2 text-[#744e00] shadow">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2 text-sm font-semibold">
            <p>Você está visualizando como EMPRESA: {companyName}. Modo admin ativo.</p>
            <form action={stopCompanyImpersonationAction}>
              <button type="submit" className="rounded-lg border border-[#e3bf6b] bg-white px-3 py-1 text-xs">
                Sair da visualização
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <header className="fixed inset-x-0 top-0 z-50 mx-auto w-full max-w-5xl px-4 pt-3 md:px-8">
        <div className="ok-topbar rounded-3xl p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <BrandLogo height={34} textClassName="text-white" />
              <p className="text-xs text-white/85">Painel da empresa • {companyName}</p>
            </div>
            <form action={companyLogoutAction}>
              <button type="submit" className="rounded-xl border border-white/20 bg-white px-3 py-2 text-sm font-semibold text-okBlueDark">
                Sair
              </button>
            </form>
          </div>
          <nav className="mt-3 flex flex-wrap gap-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  pathname.startsWith(item.href) ? "bg-white text-[#5b2f86]" : "border border-white/25 bg-white/20 text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="space-y-4">{children}</main>
    </div>
  );
}
