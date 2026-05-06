"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/usuario/dashboard", label: "Início", icon: "home" as const },
  { href: "/usuario/campanhas", label: "Campanhas", icon: "campanhas" as const },
  { href: "/usuario/tarefas", label: "Tarefas", icon: "tarefas" as const },
  { href: "/usuario/carteira", label: "Carteira", icon: "carteira" as const },
  { href: "/usuario/perfil", label: "Perfil", icon: "perfil" as const },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md border-t border-[#f0d9ff] bg-white/92 px-2 py-2 backdrop-blur-xl md:hidden">
      <ul className="grid grid-cols-5 gap-1">
        {items.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-2xl px-2 py-2 text-center text-[11px] font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-b from-[#ffe9f6] to-[#f4e6ff] text-[#572382] shadow-[0_8px_18px_-15px_rgba(122,47,188,0.9)]"
                    : "text-[#8c68ae] hover:bg-okBlueLight/50 hover:text-[#572382]"
                }`}
              >
                <BottomIcon icon={item.icon} active={isActive} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

type BottomIconProps = {
  icon: (typeof items)[number]["icon"];
  active: boolean;
};

function BottomIcon({ icon, active }: BottomIconProps) {
  const cls = active ? "stroke-[#572382]" : "stroke-[#8c68ae]";

  return (
    <span className="mb-1 inline-flex h-4 w-4 items-center justify-center">
      <svg viewBox="0 0 24 24" fill="none" className={`h-4 w-4 ${cls}`} strokeWidth="1.8">
        {icon === "home" ? <path d="M3 11.5 12 4l9 7.5M6.5 10.5V20h11V10.5" /> : null}
        {icon === "campanhas" ? <path d="M5 7h14v10H5zM8 7v10M16 7v10M5 12h14" /> : null}
        {icon === "tarefas" ? <path d="M6 4h12v16H6zM9 9h6M9 13h6M9 17h4M8 9l.6.6L10 8.2" /> : null}
        {icon === "carteira" ? <path d="M4 8h16v10H4zM4 8V6h12v2M20 13h-4" /> : null}
        {icon === "perfil" ? <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" /> : null}
      </svg>
    </span>
  );
}
