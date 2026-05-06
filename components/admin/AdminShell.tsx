import Link from "next/link";

import { logoutAction } from "@/app/actions/auth-actions";
import { AdminMobileNav, AdminSidebar } from "@/components/admin/AdminSidebar";
import { AnimatedBackground } from "@/components/layout/AnimatedBackground";
import { BrandLogo } from "@/components/ui/BrandLogo";

type AdminShellProps = {
  adminName: string;
  children: React.ReactNode;
};

export function AdminShell({ adminName, children }: AdminShellProps) {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-6xl px-4 pb-24 pt-24 md:px-8 md:pb-10">
      <AnimatedBackground />

      <header className="fixed inset-x-0 top-0 z-50 mx-auto w-full max-w-6xl px-4 pt-3 md:px-8">
        <div className="ok-topbar flex items-center justify-between gap-4 p-4">
          <div className="min-w-0">
            <BrandLogo height={34} textClassName="text-white" />
            <p className="text-xs text-white/85">Admin interno • {adminName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="rounded-xl border border-white/25 bg-white/20 px-3 py-2 text-sm font-semibold text-white">
              Início
            </Link>
            <form action={logoutAction}>
              <button type="submit" className="rounded-xl border border-white/20 bg-white px-3 py-2 text-sm font-semibold text-okBlueDark">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex gap-4">
        <AdminSidebar />
        <main className="min-w-0 flex-1 space-y-4">{children}</main>
      </div>

      <AdminMobileNav />
    </div>
  );
}
