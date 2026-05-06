"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/campanhas", label: "Campanhas" },
  { href: "/admin/tarefas", label: "Tarefas" },
  { href: "/admin/saques", label: "Saques" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/empresas", label: "Empresas" },
  { href: "/admin/seguranca", label: "Segurança" },
  { href: "/admin/antifraude", label: "Antifraude" },
  { href: "/admin/logs-usuarios", label: "Logs Usuários" },
  { href: "/admin/relatorios", label: "Relatórios" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 md:block">
      <nav className="ok-card sticky top-24 space-y-1 p-3">
        {adminNavItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-xl px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-gradient-to-r from-[#ffe4f3] to-[#f2e2ff] text-[#4f2379]"
                  : "text-[#785b99] hover:bg-[#f7efff] hover:text-[#4f2379]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#ecd7ff] bg-white/95 px-2 py-2 backdrop-blur md:hidden">
      <ul className="flex gap-1 overflow-x-auto text-xs">
        {adminNavItems.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <li key={item.href} className="min-w-[92px] shrink-0">
              <Link
                href={item.href}
                className={`block rounded-xl px-2 py-2 text-center font-semibold ${
                  active ? "bg-[#f4e5ff] text-[#4f2379]" : "text-[#785b99]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
