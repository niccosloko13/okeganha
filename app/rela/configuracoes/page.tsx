import { RelaShell } from "@/components/rela/RelaShell";
import { RelaChannelsForm } from "@/components/rela/RelaChannelsForm";
import { requireRelaCompany } from "@/lib/rela-auth";

export default async function RelaConfiguracoesPage() {
  const company = await requireRelaCompany();
  return (
    <RelaShell title="Configuracoes" subtitle="Preferencias de conta, notificacoes e governanca da operacao." companyName={company.tradeName} companyStatus={company.status} tokenBalance={company.tokensBalance}>
      <section className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-[#2a3c5f] bg-[#121a2f]/85 p-4">
          <h2 className="text-sm font-bold text-[#e8f2ff]">Canais de divulgacao</h2>
          <p className="mt-2 text-xs text-[#9bb4d9]">Preencha os canais oficiais da sua empresa para melhorar entrega e credibilidade das campanhas.</p>
          <div className="mt-4">
            <RelaChannelsForm
              instagramUrl={company.instagramUrl ?? ""}
              tiktokUrl={company.tiktokUrl ?? ""}
              facebookUrl={company.facebookUrl ?? ""}
              googleBusinessUrl={company.googleBusinessUrl ?? ""}
              websiteUrl={company.websiteUrl ?? ""}
            />
          </div>
        </article>
        <article className="rounded-2xl border border-[#2a3c5f] bg-[#121a2f]/85 p-4">
          <h2 className="text-sm font-bold text-[#e8f2ff]">Notificacoes</h2>
          <p className="mt-2 text-xs text-[#9bb4d9]">Resumo semanal, alertas de analise e desempenho (em breve).</p>
        </article>
      </section>
    </RelaShell>
  );
}
