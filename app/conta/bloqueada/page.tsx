import Link from "next/link";

import { BrandLogo } from "@/components/ui/BrandLogo";

export default function ContaBloqueadaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff7ff] to-[#f2ebff] px-4 py-10">
      <section className="mx-auto w-full max-w-md rounded-3xl border border-[#edd9ff] bg-white/90 p-6 shadow-xl">
        <div className="mb-5">
          <BrandLogo className="h-12" />
        </div>
        <h1 className="text-2xl font-black text-[#3d165b]">Conta bloqueada</h1>
        <p className="mt-3 text-sm text-[#6f4f8f]">
          Sua conta foi bloqueada por atividade suspeita. Entre em contato com o suporte para revisão.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link href="mailto:suporte@okeganha.com" className="ok-btn-primary inline-flex justify-center">
            Falar com suporte
          </Link>
          <Link href="/login" className="ok-btn-secondary inline-flex justify-center">
            Voltar para login
          </Link>
        </div>
      </section>
    </main>
  );
}
