import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

import { GamificationShell, StatsCard } from "@/components/gamification";
import { UserSocialAccountsForm } from "@/components/usuario/UserSocialAccountsForm";

const platforms = [
  { key: "INSTAGRAM", label: "Instagram" },
  { key: "TIKTOK", label: "TikTok" },
  { key: "FACEBOOK", label: "Facebook" },
] as const;

export default async function RedesPage() {
  const user = await requireUser();
  const accounts = await db.userSocialAccount.findMany({
    where: { userId: user.id },
    select: { platform: true, profileUrl: true, username: true, status: true },
  });

  const connected = accounts.filter((a) => a.status === "CONNECTED").length;

  return (
    <GamificationShell title="Redes" subtitle="Conecte com seguranca para desbloquear mais missoes sociais.">
      <section className="grid gap-3 md:grid-cols-3">
        <StatsCard label="Conectadas" value={String(connected)} />
        <StatsCard label="Total" value={String(platforms.length)} />
        <StatsCard label="Confianca" value={connected >= 2 ? "ALTA" : "EM EVOLUCAO"} />
      </section>

      <section className="rounded-2xl border border-[#6f45a3] bg-[#1a1030]/85 p-4 text-sm text-[#d9c4f2]">
        <p className="font-semibold text-[#f1e7ff]">Conexao temporaria em preparacao</p>
        <p className="mt-1">No MVP, suas redes serao usadas apenas durante a sessao.</p>
        <p className="mt-1">Nunca pediremos sua senha.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {platforms.map((platform) => {
          const account = accounts.find((item) => item.platform === platform.key);
          const status = account?.status === "CONNECTED" ? "CONNECTED" : account?.status === "PENDING" ? "PENDING" : "DISCONNECTED";
          return (
            <UserSocialAccountsForm
              key={platform.key}
              platform={platform.key}
              platformLabel={platform.label}
              profileUrl={account?.profileUrl ?? ""}
              username={account?.username ?? ""}
              status={status}
            />
          );
        })}
      </section>
    </GamificationShell>
  );
}
