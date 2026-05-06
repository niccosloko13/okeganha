import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

import { UserShell } from "@/components/layout/UserShell";
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
    select: {
      id: true, platform: true,
      profileUrl: true, username: true,
      status: true, connectedAt: true,
    },
  });

  return (
    <UserShell title="Redes conectadas" subtitle="Cadastre seus perfis para testes manuais e validação de tarefas sociais.">
      <section className="ok-card p-4">
        <p className="text-sm text-[#7a5a99]">
          Modo de teste: conexão manual por URL e usuário. Não solicitamos senha e não automatizamos ações em redes sociais.
        </p>
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
    </UserShell>
  );
}
