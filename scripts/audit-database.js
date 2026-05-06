const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const [
    totalUsers,
    usersByRole,
    totalCompanies,
    companiesWithoutUser,
    companyUsersWithoutCompany,
    wrongUserCompanyLinks,
    wrongAdminCompanyLinks,
    campaignsWithoutCompany,
    campaignsByStatus,
    activeCampaignsWithoutApprovedReview,
    submissionsByStatus,
    withdrawalsByStatus,
    duplicatedCreditsByReference,
    nonUserWithPayoutData,
    approvedWithoutReward,
    suspiciousRecentLogs,
    orphanSubmissionsRows,
    blockedWithRecentLogin,
    sharedFingerprintUsers,
    excessiveFocusLossSessions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.company.count(),
    prisma.company.count({ where: { users: { none: { role: "COMPANY" } } } }),
    prisma.user.count({ where: { role: "COMPANY", companyId: null } }),
    prisma.user.count({ where: { role: "USER", NOT: { companyId: null } } }),
    prisma.user.count({ where: { role: "ADMIN", NOT: { companyId: null } } }),
    prisma.campaign.count({ where: { companyId: null } }),
    prisma.campaign.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.campaign.count({
      where: {
        status: "ACTIVE",
        reviewStatus: { not: "APPROVED" },
      },
    }),
    prisma.taskSubmission.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.withdrawalRequest.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.walletTransaction.groupBy({
      by: ["type", "referenceId"], where: {
        type: "CREDIT", referenceId: { not: null },
      },
      _count: { _all: true },
    }),
    prisma.user.count({
      where: {
        role: { in: ["ADMIN", "COMPANY"] },
        OR: [
          { cpf: { not: null } },
          { pixKey: { not: null } },
          { bankName: { not: null } },
        ],
      },
    }),
    prisma.taskSubmission.count({
      where: {
        status: "APPROVED", rewardAmount: { lte: 0 },
      },
    }),
    prisma.userActivityLog.count({
      where: {
        type: "SUSPICIOUS_ACTIVITY", createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.$queryRaw`
      SELECT COUNT(*)::int AS count
      FROM "TaskSubmission" ts
      LEFT JOIN "Campaign" c ON c.id = ts."campaignId"
      LEFT JOIN "Task" t ON t.id = ts."taskId"
      WHERE c.id IS NULL OR t.id IS NULL
    `,
    prisma.user.count({
      where: {
        status: "BLOCKED", activityLogs: {
          some: {
            type: "LOGIN", createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        },
      },
    }),
    prisma.$queryRaw`
      SELECT COUNT(*)::int AS count
      FROM (
        SELECT "fingerprintHash"
        FROM "UserDevice"
        GROUP BY "fingerprintHash"
        HAVING COUNT(DISTINCT "userId") > 1
      ) x
    `,
    prisma.taskSession.count({
      where: {
        focusLossCount: { gt: 20 },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  console.log("\n=== OKEGANHA DB AUDIT ===\n");
  console.log(`Total de usuários: ${totalUsers}`);
  console.log("Usuários por role:");
  for (const item of usersByRole) {
    console.log(`- ${item.role}: ${item._count._all}`);
  }

  console.log(`\nEmpresas totais: ${totalCompanies}`);
  console.log(`Empresas sem usuário COMPANY vinculado: ${companiesWithoutUser}`);
  console.log(`Users COMPANY sem companyId: ${companyUsersWithoutCompany}`);
  console.log(`Users USER com companyId indevido: ${wrongUserCompanyLinks}`);
  console.log(`Admins com companyId indevido: ${wrongAdminCompanyLinks}`);
  console.log(`Campanhas sem empresa: ${campaignsWithoutCompany}`);
  console.log(`Campanhas ACTIVE sem reviewStatus APPROVED: ${activeCampaignsWithoutApprovedReview}`);
  console.log(`ADMIN/COMPANY com dados de saque preenchidos: ${nonUserWithPayoutData}`);
  console.log(`Submissões aprovadas sem recompensa (>0): ${approvedWithoutReward}`);
  console.log(`Logs suspeitos nas últimas 24h: ${suspiciousRecentLogs}`);
  console.log(`Usuários bloqueados com login recente (possível sessão ativa): ${blockedWithRecentLogin}`);
  const orphanSubmissions = Array.isArray(orphanSubmissionsRows) && orphanSubmissionsRows[0] ? Number(orphanSubmissionsRows[0].count ?? 0) : 0;
  const sharedFingerprints = Array.isArray(sharedFingerprintUsers) && sharedFingerprintUsers[0] ? Number(sharedFingerprintUsers[0].count ?? 0) : 0;
  console.log(`Submissões órfãs (sem campanha/tarefa): ${orphanSubmissions}`);
  console.log(`Fingerprints compartilhados entre contas: ${sharedFingerprints}`);
  console.log(`Sessões com perda de foco excessiva (7 dias): ${excessiveFocusLossSessions}`);

  console.log("\nCampanhas por status:");
  for (const item of campaignsByStatus) {
    console.log(`- ${item.status}: ${item._count._all}`);
  }

  console.log("\nSubmissões por status:");
  for (const item of submissionsByStatus) {
    console.log(`- ${item.status}: ${item._count._all}`);
  }

  console.log("\nSaques por status:");
  for (const item of withdrawalsByStatus) {
    console.log(`- ${item.status}: ${item._count._all}`);
  }

  const duplicateCredits = duplicatedCreditsByReference.filter((item) => item._count._all > 1);
  console.log(`\nCréditos duplicados por referenceId: ${duplicateCredits.length}`);
  if (duplicateCredits.length > 0) {
    for (const item of duplicateCredits.slice(0, 20)) {
      console.log(`- referenceId ${item.referenceId}: ${item._count._all} créditos`);
    }
  }

  console.log("\n=== Fim do diagnóstico ===\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
