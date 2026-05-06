import Link from "next/link";

import { logoutAction } from "@/app/actions/auth-actions";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { requireUser } from "@/lib/auth";

type AppShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const headerLinks = [
  { href: "/usuario/dashboard", label: "Início" },
  { href: "/usuario/campanhas", label: "Campanhas" },
  { href: "/usuario/tarefas", label: "Tarefas" },
  { href: "/usuario/carteira", label: "Carteira" },
  { href: "/usuario/perfil", label: "Perfil" },
];

export async function AppShell({ title, subtitle, children }: AppShellProps) {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0] || "Usuário";

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-24 pt-44 md:px-8 md:pb-10 md:pt-48">
      <AnimatedBackground />

      <header className="fixed inset-x-0 top-0 z-50 mx-auto w-full max-w-5xl px-4 pt-3 md:px-8">
        <div className="ok-topbar ok-fade-in rounded-3xl p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <BrandLogo height={40} textClassName="text-white" />
              <p className="mt-1 truncate text-xs font-medium text-white/85">Olá, {firstName}</p>
            </div>
            <form action={logoutAction}>
              <button
                className="rounded-xl border border-white/25 bg-white px-3 py-2 text-sm font-semibold text-okBlueDark transition hover:scale-[1.02]"
                type="submit"
              >
                Sair
              </button>
            </form>
          </div>

          <nav className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-5">
            {headerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl border border-white/25 bg-white/16 px-3 py-2 text-center text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/25"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 space-y-4">
        <section className="ok-fade-up rounded-3xl border border-[#ebdbff] bg-white/76 p-5 shadow-[0_16px_35px_-24px_rgba(95,42,143,0.75)] backdrop-blur">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#34134f] md:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm font-medium text-[#715391]">{subtitle}</p> : null}
        </section>
        {children}
      </main>

      <BottomNavigation />
    </div>
  );
}
