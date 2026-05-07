const { PrismaClient, Prisma } = require("@prisma/client");

const prisma = new PrismaClient();

const DRY_RUN = process.env.APPLY_BACKFILL !== "true";
const EPOCH = new Date(0);

const checks = [
  ["AdminAuditLog", "metadata", 'SELECT COUNT(*)::int AS c FROM "AdminAuditLog" WHERE "metadata" IS NULL'],
  ["Campaign", "submittedForReviewAt", 'SELECT COUNT(*)::int AS c FROM "Campaign" WHERE "submittedForReviewAt" IS NULL'],
  ["Campaign", "reviewedAt", 'SELECT COUNT(*)::int AS c FROM "Campaign" WHERE "reviewedAt" IS NULL'],
  ["Company", "phone", 'SELECT COUNT(*)::int AS c FROM "Company" WHERE "phone" IS NULL'],
  ["Company", "googleBusinessUrl", 'SELECT COUNT(*)::int AS c FROM "Company" WHERE "googleBusinessUrl" IS NULL'],
  ["Company", "websiteUrl", 'SELECT COUNT(*)::int AS c FROM "Company" WHERE "websiteUrl" IS NULL'],
  ["Company", "rejectedAt", 'SELECT COUNT(*)::int AS c FROM "Company" WHERE "rejectedAt" IS NULL'],
  ["Company", "rejectionReason", 'SELECT COUNT(*)::int AS c FROM "Company" WHERE "rejectionReason" IS NULL'],
  ["CompanyTokenLedger", "referenceId", 'SELECT COUNT(*)::int AS c FROM "CompanyTokenLedger" WHERE "referenceId" IS NULL'],
  ["Task", "requiredWatchSeconds", 'SELECT COUNT(*)::int AS c FROM "Task" WHERE "requiredWatchSeconds" IS NULL'],
  ["TaskSubmission", "rejectionReason", 'SELECT COUNT(*)::int AS c FROM "TaskSubmission" WHERE "rejectionReason" IS NULL'],
  ["TaskSubmission", "reviewedAt", 'SELECT COUNT(*)::int AS c FROM "TaskSubmission" WHERE "reviewedAt" IS NULL'],
  ["User", "passwordHash", 'SELECT COUNT(*)::int AS c FROM "User" WHERE "passwordHash" IS NULL'],
  ["User", "phone", 'SELECT COUNT(*)::int AS c FROM "User" WHERE "phone" IS NULL'],
  ["WithdrawalRequest", "reviewedAt", 'SELECT COUNT(*)::int AS c FROM "WithdrawalRequest" WHERE "reviewedAt" IS NULL'],
  ["WithdrawalRequest", "paidAt", 'SELECT COUNT(*)::int AS c FROM "WithdrawalRequest" WHERE "paidAt" IS NULL'],
  ["WithdrawalRequest", "rejectionReason", 'SELECT COUNT(*)::int AS c FROM "WithdrawalRequest" WHERE "rejectionReason" IS NULL'],
  ["UserActivityLog", "sessionId", 'SELECT COUNT(*)::int AS c FROM "UserActivityLog" WHERE "sessionId" IS NULL'],
  ["UserActivityLog", "deviceId", 'SELECT COUNT(*)::int AS c FROM "UserActivityLog" WHERE "deviceId" IS NULL'],
  ["UserActivityLog", "campaignId", 'SELECT COUNT(*)::int AS c FROM "UserActivityLog" WHERE "campaignId" IS NULL'],
  ["UserActivityLog", "taskId", 'SELECT COUNT(*)::int AS c FROM "UserActivityLog" WHERE "taskId" IS NULL'],
  ["UserActivityLog", "interactionType", 'SELECT COUNT(*)::int AS c FROM "UserActivityLog" WHERE "interactionType" IS NULL'],
  ["UserActivityLog", "durationSeconds", 'SELECT COUNT(*)::int AS c FROM "UserActivityLog" WHERE "durationSeconds" IS NULL'],
  ["UserActivityLog", "focusLossCount", 'SELECT COUNT(*)::int AS c FROM "UserActivityLog" WHERE "focusLossCount" IS NULL'],
  ["UserActivityLog", "ipAddress", 'SELECT COUNT(*)::int AS c FROM "UserActivityLog" WHERE "ipAddress" IS NULL'],
  ["UserActivityLog", "userAgent", 'SELECT COUNT(*)::int AS c FROM "UserActivityLog" WHERE "userAgent" IS NULL'],
];

