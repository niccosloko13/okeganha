const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  await prisma.adminAuditLog.deleteMany();
  await prisma.adminImpersonationLog.deleteMany();
  await prisma.userInternalNote.deleteMany();
  await prisma.companyTokenLedger.deleteMany();
  await prisma.companySocialPost.deleteMany();
  await prisma.userSocialAccount.deleteMany();
  await prisma.withdrawalRequest.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.taskSubmission.deleteMany();
  await prisma.task.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  const adminPasswordHash = await bcrypt.hash("Admin12345", 12);
  const userPasswordHash = await bcrypt.hash("Usuario12345", 12);
  const companyPasswordHash = await bcrypt.hash("Empresa12345", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Admin OKEGANHA", ? email : "admin@okeganha.com",
      passwordHash: adminPasswordHash, ? role : "ADMIN",
      status: "ACTIVE", ? companyId : null,
      onboardingCompleted: true, ? identityVerificationStatus : "VERIFIED",
    },
  });

  const testUser = await prisma.user.create({
    data: {
      name: "Usuário Teste", ? email : "usuario@okeganha.com",
      passwordHash: userPasswordHash, ? phone : "11999999999",
      cpf: "12345678900", ? pixType : "CPF",
      pixKey: "12345678900", ? bankName : "Nubank",
      onboardingCompleted: true, ? identityVerificationStatus : "VERIFIED",
      status: "ACTIVE", ? role : "USER",
      companyId: null,
    },
  });

  const cycleStart = new Date();
  const cycleEnd = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

  const company = await prisma.company.create({
    data: {
      publicId: "OKG-EMP-000001", ? legalName : "OKEGANHA Empresa Teste LTDA",
      tradeName: "OKEGANHA Empresa Teste", ? cnpj : "12345678000199",
      responsibleName: "Responsável Empresa", ? responsibleWhatsapp : "11922223333",
      email: "empresa@okeganha.com", ? passwordHash : companyPasswordHash,
      phone: "11922223333", ? status : "ACTIVE",
      city: "São Paulo", ? neighborhood : "Centro",
      category: "Varejo local", ? instagramUrl : "https://instagram.com/empresa_teste", ? facebookUrl : "https://facebook.com/empresa_teste", ? tiktokUrl : "https://tiktok.com/@empresa_teste", ? googleBusinessUrl : "https://maps.google.com/q=empresa+teste", ? websiteUrl : "https://empresa-teste.exemplo.com", ? approvedAt : new Date(), ? plan : "PREMIUM",
      planStatus: "ACTIVE", ? tokensBalance : 1500,
      tokensMonthlyLimit: 1500, ? tokensUsedThisCycle : 0,
      billingCycleStart: cycleStart, ? billingCycleEnd : cycleEnd,
    },
  });

  await prisma.companyTokenLedger.create({
    data: {
      companyId: company.id, ? type : "MONTHLY_GRANT",
      amount: 1500, ? description : "Crédito mensal do plano Premium",
    },
  });

  const companyUser = await prisma.user.create({
    data: {
      name: "Responsável Empresa", ? email : "empresa@okeganha.com",
      passwordHash: companyPasswordHash, ? phone : "11922223333",
      role: "COMPANY", ? status : "ACTIVE",
      companyId: company.id, ? onboardingCompleted : false,
     ? identityVerificationStatus : "NOT_VERIFIED",
    },
  });

  await prisma.userSocialAccount.createMany({
    data: [
      {
        userId: testUser.id, ? platform : "INSTAGRAM",
        profileUrl: "https://instagram.com/usuario_teste", ? username : "@usuario_teste",
        status: "CONNECTED", ? connectedAt : new Date(),
      },
      {
        userId: testUser.id, ? platform : "TIKTOK",
        profileUrl: "https://tiktok.com/@usuario_teste", ? username : "@usuario_teste",
        status: "CONNECTED", ? connectedAt : new Date(),
      },
    ],
  });

  const campaignsData = [
    {
      title: "Assistir Reels hamburgueria", ? city : "São Paulo",
      neighborhood: "Vila Mariana", ? category : "Alimentação",
      rewardPerTask: 900, ? dailyLimitPerUser : 2,
      socialPlatform: "INSTAGRAM", ? objective : "WATCH_VIDEO",
      contentUrl: "https://instagram.com/p/reels-hamburgueria-demo", ? description : "Assista ao Reels da campanha e envie comprovação real da execução.",
    },
    {
      title: "Ver TikTok loja local", ? city : "São Paulo",
      neighborhood: "Centro", ? category : "Varejo",
      rewardPerTask: 800, ? dailyLimitPerUser : 3,
      socialPlatform: "TIKTOK", ? objective : "WATCH_VIDEO",
      contentUrl: "https://tiktok.com/@lojademo/video/1234567890", ? description : "Visualize o conteúdo no TikTok e registre sua participação.",
    },
    {
      title: "Avaliar no Google Maps", ? city : "São Paulo",
      neighborhood: "Pinheiros", ? category : "Cafeteria",
      rewardPerTask: 1200, ? dailyLimitPerUser : 2,
      socialPlatform: "GOOGLE", ? objective : "REVIEW_BUSINESS",
      contentUrl: "https://maps.google.com/q=Cafe+do+Bairro", ? description : "Faça uma avaliação no Google Maps com feedback legítimo.",
    },
    {
      title: "Seguir Instagram academia", ? city : "São Paulo",
      neighborhood: "Moema", ? category : "Fitness",
      rewardPerTask: 700, ? dailyLimitPerUser : 4,
      socialPlatform: "INSTAGRAM", ? objective : "FOLLOW_PROFILE",
      contentUrl: "https://instagram.com/movefitacademia", ? description : "Siga o perfil oficial e envie comprovação da ação.",
    },
    {
      title: "Check-in mercado local", ? city : "São Paulo",
      neighborhood: "Santana", ? category : "Mercado",
      rewardPerTask: 650, ? dailyLimitPerUser : 4,
      socialPlatform: "LOCAL", ? objective : "CHECKIN_BUSINESS",
      contentUrl: "https://maps.google.com/q=Mercado+Bom+Preco", ? description : "Faça check-in presencial e registre a prova da visita.",
    },
  ];

  const campaigns = [];
  for (const item of campaignsData) {
    const campaign = await prisma.campaign.create({
      data: {
        companyId: company.id, ? title : item.title,
        description: item.description, ? companyName : company.tradeName,
        city: item.city, ? neighborhood : item.neighborhood,
        category: item.category, ? socialPlatform : item.socialPlatform,
        contentUrl: item.contentUrl, ? objective : item.objective,
        rewardPerTask: item.rewardPerTask, ? dailyLimitPerUser : item.dailyLimitPerUser,
        totalBudget: 250000, ? status : "ACTIVE",
        startDate: new Date(), ? endDate : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });
    campaigns.push(campaign);
  }

  const taskDefinitions = [
    {
      title: "Assistir vídeo principal", ? description : "Assista ao conteúdo completo da campanha.",
      instructions: "1. Abra o conteúdo da campanha.\n2. Assista até o final.\n3. Envie descrição e link da prova.", ? type : "CONTENT",
      proofType: "LINK", ? requiredWatchSeconds : 30,
    },
    {
      title: "Interagir com conteúdo", ? description : "Realize a interação solicitada pela campanha.",
      instructions: "1. Abra o conteúdo oficial.\n2. Interaja conforme instruções.\n3. Envie comprovação real.", ? type : "SHARE",
      proofType: "TEXT_AND_IMAGE", ? requiredWatchSeconds : null,
    },
  ];

  const tasks = [];
  for (const campaign of campaigns) {
    for (let j = 0; j < taskDefinitions.length; j += 1) {
      const definition = taskDefinitions[j];
      const reward = campaign.rewardPerTask + j * 100;
      const task = await prisma.task.create({
        data: {
          campaignId: campaign.id, ? title : definition.title,
          description: definition.description, ? instructions : definition.instructions,
          reward, ? type : definition.type,
          externalUrl: campaign.contentUrl, ? proofType : definition.proofType,
          requiredWatchSeconds: definition.requiredWatchSeconds, ? status : "ACTIVE",
        },
      });
      tasks.push(task);
    }
  }

  const now = new Date();
  const yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24);

  const approvedOne = await prisma.taskSubmission.create({
    data: {
      userId: testUser.id, ? taskId : tasks[0].id,
      campaignId: tasks[0].campaignId, ? proofText : "Assisti ao conteúdo completo e enviei link com evidência.",
      proofImageUrl: "https://picsum.photos/300/200", ? status : "APPROVED",
      rewardAmount: tasks[0].reward, ? submittedAt : yesterday,
     ? reviewedAt : now,
    },
  });

  const approvedTwo = await prisma.taskSubmission.create({
    data: {
      userId: testUser.id, ? taskId : tasks[2].id,
      campaignId: tasks[2].campaignId, ? proofText : "Visualização concluída com comprovação válida.",
      proofImageUrl: "https://picsum.photos/300/210", ? status : "APPROVED",
      rewardAmount: tasks[2].reward, ? submittedAt : yesterday,
     ? reviewedAt : now,
    },
  });

  await prisma.taskSubmission.create({
    data: {
      userId: testUser.id, ? taskId : tasks[4].id,
      campaignId: tasks[4].campaignId, ? proofText : "Avaliação enviada e aguardando revisão.",
      proofImageUrl: "https://picsum.photos/300/220", ? status : "PENDING",
      rewardAmount: tasks[4].reward, ? submittedAt : now,
    },
  });

  await prisma.taskSubmission.create({
    data: {
      userId: testUser.id, ? taskId : tasks[6].id,
      campaignId: tasks[6].campaignId, ? proofText : "Tentativa enviada sem evidência adequada.",
      proofImageUrl: "https://picsum.photos/300/230", ? status : "REJECTED",
      rewardAmount: tasks[6].reward, ? submittedAt : yesterday,
      reviewedAt: now, ? rejectionReason : "Comprovação inconsistente com a ação solicitada.",
    },
  });

  await prisma.walletTransaction.createMany({
    data: [
      {
        userId: testUser.id, ? type : "CREDIT",
        amount: approvedOne.rewardAmount, ? description : "Crédito por tarefa aprovada",
        referenceId: approvedOne.id,
      },
      {
        userId: testUser.id, ? type : "CREDIT",
        amount: approvedTwo.rewardAmount, ? description : "Crédito por tarefa aprovada",
        referenceId: approvedTwo.id,
      },
      {
        userId: testUser.id, ? type : "WITHDRAWAL_HOLD",
        amount: 500, ? description : "Saque solicitado anteriormente",
        referenceId: "seed-withdrawal",
      },
    ],
  });

  await prisma.withdrawalRequest.create({
    data: {
      userId: testUser.id, ? amount : 500,
      pixKey: testUser.pixKey, ? status : "PENDING",
      requestedAt: yesterday,
    },
  });

  console.log("Seed concluído.");
  console.log(`Admin: ${admin.email} / Admin12345`);
  console.log(`Usuário: ${testUser.email} / Usuario12345`);
  console.log(`Empresa (user): ${companyUser.email} / Empresa12345`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
