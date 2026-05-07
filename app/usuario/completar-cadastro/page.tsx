import { redirect } from "next/navigation";

import { GamificationShell } from "@/components/gamification";
import { CompleteOnboardingForm } from "@/components/usuario/CompleteOnboardingForm";
import { requireUser } from "@/lib/auth";

export default async function CompletarCadastroPage() {
  const user = await requireUser();

  if (user.role === "COMPANY") redirect("/empresa/status");
  if (user.role === "ADMIN") redirect("/admin/dashboard");
  if (user.onboardingCompleted) redirect("/usuario/dashboard");

  return (
    <GamificationShell title="Completar cadastro" subtitle="Finalize CPF, Pix e banco para liberar saque.">
      <section className="rounded-2xl border border-[#6f45a3] bg-[#1a1030]/85 p-4 text-sm text-[#d9c4f2]">
        Proteja sua conta: confirme CPF, banco e chave Pix. Isso ativa saque seguro.
      </section>

      <section className="rounded-3xl border border-[#6f45a3] bg-[#1a1030]/85 p-4 backdrop-blur-md">
        <CompleteOnboardingForm
          phone={user.phone ?? ""}
          cpf={user.cpf ?? ""}
          pixKey={user.pixKey ?? ""}
          bankName={user.bankName ?? ""}
        />
      </section>
    </GamificationShell>
  );
}
