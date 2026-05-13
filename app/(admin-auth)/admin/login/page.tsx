import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user?.role === "ADMIN") redirect("/admin");
  if (user?.role === "USER") redirect("/usuario/dashboard");
  if (user?.role === "COMPANY") redirect("/rela/login");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-6">
      <section className="rounded-3xl border border-[#31415f] bg-[#10182a]/95 p-6 text-white">
        <div className="flex justify-center">
          <BrandLogo height={40} textClassName="text-white" />
        </div>
        <p className="mt-4 text-center text-xs uppercase tracking-[0.2em] text-[#8fb1df]">Admin interno</p>
        <h1 className="mt-2 text-center text-3xl font-black">Entrar no Admin</h1>
        <p className="mt-2 text-center text-sm text-[#a8bddf]">Acesso restrito para operacao, moderacao e antifraude.</p>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-xs text-[#9ab1d7]">
          Conta de usuario comum? <Link href="/login" className="font-semibold text-[#d5e4ff]">Ir para OKEGANHA</Link>
        </p>
      </section>
    </main>
  );
}
