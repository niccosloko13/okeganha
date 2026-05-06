import { requireCompany } from "@/lib/company-auth";

export default async function EmpresaPerfilPage() {
  const company = await requireCompany();

  return (
    <section className="space-y-4">
      <div className="ok-card p-4">
        <h1 className="text-2xl font-extrabold text-[#34134f]">Perfil da empresa</h1>
        <p className="mt-1 text-sm text-[#7a5a99]">Dados institucionais e de contato da conta empresarial.</p>
      </div>

      <section className="ok-card grid gap-2 p-4 text-sm text-[#6f4f8f] md:grid-cols-2">
        <p><strong>Nome fantasia:</strong> {company.tradeName}</p>
        <p><strong>Razão social:</strong> {company.legalName ?? "-"}</p>
        <p><strong>CNPJ:</strong> {company.cnpj}</p>
        <p><strong>E-mail:</strong> {company.email}</p>
        <p><strong>Responsável:</strong> {company.responsibleName}</p>
        <p><strong>WhatsApp:</strong> {company.responsibleWhatsapp}</p>
        <p><strong>Cidade:</strong> {company.city}</p>
        <p><strong>Bairro/região:</strong> {company.neighborhood ?? "-"}</p>
      </section>

      <section className="ok-card grid gap-2 p-4 text-sm text-[#6f4f8f] md:grid-cols-2">
        <p><strong>Instagram:</strong> {company.instagramUrl ?? "-"}</p>
        <p><strong>TikTok:</strong> {company.tiktokUrl ?? "-"}</p>
        <p><strong>Facebook:</strong> {company.facebookUrl ?? "-"}</p>
        <p><strong>Google Meu Negócio:</strong> {company.googleBusinessUrl ?? "-"}</p>
        <p className="md:col-span-2"><strong>Site:</strong> {company.websiteUrl ?? "-"}</p>
      </section>
    </section>
  );
}
