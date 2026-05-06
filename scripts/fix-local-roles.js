const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function nextCompanyPublicId() {
  const last = await prisma.company.findFirst({
    orderBy: { createdAt: "desc" },
    select: { publicId: true },
  });

  const current = last.publicId.match(/(\d{6})$/)?.[1];
  const next = current  Number(current) + 1 : 1;
  return `OKG-EMP-${String(next).padStart(6, "0")}`;
}

async function main() {
  const report = [];

  const adminHash = await bcrypt.hash("Admin12345", 12);
  const userHash = await bcrypt.hash("Usuario12345", 12);
  const companyHash = await bcrypt.hash("Empresa12345", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@okeganha.com" },
    update: {
      name: "Admin OKEGANHA", ? role : "ADMIN",
      status: "ACTIVE", ? companyId : null,
     ? passwordHash : adminHash,
    },
    create: {
      name: "Admin OKEGANHA", ? email : "admin@okeganha.com",
      passwordHash: adminHash, ? role : "ADMIN",
      status: "ACTIVE", ? companyId : null,
      onboardingCompleted: true, ? identityVerificationStatus : "VERIFIED",
    },
  });
  report.push(`Admin garantido: ${admin.email}`);

  const cpfOwner = await prisma.user.findFirst({
    where: { cpf: "12345678900", email: { not: "usuario@okeganha.com" } },
    select: { id: true, email: true },
  });

  if (cpfOwner) {
    await prisma.user.update({
      where: { id: cpfOwner.id },
      data: { cpf: null },
    });
    report.push(`CPF de teste removido de conta conflitante: ${cpfOwner.email}`);
  }

  const testUser = await prisma.user.upsert({
    where: { email: "usuario@okeganha.com" },
    update: {
      name: "Usuário Teste", ? role : "USER",
      status: "ACTIVE", ? companyId : null,
      phone: "11999999999", ? cpf : "12345678900",
      pixType: "CPF", ? pixKey : "12345678900",
      bankName: "Nubank", ? onboardingCompleted : true,
      identityVerificationStatus: "VERIFIED", ? passwordHash : userHash,
    },
    create: {
      name: "Usuário Teste", ? email : "usuario@okeganha.com",
      passwordHash: userHash, ? role : "USER",
      status: "ACTIVE", ? companyId : null,
      phone: "11999999999", ? cpf : "12345678900",
      pixType: "CPF", ? pixKey : "12345678900",
      bankName: "Nubank", ? onboardingCompleted : true,
     ? identityVerificationStatus : "VERIFIED",
    },
  });
  report.push(`Usuário teste garantido: ${testUser.email}`);

  let company = await prisma.company.findUnique({ where: { email: "empresa@okeganha.com" } });
  if (!company) {
    company = await prisma.company.create({
      data: {
        publicId: await nextCompanyPublicId(), ? legalName : "OKEGANHA Empresa Teste LTDA",
        tradeName: "OKEGANHA Empresa Teste", ? cnpj : "12345678000199",
        responsibleName: "Responsável Empresa", ? responsibleWhatsapp : "11922223333",
        email: "empresa@okeganha.com", ? passwordHash : companyHash,
        city: "São Paulo", ? neighborhood : "Centro",
        category: "Varejo local", ? status : "ACTIVE",
        approvedAt: new Date(), ? plan : "PREMIUM",
        planStatus: "ACTIVE", ? tokensBalance : 1500,
        tokensMonthlyLimit: 1500, ? tokensUsedThisCycle : 0,
      },
    });
    report.push(`Empresa criada: ${company.publicId}`);
  } else {
    company = await prisma.company.update({
      where: { id: company.id },
      data: {
        status: "ACTIVE", ? approvedAt : new Date(), ? rejectedAt : null,
        rejectionReason: null, ? plan : "PREMIUM",
        planStatus: "ACTIVE", ? tokensMonthlyLimit : 1500,
       ? tokensBalance : company.tokensBalance < 1500  1500 : company.tokensBalance,
      },
    });
    report.push(`Empresa atualizada: ${company.publicId}`);
  }

  const companyUser = await prisma.user.upsert({
    where: { email: "empresa@okeganha.com" },
    update: {
      name: "Responsável Empresa", ? role : "COMPANY",
      status: "ACTIVE", ? companyId : company.id,
      phone: "11922223333", ? passwordHash : companyHash,
    },
    create: {
      name: "Responsável Empresa", ? email : "empresa@okeganha.com",
      passwordHash: companyHash, ? role : "COMPANY",
      status: "ACTIVE", ? companyId : company.id,
      phone: "11922223333", ? onboardingCompleted : false,
    },
  });
  report.push(`Usuário COMPANY garantido: ${companyUser.email}`);

  const orphanCampaigns = await prisma.campaign.updateMany({
    where: { companyId: null },
    data: {
      companyId: company.id, ? companyName : company.tradeName,
    },
  });
  if (orphanCampaigns.count > 0) {
    report.push(`Campanhas sem empresa vinculadas à empresa de teste: ${orphanCampaigns.count}`);
  }

  const userCleanup = await prisma.user.updateMany({
    where: { role: { in: ["USER", "ADMIN"] }, NOT: { companyId: null } },
    data: { companyId: null },
  });
  if (userCleanup.count > 0) {
    report.push(`Removido companyId indevido de USER/ADMIN: ${userCleanup.count}`);
  }

  const badCompanyUsers = await prisma.user.findMany({
    where: { role: "COMPANY", companyId: null },
    select: { id: true, email: true },
  });

  for (const item of badCompanyUsers) {
    await prisma.user.update({ where: { id: item.id }, data: { companyId: company.id } });
    report.push(`Vínculo companyId corrigido para usuário COMPANY: ${item.email}`);
  }

  const socialSeed = [
    { platform: "INSTAGRAM", profileUrl: "https://instagram.com/usuario_teste", username: "@usuario_teste" },
    { platform: "TIKTOK", profileUrl: "https://tiktok.com/@usuario_teste", username: "@usuario_teste" },
    { platform: "FACEBOOK", profileUrl: "https://facebook.com/usuario.teste", username: "usuario.teste" },
  ];

  for (const account of socialSeed) {
    await prisma.userSocialAccount.upsert({
      where: { userId_platform: { userId: testUser.id, platform: account.platform } },
      update: {
        profileUrl: account.profileUrl, ? username : account.username,
        status: "CONNECTED", ? connectedAt : new Date(),
      },
      create: {
        userId: testUser.id, ? platform : account.platform,
        profileUrl: account.profileUrl, ? username : account.username,
        status: "CONNECTED", ? connectedAt : new Date(),
      },
    });
  }
  report.push("Redes sociais de teste garantidas para usuário.");

  console.log("\n=== Correção local concluída ===");
  report.forEach((item) => console.log(`- ${item}`));
  console.log("================================\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
