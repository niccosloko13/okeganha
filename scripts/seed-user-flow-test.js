const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const TEST_IDS = {
  companyPublicId: "OKG-EMP-TEST-FLOW",
  companyCnpj: "99999999000191",
  companyEmail: "empresa.teste@okeganha.local",
  userEmail: "usuario.teste@okeganha.local",
  campaignTitle: "Siga o perfil da Academia Teste",
};

function nowPlusDays(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function ensureCompany() {
  const passwordHash = await bcrypt.hash("EmpresaTeste123", 10);
  const now = new Date();
  const cycleEnd = nowPlusDays(30);

  return prisma.company.upsert({
    where: { publicId: TEST_IDS.companyPublicId },
    update: {
      status: "ACTIVE",
      planStatus: "ACTIVE",
      approvedAt: now,
      rejectedAt: new Date(0),
      rejectionReason: "",
      phone: "11911111111",
      instagramUrl: "https://instagram.com/okeganha_teste",
      facebookUrl: "https://facebook.com/okeganha.teste",
      tiktokUrl: "https://tiktok.com/@okeganha_teste",
      googleBusinessUrl: "https://maps.google.com/?q=Academia+Teste+OKEGANHA",
      websiteUrl: "https://okeganha.local/empresa-teste",
      tokensBalance: 5000,
      tokensMonthlyLimit: 5000,
      tokensUsedThisCycle: 0,
      billingCycleStart: now,
      billingCycleEnd: cycleEnd,
    },
    create: {
      publicId: TEST_IDS.companyPublicId,
      legalName: "Academia Teste OKEGANHA LTDA",
      tradeName: "Academia Teste OKEGANHA",
      cnpj: TEST_IDS.companyCnpj,
      responsibleName: "Responsavel Teste",
      responsibleWhatsapp: "11911111111",
      email: TEST_IDS.companyEmail,
      status: "ACTIVE",
      passwordHash,
      phone: "11911111111",
      city: "Sao Paulo",
      neighborhood: "Centro",
      category: "Fitness",
      instagramUrl: "https://instagram.com/okeganha_teste",
      facebookUrl: "https://facebook.com/okeganha.teste",
      tiktokUrl: "https://tiktok.com/@okeganha_teste",
      googleBusinessUrl: "https://maps.google.com/?q=Academia+Teste+OKEGANHA",
      websiteUrl: "https://okeganha.local/empresa-teste",
      approvedAt: now,
      rejectedAt: new Date(0),
      rejectionReason: "",
      plan: "PREMIUM",
      planStatus: "ACTIVE",
      tokensBalance: 5000,
      tokensMonthlyLimit: 5000,
      tokensUsedThisCycle: 0,
      billingCycleStart: now,
      billingCycleEnd: cycleEnd,
    },
  });
}

async function ensureCompanyUser(companyId) {
  const passwordHash = await bcrypt.hash("EmpresaTeste123", 10);
  return prisma.user.upsert({
    where: { email: TEST_IDS.companyEmail },
    update: {
      name: "Empresa Teste OKEGANHA",
      role: "COMPANY",
      status: "ACTIVE",
      phone: "11911111111",
      companyId,
      onboardingCompleted: false,
    },
    create: {
      name: "Empresa Teste OKEGANHA",
      email: TEST_IDS.companyEmail,
      passwordHash,
      phone: "11911111111",
      role: "COMPANY",
      status: "ACTIVE",
      companyId,
      onboardingCompleted: false,
      identityVerificationStatus: "NOT_VERIFIED",
    },
  });
}

async function ensureCampaign(company) {
  const now = new Date();
  const existing = await prisma.campaign.findFirst({
    where: {
      companyId: company.id,
      title: TEST_IDS.campaignTitle,
    },
  });

  if (existing) {
    return prisma.campaign.update({
      where: { id: existing.id },
      data: {
        description: "Siga o perfil oficial da Academia Teste no Instagram.",
        socialPlatform: "INSTAGRAM",
        contentUrl: "https://instagram.com/okeganha",
        objective: "FOLLOW_PROFILE",
        rewardPerTask: 150,
        dailyLimitPerUser: 1,
        totalBudget: 100000,
        status: "ACTIVE",
        reviewStatus: "APPROVED",
        submittedForReviewAt: existing.submittedForReviewAt || now,
        reviewedAt: now,
        startDate: now,
        endDate: nowPlusDays(30),
      },
    });
  }

  return prisma.campaign.create({
    data: {
      companyId: company.id,
      title: TEST_IDS.campaignTitle,
      description: "Siga o perfil oficial da Academia Teste no Instagram.",
      companyName: company.tradeName,
      city: company.city,
      neighborhood: company.neighborhood,
      category: company.category,
      socialPlatform: "INSTAGRAM",
      contentUrl: "https://instagram.com/okeganha",
      objective: "FOLLOW_PROFILE",
      rewardPerTask: 150,
      dailyLimitPerUser: 1,
      totalBudget: 100000,
      status: "ACTIVE",
      reviewStatus: "APPROVED",
      submittedForReviewAt: now,
      reviewedAt: now,
      startDate: now,
      endDate: nowPlusDays(30),
    },
  });
}

async function ensureTask(campaignId, title, data) {
  const existing = await prisma.task.findFirst({
    where: { campaignId, title },
  });

  if (existing) {
    return prisma.task.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.task.create({
    data: { campaignId, title, ...data },
  });
}

async function ensureTasks(campaign) {
  const instagram = await ensureTask(campaign.id, "Instagram: Seguir perfil", {
    description: "Siga o perfil da Academia Teste.",
    instructions: "Abra o perfil, siga e envie prova.",
    reward: 120,
    type: "CONTENT",
    externalUrl: "https://instagram.com/okeganha",
    proofType: "TEXT_AND_IMAGE",
    requiredWatchSeconds: 10,
    status: "ACTIVE",
  });

  const tiktok = await ensureTask(campaign.id, "TikTok: Assistir video", {
    description: "Assista ao video curto da campanha.",
    instructions: "Abra o video, assista pelo tempo minimo e confirme.",
    reward: 140,
    type: "CONTENT",
    externalUrl: "https://tiktok.com/@okeganha/video/1234567890",
    proofType: "TEXT_AND_IMAGE",
    requiredWatchSeconds: 20,
    status: "ACTIVE",
  });

  const google = await ensureTask(campaign.id, "Google Review: Avaliar empresa", {
    description: "Abra o perfil no Google e envie avaliacao.",
    instructions: "Escreva uma avaliacao real e envie comprovacao.",
    reward: 180,
    type: "REVIEW",
    externalUrl: "https://maps.google.com/?q=Academia+Teste+OKEGANHA",
    proofType: "TEXT_AND_IMAGE",
    requiredWatchSeconds: 15,
    status: "ACTIVE",
  });

  return [instagram, tiktok, google];
}

async function ensureTestUser() {
  const passwordHash = await bcrypt.hash("Teste123456", 10);
  return prisma.user.upsert({
    where: { email: TEST_IDS.userEmail },
    update: {
      name: "Usuario Teste OKEGANHA",
      phone: "11999999999",
      role: "USER",
      status: "ACTIVE",
      onboardingCompleted: true,
      energy: 1000,
      maxEnergy: 1000,
      xp: 0,
      level: 1,
      trustScore: 500,
      isVerifiedProfile: false,
      companyId: null,
    },
    create: {
      name: "Usuario Teste OKEGANHA",
      email: TEST_IDS.userEmail,
      passwordHash,
      phone: "11999999999",
      role: "USER",
      status: "ACTIVE",
      onboardingCompleted: true,
      identityVerificationStatus: "NOT_VERIFIED",
      energy: 1000,
      maxEnergy: 1000,
      xp: 0,
      level: 1,
      trustScore: 500,
      isVerifiedProfile: false,
      companyId: null,
    },
  });
}

async function main() {
  const company = await ensureCompany();
  const companyUser = await ensureCompanyUser(company.id);
  const campaign = await ensureCampaign(company);
  const tasks = await ensureTasks(campaign);
  const user = await ensureTestUser();

  console.log("Seed de fluxo de usuario finalizado.");
  console.log(`Empresa: ${company.tradeName} (${company.id})`);
  console.log(`Usuario empresa: ${companyUser.email}`);
  console.log(`Campanha: ${campaign.title} (${campaign.id})`);
  console.log(`Missoes: ${tasks.map((t) => t.title).join(" | ")}`);
  console.log(`Usuario teste: ${user.email}`);
}

main()
  .catch((error) => {
    console.error("Falha no seed-user-flow-test:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
