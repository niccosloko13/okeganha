import Image from "next/image";
import Link from "next/link";

import { GamificationShell } from "@/components/gamification";
import { GAMIFICATION_ASSETS } from "@/lib/gamification-assets";

export default function CaixaPage() {
  return (
    <GamificationShell title="Caixa" subtitle="Complete missoes para desbloquear recompensas raras.">
      <section className="rounded-3xl border border-[#6f45a3] bg-[#1a1030]/90 p-5 shadow-[0_24px_50px_-32px_rgba(181,89,255,0.8)]">
        <div className="relative mx-auto max-w-md">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,79,176,0.25),transparent_50%)]" />
          <Image src={GAMIFICATION_ASSETS.rewards.chestOpen} alt="Caixa misteriosa" width={220} height={220} className="mx-auto h-[170px] w-[170px] object-contain md:h-[220px] md:w-[220px]" />
        </div>

        <div className="mx-auto mt-3 max-w-md space-y-2 text-center">
          <p className="text-lg font-black text-white">Caixa misteriosa</p>
          <p className="text-sm text-[#d3bdea]">Faltam 3 missoes para desbloquear sua proxima caixa.</p>
          <div className="h-3 overflow-hidden rounded-full bg-[#2a1740]"><div className="h-full w-1/3 bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc]" /></div>
          <p className="text-xs text-[#c9b0e8]">Estado atual: Em breve</p>
        </div>

        <div className="mt-4 flex justify-center">
          <Link href="/usuario/missoes" className="min-h-[46px] rounded-xl bg-gradient-to-r from-[#ff4fb0] to-[#7a2fbc] px-5 py-3 text-sm font-semibold text-white active:scale-95">Complete missoes</Link>
        </div>
      </section>
    </GamificationShell>
  );
}
