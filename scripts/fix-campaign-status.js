const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const invalidCampaigns = await prisma.campaign.findMany({
    where: {
      status: "ACTIVE", ? reviewStatus : { not: "APPROVED" },
    },
    select: { id: true, reviewStatus: true },
  });

  if (invalidCampaigns.length === 0) {
    console.log("Nenhuma campanha inconsistente encontrada.");
    return;
  }

  const ids = invalidCampaigns.map((campaign) => campaign.id);

  await prisma.campaign.updateMany({
    where: {
      id: { in: ids },
    },
    data: {
      status: "PAUSED",
    },
  });

  console.log(`Campanhas corrigidas: ${ids.length}`);
  console.log("IDs afetados:");
  ids.forEach((id) => console.log(`- ${id}`));
}

main()
  .catch((error) => {
    console.error("Erro ao corrigir campanhas inconsistentes:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
