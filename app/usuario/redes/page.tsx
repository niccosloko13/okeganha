import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

import { GamificationShell, StatsCard } from "@/components/gamification";
import { SocialConnectCard } from "@/components/gamification/SocialConnectCard";

const platforms = ["INSTAGRAM", "TIKTOK", "FACEBOOK"] as const;

type StatusUI = "NOT_CONNECTED" | "PENDING" | "CONNECTED" | "ERROR" | "RECHECK_REQUIRED";

function mapStatus(status?: string): StatusUI {
  if (!status) return "NOT_CONNECTED";
  if (status === "CONNECTED") return "CONNECTED";
  if (status === "PENDING") return "PENDING";
  return "RECHECK_REQUIRED";
}

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
        Conexao social sem senha: nunca solicitamos credenciais. Fluxo real sera via autorizacao segura quando disponivel.
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {platforms.map((platform) => {
          const account = accounts.find((item) => item.platform === platform);
          return (
            <SocialConnectCard
              key={platform}
              platform={platform}
              username={account?.username ?? ""}
              profileUrl={account?.profileUrl ?? ""}
              status={mapStatus(account?.status)}
            />
          );
        })}
      </section>
    </GamificationShell>
  );
}
