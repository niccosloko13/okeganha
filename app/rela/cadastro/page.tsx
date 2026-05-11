import Link from "next/link";

import { redirectIfAuthenticatedAwayFromRelaAuth } from "@/lib/rela-auth";

export default async function RelaCadastroPage() {
  await redirectIfAuthenticatedAwayFromRelaAuth();
  return (
    <main className="min-h-screen bg-[#090b13] text-white">
      <section className="mx-auto flex w-full max-w-md flex-col justify-center px-4 py-10">
        <div className="rounded-3xl border border-[#2b3d61] bg-[#10182d]/95 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8eb4e6]">RELA Business</p>
          <h1 className="mt-3 text-3xl font-black text-[#ebf3ff]">Criar conta empresarial</h1>
          <p className="mt-2 text-sm text-[#9fb6d8]">Cadastro empresarial em migracao para esta rota.</p>
          <Link href="/empresa/acesso" className="mt-6 inline-block w-full rounded-xl bg-gradient-to-r from-[#3c76ff] to-[#21b8d9] px-4 py-3 text-center text-sm font-bold text-white">
            Continuar no fluxo atual
          </Link>
        </div>
      </section>
    </main>
  );
}
