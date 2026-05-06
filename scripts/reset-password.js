const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const [, , emailArg, newPassword] = process.argv;
  const email = (emailArg || "").trim().toLowerCase();

  if (!email || !newPassword) {
    console.error("Uso: node scripts/reset-password.js email@teste.com NovaSenha123");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (!user) {
    console.error(`Usuário não encontrado para o e-mail: ${email}`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  console.log(`Senha atualizada com sucesso para ${user.email}.`);
}

main()
  .catch((error) => {
    console.error("Erro ao resetar senha:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
