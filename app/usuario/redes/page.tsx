import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

import { GamificationShell, StatsCard } from "@/components/gamification";
import { UserSocialAccountsForm } from "@/components/usuario/UserSocialAccountsForm";

const platforms = [
  { key: "INSTAGRAM", label: "Instagram" },
  { key: "TIKTOK", label: "TikTok" },
  { key: "FACEBOOK", label: "Facebook" },
  { key: "GOOGLE", label: "Google" },
  { key: "YOUTUBE", label: "YouTube" },
] as const;

export default async function RedesPage() {
  const user = await requireUser();
  const accounts = await db.userSocialAccount.findMany({
    where: { userId: user.id },
    select: { id: true, platform: true, profileUrl: true, username: true, status: true, connectedAt: true },
  });

  const connected = accounts.filter((a) => a.status === "CONNECTED").length;

  return (
    <GamificationShell title="Redes" subtitle="Conecte perfis para liberar mais missoes sociais.">
      <section className="grid gap-3 md:grid-cols-3">
        <StatsCard label="Conectadas" value={String(connected)} />
        <StatsCard label="Total" value={String(platforms.length)} />
        <StatsCard label="Nivel social" value={connected >= 3 ? "ALTO" : "INICIAL"} />
      </section>

      <section className="rounded-2xl border border-[#6f45a3] bg-[#1a1030]/85 p-4 text-sm text-[#d9c4f2]">
        Modo seguro: conexao manual por URL/usuario. Sem senha e sem automacao externa.
      </section>

      <section className="space-y-3">
        {platforms.map((platform) => {
          const account = accounts.find((item) => item.platform === platform.key);
          return (
            <UserSocialAccountsForm
              key={platform.key}
              platform={platform.key}
              platformLabel={platform.label}
              profileUrl={account?.profileUrl ?? ""}
              username={account?.username ?? ""}
              status={account?.status ?? "DISCONNECTED"}
            />
          );
        })}
      </section>
    </GamificationShell>
  );
}
