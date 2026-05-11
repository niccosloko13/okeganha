import Link from "next/link";

import { RelaMetricCard } from "@/components/rela/RelaMetricCard";
import { RelaShell } from "@/components/rela/RelaShell";

export default function RelaDashboardPage() {
  return (
    <RelaShell title="Dashboard Executivo" subtitle="Visao consolidada de campanhas, entrega e eficiencia regional.">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <RelaMetricCard label="Campanhas ativas" value="12" helper="7 em execucao e 5 em analise" />
        <RelaMetricCard label="Orcamento usado" value="R$ 38.400" helper="62% do ciclo atual" />
        <RelaMetricCard label="Engajamentos validados" value="4.218" helper="Provas aprovadas pelo fluxo" />
        <RelaMetricCard label="Custo por acao" value="R$ 3,91" helper="Media ponderada do periodo" />
      </section>

      <section className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-[#2a3c5f] bg-[#121a2f]/85 p-5">
          <h2 className="text-lg font-extrabold text-[#e8f2ff]">Pipeline de campanhas</h2>
          <p className="mt-1 text-sm text-[#9eb5d8]">Acompanhe status de analise, execucao e performance local.</p>
          <div className="mt-4 space-y-3">
            {[
              { name: "Academia Centro - Instagram", status: "Em analise", reach: "1.240 entregas" },
              { name: "Clinica Norte - Google Review", status: "Ativa", reach: "982 entregas" },
              { name: "Restaurante Sul - TikTok", status: "Ativa", reach: "1.431 entregas" },
            ].map((item) => (
              <div key={item.name} className="rounded-2xl border border-[#304568] bg-[#141f35] p-3">
                <p className="text-sm font-bold text-[#dcedff]">{item.name}</p>
                <p className="mt-1 text-xs text-[#8fb0dc]">{item.status}</p>
                <p className="mt-1 text-xs text-[#b4c8e8]">{item.reach}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-[#2a3c5f] bg-[#121a2f]/85 p-5">
          <h2 className="text-lg font-extrabold text-[#e8f2ff]">Acoes recomendadas</h2>
          <ul className="mt-3 space-y-2 text-sm text-[#a7bfdf]">
            <li>Reforcar campanhas de maior conversao por bairro.</li>
            <li>Redistribuir orcamento para faixas com melhor custo por acao.</li>
            <li>Subir nova campanha de alcance para horario de pico regional.</li>
          </ul>
          <Link href="/rela/campanhas/nova" className="mt-5 inline-block rounded-xl bg-gradient-to-r from-[#3c76ff] to-[#21b8d9] px-4 py-3 text-sm font-bold text-white">
            Criar campanha
          </Link>
        </article>
      </section>
    </RelaShell>
  );
}
