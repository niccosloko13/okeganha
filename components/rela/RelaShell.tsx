import Link from "next/link";

type RelaShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  companyName?: string;
  companyStatus?: string;
  tokenBalance?: number;
};

const navItems = [
  { href: "/rela/dashboard", label: "Dashboard" },
  { href: "/rela/campanhas", label: "Campanhas" },
  { href: "/rela/campanhas/nova", label: "Nova campanha" },
  { href: "/rela/relatorios", label: "Relatorios" },
  { href: "/rela/financeiro", label: "Financeiro" },
  { href: "/rela/configuracoes", label: "Configuracoes" },
  { href: "/rela/suporte", label: "Suporte" },
];

export function RelaShell({ title, subtitle, children, companyName, companyStatus, tokenBalance }: RelaShellProps) {
  return (
    <div className="min-h-screen bg-[#090b13] text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-4 md:grid-cols-[240px_1fr] md:px-6">
        <aside className="rounded-3xl border border-[#253045] bg-[#0f1424]/90 p-4 backdrop-blur-xl md:sticky md:top-4 md:h-fit">
          <Link href="/rela" className="text-lg font-black tracking-tight text-[#cce4ff]">
            RELA Business
          </Link>
          <p className="mt-1 text-xs text-[#7f9bc1]">Campanhas locais e performance regional</p>
          <div className="mt-4 rounded-2xl border border-[#2a3c5f] bg-[#121a2f] p-3">
            <p className="text-xs text-[#8faad1]">Conta empresarial</p>
            <p className="truncate text-sm font-bold text-[#e8f2ff]">{companyName ?? "Empresa"}</p>
            <p className="mt-1 text-[11px] text-[#9db6da]">Status: {companyStatus ?? "ACTIVE"}</p>
            <p className="text-[11px] text-[#9db6da]">Tokens: {tokenBalance ?? 0}</p>
          </div>
          <nav className="mt-5 space-y-2 text-sm">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-xl border border-transparent px-3 py-2 text-[#d3def4] hover:border-[#2c3f66] hover:bg-[#151f36]">
                {item.label}
              </Link>
            ))}
            <Link href="/empresa/acesso" className="mt-2 block rounded-xl border border-[#385380] px-3 py-2 text-[#c4d8f7] hover:bg-[#16213a]">
              Sair
            </Link>
          </nav>
        </aside>
        <main className="space-y-4">
          <header className="rounded-3xl border border-[#22314f] bg-[linear-gradient(140deg,#101a30_0%,#17223c_60%,#0f1424_100%)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-[#e7f0ff] md:text-3xl">{title}</h1>
                <p className="mt-1 text-sm text-[#99b2d8]">{subtitle}</p>
              </div>
              <div className="rounded-2xl border border-[#31507f] bg-[#13203a] px-3 py-2 text-right">
                <p className="text-[11px] uppercase tracking-wide text-[#8eb2e3]">Crescimento regional</p>
                <p className="text-sm font-bold text-[#e6f1ff]">Performance em monitoramento</p>
              </div>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
