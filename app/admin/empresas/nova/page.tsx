import { createCompanyAction } from "@/app/actions/admin-actions";

export default function AdminNovaEmpresaPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-extrabold text-[#34134f]">Cadastrar empresa</h1>

      <form action={createCompanyAction} className="ok-card space-y-4 p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <Field name="tradeName" label="Nome fantasia" required />
          <Field name="legalName" label="Razão social" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Field name="cnpj" label="CNPJ" />
          <Field name="category" label="Categoria" />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field name="responsibleName" label="Nome do responsável" required />
          <Field name="responsibleWhatsapp" label="WhatsApp do responsável" required />
          <Field name="email" label="E-mail" type="email" required />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Field name="phone" label="Telefone" />
          <Field name="city" label="Cidade" required />
          <Field name="neighborhood" label="Bairro" />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field name="instagramUrl" label="Instagram" type="url" />
          <Field name="facebookUrl" label="Facebook" type="url" />
          <Field name="tiktokUrl" label="TikTok" type="url" />
          <Field name="googleBusinessUrl" label="Google Meu Negócio" type="url" />
          <Field name="websiteUrl" label="Site" type="url" />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="ok-label">Plano</label>
            <select name="plan" className="ok-input" defaultValue="BASIC">
              <option value="FREE">FREE</option>
              <option value="BASIC">BASIC</option>
              <option value="PREMIUM">PREMIUM</option>
              <option value="ENTERPRISE">ENTERPRISE</option>
            </select>
          </div>
          <Field name="tokensBalance" label="Tokens iniciais" type="number" required defaultValue="300" />
          <div>
            <label className="ok-label">Status inicial</label>
            <select name="status" className="ok-input" defaultValue="PENDING">
              <option value="PENDING">PENDING</option>
              <option value="ACTIVE">ACTIVE</option>
            </select>
          </div>
        </div>

        <button type="submit" className="ok-btn-primary w-full">Salvar empresa</button>
      </form>
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  defaultValue,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="ok-label">{label}</label>
      <input name={name} type={type} required={required} className="ok-input" defaultValue={defaultValue} />
    </div>
  );
}
