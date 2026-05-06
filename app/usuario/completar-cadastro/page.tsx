import { redirect } from "next/navigation";

import { UserShell } from "@/components/layout/UserShell";
import { CompleteOnboardingForm } from "@/components/usuario/CompleteOnboardingForm";
import { requireUser } from "@/lib/auth";

export default async function CompletarCadastroPage() {
  const user = await requireUser();

  if (user.role === "COMPANY") {
    redirect("/empresa/status");
  }

  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }

  if (user.onboardingCompleted) {
    redirect("/usuario/dashboard");
  }

  return (
    <UserShell title="Completar cadastro" subtitle="Finalize seus dados para liberar saques com segurança.">
      <section className="ok-card p-4">
        <p className="text-sm text-[#7a5a99]">
          Para proteger sua conta e habilitar saques, confirme CPF, telefone, banco e chave Pix.
        </p>
      </section>

      <CompleteOnboardingForm
        phone={user.phone ?? ""}
        cpf={user.cpf ?? ""}
        pixKey={user.pixKey ?? ""}
        bankName={user.bankName ?? ""}
      />
    </UserShell>
  );
}
