import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { IdentityVerificationCard } from "@/components/usuario/IdentityVerificationCard";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { requireRegularUser } from "@/lib/auth";
import { getWalletAvailableBalance } from "@/lib/campaign-rules";
import { db } from "@/lib/db";
import { formatDate, getNextWithdrawalDate, getWeekBounds } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

const platformLabel: Record<string, string> = {
  INSTAGRAM: "Instagram", TIKTOK: "TikTok",
  FACEBOOK: "Facebook", YOUTUBE: "YouTube",
  GOOGLE: "Google", LOCAL: "Local",
  OTHER: "Outra",
};

export default async function DashboardPage() {
  const user = await requireRegularUser();
  const weekBounds = getWeekBounds();

  const [availableCampaigns, pendingTasks, approvedTasks, weekApproved, balance, socialMissions, socialAccounts] = await Promise.all([
    db.campaign.count({ where: { status: "ACTIVE", reviewStatus: "APPROVED" } }),
    db.taskSubmission.count({ where: { userId: user.id, status: "PENDING" } }),
    db.taskSubmission.count({ where: { userId: user.id, status: "APPROVED" } }),
    db.taskSubmission.findMany({
      where: {
        userId: user.id, status: "APPROVED",
        submittedAt: {
          gte: weekBounds.start, lte: weekBounds.end,
        },
      },
      select: { rewardAmount: true },
    }),
    getWalletAvailableBalance(user.id),
    db.task.findMany({
      where: { status: "ACTIVE", campaign: { status: "ACTIVE", reviewStatus: "APPROVED" } },
      include: {
        campaign: {
          select: {
            title: true, companyName: true,
            category: true, socialPlatform: true,
          },
        },
      },
      orderBy: { reward: "desc" },
      take: 4,
    }),
    db.userSocialAccount.findMany({
      where: {
        userId: user.id, platform: { in: ["INSTAGRAM", "TIKTOK", "FACEBOOK"] },
      },
      select: {
        platform: true, status: true,
      },
    }),
  ]);

  const firstName = user.name.split(" ")[0] || "Usuário";
  const weekEarnings = weekApproved.reduce((sum, item) => sum + item.rewardAmount, 0);
  const nextWithdrawalLabel = formatDate(getNextWithdrawalDate());
  const weekDone = weekApproved.length;
  const weekTarget = 5;
  const progressPercent = Math.max(0, Math.min(100, Math.round((weekDone / weekTarget) * 100)));
  const pixConfigured = Boolean(user.pixKey && user.bankName && user.cpf);
  const socialMap = new Map(socialAccounts.map((item) => [item.platform, item.status]));
  const networkStatus = [
    { label: "Instagram", connected: socialMap.get("INSTAGRAM") === "CONNECTED" },
    { label: "TikTok", connected: socialMap.get("TIKTOK") === "CONNECTED" },
    { label: "Facebook", connected: socialMap.get("FACEBOOK") === "CONNECTED" },
  ];

  return (
    <AppShell title="Início" subtitle="Seu painel social de ganhos com segurança e transparência.">
      <section className="ok-card-premium ok-fade-up rounded-3xl border border-[#cd9dff] bg-gradient-to-br from-[#ff5cb9] via-[#c34dff] to-[#6e2fb7] p-6 text-white shadow-[0_26px_44px_-24px_rgba(90,24,148,0.9)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/86">Olá, {firstName}</p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">Saldo disponível</h2>
          </div>
          <div className="rounded-2xl border border-white/35 bg-white/15 px-3 py-2 backdrop-blur">
            <BrandLogo height={28} textClassName="text-white" />
          </div>
        </div>

        <p className="mt-4 text-4xl font-black tracking-tight md:text-5xl">{formatMoney(balance)}</p>

        {!user.onboardingCompleted ? (
          <p className="mt-3 rounded-xl border border-[#ffc9ea] bg-white/18 px-3 py-2 text-sm font-semibold text-white">
            Complete seu cadastro para liberar saques.
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href="/usuario/campanhas" className="ok-btn-primary inline-flex justify-center border-white/25 bg-white/20 text-white hover:bg-white/25">
            Ver campanhas
          </Link>
          <Link href="/usuario/saques" className="rounded-2xl border border-white/35 bg-white px-5 py-3 text-center font-semibold text-[#6a34a2] transition hover:scale-[1.02]">
            Sacar
          </Link>
        </div>
      </section>

      <section className="ok-fade-up ok-fade-delay-1 rounded-3xl border border-[#ead4ff] bg-white/72 p-5 shadow-[0_16px_30px_-24px_rgba(100,38,154,0.8)] backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[#3a1658]">Sua jornada hoje</h3>
          <span className="ok-badge">Atualizado agora</span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <article className="rounded-2xl border border-[#ecd8ff] bg-white/75 p-3 transition hover:-translate-y-0.5">
            <p className="text-xs font-semibold text-[#8566a3]">Campanhas disponíveis</p>
            <p className="mt-1 text-2xl font-extrabold text-[#3a1658]">{availableCampaigns}</p>
          </article>
          <article className="rounded-2xl border border-[#ecd8ff] bg-white/75 p-3 transition hover:-translate-y-0.5">
            <p className="text-xs font-semibold text-[#8566a3]">Tarefas pendentes</p>
            <p className="mt-1 text-2xl font-extrabold text-[#3a1658]">{pendingTasks}</p>
          </article>
          <article className="rounded-2xl border border-[#ecd8ff] bg-white/75 p-3 transition hover:-translate-y-0.5">
            <p className="text-xs font-semibold text-[#8566a3]">Tarefas aprovadas</p>
            <p className="mt-1 text-2xl font-extrabold text-[#3a1658]">{approvedTasks}</p>
          </article>
          <article className="rounded-2xl border border-[#ecd8ff] bg-white/75 p-3 transition hover:-translate-y-0.5">
            <p className="text-xs font-semibold text-[#8566a3]">Próximo saque</p>
            <p className="mt-1 text-lg font-extrabold text-[#3a1658]">{nextWithdrawalLabel}</p>
          </article>
        </div>
      </section>

      <section className="ok-fade-up ok-fade-delay-2 rounded-3xl border border-[#e9d3ff] bg-white/72 p-5 shadow-[0_16px_30px_-24px_rgba(100,38,154,0.8)] backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-[#3a1658]">Missões sociais</h3>
          <p className="text-sm font-semibold text-[#7a5a99]">Ganhos da semana: {formatMoney(weekEarnings)}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {socialMissions.map((task) => (
            <article
              key={task.id}
              className="rounded-2xl border border-[#e9d2ff] bg-white/82 p-4 shadow-[0_14px_24px_-20px_rgba(103,37,158,0.82)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_26px_-16px_rgba(103,37,158,0.9)]"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#8a6aa8]">{task.campaign.companyName}</p>
                  <h4 className="mt-1 text-base font-extrabold text-[#3a1658]">{task.title}</h4>
                </div>
                <span className="rounded-full border border-[#ffc6e5] bg-[#ffe7f5] px-2.5 py-1 text-xs font-semibold text-[#b23f8a]">
                  {formatMoney(task.reward)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="rounded-lg border border-[#e5d2ff] bg-[#f8efff] px-2 py-1 text-xs font-semibold text-[#6e45a0]">
                  {platformLabel[task.campaign.socialPlatform]}
                </span>
                <Link href={`/usuario/tarefas/${task.id}`} className="ok-btn-primary inline-flex px-4 py-2 text-sm">
                  Começar
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ok-fade-up ok-fade-delay-2 rounded-3xl border border-[#e9d3ff] bg-white/72 p-5 shadow-[0_16px_30px_-24px_rgba(100,38,154,0.8)] backdrop-blur-xl">
        <h3 className="text-lg font-extrabold text-[#3a1658]">Progresso da semana</h3>
        <p className="mt-1 text-sm text-[#7a5a99]">Metas: {weekDone}/{weekTarget} tarefas concluídas</p>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#f4e7ff]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ff63bc] via-[#c248ff] to-[#7a2fbc] transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-medium text-[#6a4a8e]">
          {progressPercent >= 80 ? "Ritmo excelente. Continue e aumente seu saldo ainda mais."
            : "Você está no caminho certo. Mais algumas missões e sua meta da semana será alcançada."}
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="ok-fade-up rounded-3xl border border-[#e9d3ff] bg-white/72 p-4 backdrop-blur-xl md:col-span-2">
          <h3 className="text-base font-extrabold text-[#3a1658]">Segurança da conta</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <IdentityVerificationCard status={user.identityVerificationStatus} />
            <article className="ok-card space-y-3 p-4">
              <p className="text-sm font-semibold text-[#4d2e75]">Redes conectadas</p>
              <div className="space-y-1 text-sm text-[#7a5a99]">
                {networkStatus.map((network) => (
                  <p key={network.label}>
                    {network.label}: <strong>{network.connected ? "Conectado" : "Não conectado"}</strong>
                  </p>
                ))}
              </div>
              <Link href="/usuario/redes" className="ok-btn-secondary inline-flex">
                Gerenciar redes
              </Link>
            </article>
          </div>

          <div className="mt-3 rounded-2xl border border-[#efdfff] bg-white/80 p-3 text-sm text-[#6f4f8f]">
            Dados Pix: <strong>{pixConfigured ? "Configurado" : "Não configurado"}</strong>
          </div>
        </article>

        <article className="ok-fade-up rounded-3xl border border-[#e9d3ff] bg-white/72 p-4 backdrop-blur-xl">
          <h3 className="text-base font-extrabold text-[#3a1658]">Ganhe mais</h3>
          <div className="mt-3 space-y-2">
            <p className="rounded-xl border border-[#efdfff] bg-white/80 px-3 py-3 text-sm text-[#6f4f8f]">
              Complete tarefas com provas claras.
            </p>
            <p className="rounded-xl border border-[#efdfff] bg-white/80 px-3 py-3 text-sm text-[#6f4f8f]">
              Priorize campanhas perto de você.
            </p>
            <p className="rounded-xl border border-[#efdfff] bg-white/80 px-3 py-3 text-sm text-[#6f4f8f]">
              Mantenha seus dados de saque atualizados.
            </p>
          </div>
        </article>
      </section>
    </AppShell>
  );
}
