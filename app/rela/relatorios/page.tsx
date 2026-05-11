import { RelaShell } from "@/components/rela/RelaShell";
import { requireRelaCompany } from "@/lib/rela-auth";

export default async function RelaRelatoriosPage() {
  const company = await requireRelaCompany();

  return (
    <RelaShell title="Relatorios" subtitle="Leitura executiva de crescimento, entregas e desempenho regional." companyName={company.tradeName} companyStatus={company.status} tokenBalance={company.tokensBalance}>
      <section className="grid gap-3 lg:grid-cols-2">
        <article className="rounded-3xl border border-[#2a3c5f] bg-[#121a2f]/85 p-5">
          <h2 className="text-lg font-extrabold text-[#e8f2ff]">Crescimento semanal</h2>
          <div className="mt-4 h-44 rounded-2xl border border-[#304568] bg-[linear-gradient(180deg,#14213a_0%,#101a2e_100%)] p-3">
            <div className="mt-6 grid h-24 grid-cols-7 items-end gap-2">
              {[30, 52, 41, 66, 74, 58, 81].map((h, idx) => (
                <div key={idx} className="rounded-sm bg-gradient-to-t from-[#3c76ff] to-[#21b8d9]" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </article>
        <article className="rounded-3xl border border-[#2a3c5f] bg-[#121a2f]/85 p-5">
          <h2 className="text-lg font-extrabold text-[#e8f2ff]">Distribuicao por canal</h2>
          <div className="mt-4 space-y-2">
            {[
              ["Instagram", "42%"],
              ["TikTok", "31%"],
              ["Google", "19%"],
              ["Outros", "8%"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-[#304568] bg-[#141f35] p-3">
                <p className="text-sm font-semibold text-[#dcedff]">{label}</p>
                <p className="text-xs text-[#9bb4d9]">{value} das entregas validadas</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </RelaShell>
  );
}
