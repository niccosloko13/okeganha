import { redirect } from "next/navigation";

import { EnergyBar, GamificationShell, LevelBadge, ProfileCard, StatsCard, WalletCard, XPBar } from "@/components/gamification";
import { ProfileForm } from "@/components/usuario/ProfileForm";
import { requireUser } from "@/lib/auth";
import { getWalletAvailableBalance } from "@/lib/campaign-rules";
import { formatMoney } from "@/lib/money";

export default async function PerfilPage() {
  const user = await requireUser();

  if (user.role === "COMPANY") redirect("/rela/status");
  if (user.role === "ADMIN") redirect("/admin/dashboard");

  const available = await getWalletAvailableBalance(user.id);

  return (
    <GamificationShell title="Perfil" subtitle="Sua identidade gamificada e dados de conta.">
      <section className="grid gap-3 md:grid-cols-3">
        <div className="md:col-span-2 rounded-3xl border border-[#6f45a3] bg-[#1a1030]/85 p-4 backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between"><ProfileCard name={user.name} /><LevelBadge level={user.level} /></div>
          <XPBar xp={user.xp} nextXp={15500} />
          <div className="mt-4"><EnergyBar energy={user.energy} maxEnergy={user.maxEnergy} /></div>
        </div>
        <WalletCard balance={formatMoney(available)} />
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <StatsCard label="Perfil verificado" value={user.isVerifiedProfile ? "SIM" : "PENDENTE"} />
        <StatsCard label="Trust score" value={String(user.trustScore)} />
        <StatsCard label="Onboarding" value={user.onboardingCompleted ? "COMPLETO" : "PENDENTE"} />
      </section>

      <section className="rounded-3xl border border-[#6f45a3] bg-[#1a1030]/85 p-4 backdrop-blur-md">
        <ProfileForm phone={user.phone} pixKey={user.pixKey} email={user.email} name={user.name} />
      </section>
    </GamificationShell>
  );
}
