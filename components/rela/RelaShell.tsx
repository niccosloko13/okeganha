import Link from "next/link";

type RelaShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const navItems = [
  { href: "/rela/dashboard", label: "Dashboard" },
  { href: "/rela/campanhas", label: "Campanhas" },
  { href: "/rela/relatorios", label: "Relatorios" },
  { href: "/rela/financeiro", label: "Financeiro" },
  { href: "/rela/configuracoes", label: "Configuracoes" },
];

export function RelaShell({ title, subtitle, children }: RelaShellProps) {
  return (
    <div className="min-h-screen bg-[#090b13] text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-4 md:grid-cols-[240px_1fr] md:px-6">
        <aside className="rounded-3xl border border-[#253045] bg-[#0f1424]/90 p-4 backdrop-blur-xl md:sticky md:top-4 md:h-fit">
          <Link href="/rela" className="text-lg font-black tracking-tight text-[#cce4ff]">
            RELA Business
          </Link>
          <p className="mt-1 text-xs text-[#7f9bc1]">Campanhas locais e performance regional</p>
          <nav className="mt-5 space-y-2 text-sm">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-xl border border-transparent px-3 py-2 text-[#d3def4] hover:border-[#2c3f66] hover:bg-[#151f36]">
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="space-y-4">
          <header className="rounded-3xl border border-[#22314f] bg-[linear-gradient(140deg,#101a30_0%,#17223c_60%,#0f1424_100%)] p-5">
            <h1 className="text-2xl font-black tracking-tight text-[#e7f0ff] md:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-[#99b2d8]">{subtitle}</p>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