async function collectCounts() {
  const out = [];
  for (const [table, column, query] of checks) {
    const res = await prisma.$queryRawUnsafe(query);
    out.push({ table, column, count: Number(res[0]?.c ?? 0) });
  }
  return out;
}

function printCounts(title, rows) {
  console.log(`\n=== ${title} ===`);
  for (const r of rows) {
    console.log(`${r.table}.${r.column}: ${r.count}`);
  }
}

async function applyBackfill() {
  await prisma.$transaction(async (tx) => {
    const fallbackCampaign = await tx.campaign.findFirst({ orderBy: { createdAt: "desc" }, select: { id: true } });
    const fallbackTask = await tx.task.findFirst({ orderBy: { createdAt: "desc" }, select: { id: true } });
    if (!fallbackCampaign || !fallbackTask) {
      throw new Error("Backfill requires at least one Campaign and one Task to repair UserActivityLog FKs.");
    }

    const usersWithNullSession = await tx.$queryRawUnsafe(
      'SELECT DISTINCT "userId" FROM "UserActivityLog" WHERE "sessionId" IS NULL'
    );
    for (const row of usersWithNullSession) {
      const existing = await tx.taskSession.findFirst({
        where: { userId: row.userId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });
      if (!existing) {
        await tx.taskSession.create({
          data: {
            userId: row.userId,
            taskId: fallbackTask.id,
            campaignId: fallbackCampaign.id,
            requiredDuration: 0,
            activeDuration: 0,
            lastHeartbeat: EPOCH,
            focusLossCount: 0,
            isCompleted: true,
            startedAt: EPOCH,
          },
        });
      }
    }

    const usersWithNullDevice = await tx.$queryRawUnsafe(
      'SELECT DISTINCT "userId" FROM "UserActivityLog" WHERE "deviceId" IS NULL'
    );
    for (const row of usersWithNullDevice) {
      const existing = await tx.userDevice.findFirst({
        where: { userId: row.userId },
        orderBy: { lastSeen: "desc" },
        select: { id: true },
      });
      if (!existing) {
        await tx.userDevice.create({
          data: {
            userId: row.userId,
            fingerprintHash: `backfill-${row.userId}`,
            userAgent: "backfill",
            ipAddress: "0.0.0.0",
          },
        });
      }
    }

    await tx.$executeRawUnsafe('UPDATE "AdminAuditLog" SET "metadata" = $1::jsonb WHERE "metadata" IS NULL', "{}");
    await tx.$executeRawUnsafe('UPDATE "Campaign" SET "submittedForReviewAt" = $1 WHERE "submittedForReviewAt" IS NULL', EPOCH);
    await tx.$executeRawUnsafe('UPDATE "Campaign" SET "reviewedAt" = $1 WHERE "reviewedAt" IS NULL', EPOCH);

    await tx.$executeRawUnsafe('UPDATE "Company" SET "phone" = $1 WHERE "phone" IS NULL', "");
    await tx.$executeRawUnsafe('UPDATE "Company" SET "googleBusinessUrl" = $1 WHERE "googleBusinessUrl" IS NULL', "");
    await tx.$executeRawUnsafe('UPDATE "Company" SET "websiteUrl" = $1 WHERE "websiteUrl" IS NULL', "");
    await tx.$executeRawUnsafe('UPDATE "Company" SET "rejectedAt" = $1 WHERE "rejectedAt" IS NULL', EPOCH);
    await tx.$executeRawUnsafe('UPDATE "Company" SET "rejectionReason" = $1 WHERE "rejectionReason" IS NULL', "");

    await tx.$executeRawUnsafe('UPDATE "CompanyTokenLedger" SET "referenceId" = $1 WHERE "referenceId" IS NULL', "");

    await tx.$executeRawUnsafe('UPDATE "Task" SET "requiredWatchSeconds" = 0 WHERE "requiredWatchSeconds" IS NULL');

    await tx.$executeRawUnsafe('UPDATE "TaskSubmission" SET "rejectionReason" = $1 WHERE "rejectionReason" IS NULL', "");
    await tx.$executeRawUnsafe('UPDATE "TaskSubmission" SET "reviewedAt" = $1 WHERE "reviewedAt" IS NULL', EPOCH);
    await tx.$executeRawUnsafe('UPDATE "User" SET "passwordHash" = $1 WHERE "passwordHash" IS NULL', "");
    await tx.$executeRawUnsafe('UPDATE "User" SET "phone" = $1 WHERE "phone" IS NULL', "");

    await tx.$executeRawUnsafe('UPDATE "WithdrawalRequest" SET "reviewedAt" = $1 WHERE "reviewedAt" IS NULL', EPOCH);
    await tx.$executeRawUnsafe('UPDATE "WithdrawalRequest" SET "paidAt" = $1 WHERE "paidAt" IS NULL', EPOCH);
    await tx.$executeRawUnsafe('UPDATE "WithdrawalRequest" SET "rejectionReason" = $1 WHERE "rejectionReason" IS NULL', "");

    await tx.$executeRawUnsafe(`
      UPDATE "UserActivityLog" ual
      SET "sessionId" = ts.id
      FROM "TaskSession" ts
      WHERE ual."sessionId" IS NULL AND ts."userId" = ual."userId"
    `);
    await tx.$executeRawUnsafe(`
      UPDATE "UserActivityLog"
      SET "sessionId" = (SELECT id FROM "TaskSession" ORDER BY "createdAt" DESC LIMIT 1)
      WHERE "sessionId" IS NULL
    `);
    await tx.$executeRawUnsafe(`
      UPDATE "UserActivityLog" ual
      SET "deviceId" = ud.id
      FROM "UserDevice" ud
      WHERE ual."deviceId" IS NULL AND ud."userId" = ual."userId"
    `);
    await tx.$executeRawUnsafe(`
      UPDATE "UserActivityLog"
      SET "deviceId" = (SELECT id FROM "UserDevice" ORDER BY "lastSeen" DESC LIMIT 1)
      WHERE "deviceId" IS NULL
    `);
    await tx.$executeRawUnsafe(`
      UPDATE "UserActivityLog" ual
      SET "campaignId" = ts."campaignId"
      FROM "TaskSession" ts
      WHERE ual."campaignId" IS NULL AND ts.id = ual."sessionId"
    `);
    await tx.$executeRawUnsafe(`
      UPDATE "UserActivityLog"
      SET "campaignId" = (SELECT id FROM "Campaign" ORDER BY "createdAt" DESC LIMIT 1)
      WHERE "campaignId" IS NULL
    `);
    await tx.$executeRawUnsafe(`
      UPDATE "UserActivityLog" ual
      SET "taskId" = ts."taskId"
      FROM "TaskSession" ts
      WHERE ual."taskId" IS NULL AND ts.id = ual."sessionId"
    `);
    await tx.$executeRawUnsafe(`
      UPDATE "UserActivityLog"
      SET "taskId" = (SELECT id FROM "Task" ORDER BY "createdAt" DESC LIMIT 1)
      WHERE "taskId" IS NULL
    `);
    await tx.$executeRawUnsafe('UPDATE "UserActivityLog" SET "interactionType" = $1 WHERE "interactionType" IS NULL', "");
    await tx.$executeRawUnsafe('UPDATE "UserActivityLog" SET "durationSeconds" = 0 WHERE "durationSeconds" IS NULL');
    await tx.$executeRawUnsafe('UPDATE "UserActivityLog" SET "focusLossCount" = 0 WHERE "focusLossCount" IS NULL');
    await tx.$executeRawUnsafe('UPDATE "UserActivityLog" SET "ipAddress" = $1 WHERE "ipAddress" IS NULL', "");
    await tx.$executeRawUnsafe('UPDATE "UserActivityLog" SET "userAgent" = $1 WHERE "userAgent" IS NULL', "");
  });
}

async function main() {
  console.log(`[backfill-schema-drift] mode=${DRY_RUN ? "DRY_RUN" : "APPLY"}`);
  if (DRY_RUN) {
    console.log("Set APPLY_BACKFILL=true to apply changes.");
  }

  const before = await collectCounts();
  printCounts("BEFORE", before);

  if (!DRY_RUN) {
    await applyBackfill();
  }

  const after = await collectCounts();
  printCounts(DRY_RUN ? "AFTER (simulated, no changes applied)" : "AFTER", after);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
