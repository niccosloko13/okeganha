import { RelaShell } from "@/components/rela/RelaShell";
import { requireRelaCompany } from "@/lib/rela-auth";

export default async function RelaConfiguracoesPage() {
  const company = await requireRelaCompany();
  return (
    <RelaShell title="Configuracoes" subtitle="Preferencias de conta, notificacoes e governanca da operacao." companyName={company.tradeName} companyStatus={company.status} tokenBalance={company.tokensBalance}>
      <section className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-[#2a3c5f] bg-[#121a2f]/85 p-4">
          <h2 className="text-sm font-bold text-[#e8f2ff]">Dados institucionais</h2>
          <p className="mt-2 text-xs text-[#9bb4d9]">Atualizacao de contato, responsavel e canais oficiais (em breve).</p>
        </article>
        <article className="rounded-2xl border border-[#2a3c5f] bg-[#121a2f]/85 p-4">
          <h2 className="text-sm font-bold text-[#e8f2ff]">Notificacoes</h2>
          <p className="mt-2 text-xs text-[#9bb4d9]">Resumo semanal, alertas de analise e desempenho (em breve).</p>
        </article>
      </section>
    </RelaShell>
  );
}
