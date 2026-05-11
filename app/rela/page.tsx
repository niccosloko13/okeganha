import Link from "next/link";
import { redirectIfAuthenticatedAwayFromRelaAuth } from "@/lib/rela-auth";

export default async function RelaLandingPage() {
  await redirectIfAuthenticatedAwayFromRelaAuth();
  return (
    <main className="min-h-screen bg-[#090b13] text-white">
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-12 md:px-6 md:pt-20">
        <div className="rounded-[2rem] border border-[#26344f] bg-[radial-gradient(circle_at_20%_10%,rgba(66,122,255,0.2),transparent_45%),radial-gradient(circle_at_85%_20%,rgba(80,217,255,0.18),transparent_35%),#0f1424] p-8 md:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8db2e3]">RELA Business</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-[#eaf2ff] md:text-6xl">
            Campanhas locais com engajamento verificado e metricas claras.
          </h1>
          <p className="mt-5 max-w-2xl text-sm text-[#a7bcdb] md:text-base">
            Estruture campanhas, acompanhe prova de entrega e tome decisoes com visibilidade de performance regional.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/rela/login" className="rounded-2xl bg-gradient-to-r from-[#3c76ff] to-[#21b8d9] px-6 py-3 text-center text-sm font-bold text-white">
              Entrar no RELA
            </Link>
            <Link href="/rela/cadastro" className="rounded-2xl border border-[#37507d] bg-[#121a2f] px-6 py-3 text-center text-sm font-semibold text-[#cde2ff]">
              Criar conta empresarial
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
