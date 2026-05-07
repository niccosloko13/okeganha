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
    await tx.adminAuditLog.updateMany({ where: { metadata: null }, data: { metadata: Prisma.JsonNull } });

    await tx.campaign.updateMany({ where: { submittedForReviewAt: null }, data: { submittedForReviewAt: EPOCH } });
    await tx.campaign.updateMany({ where: { reviewedAt: null }, data: { reviewedAt: EPOCH } });

    await tx.company.updateMany({ where: { phone: null }, data: { phone: "" } });
    await tx.company.updateMany({ where: { googleBusinessUrl: null }, data: { googleBusinessUrl: "" } });
    await tx.company.updateMany({ where: { websiteUrl: null }, data: { websiteUrl: "" } });
    await tx.company.updateMany({ where: { rejectedAt: null }, data: { rejectedAt: EPOCH } });
    await tx.company.updateMany({ where: { rejectionReason: null }, data: { rejectionReason: "" } });

    await tx.companyTokenLedger.updateMany({ where: { referenceId: null }, data: { referenceId: "" } });

    await tx.task.updateMany({ where: { requiredWatchSeconds: null }, data: { requiredWatchSeconds: 0 } });

    await tx.taskSubmission.updateMany({ where: { rejectionReason: null }, data: { rejectionReason: "" } });
    await tx.taskSubmission.updateMany({ where: { reviewedAt: null }, data: { reviewedAt: EPOCH } });

    await tx.withdrawalRequest.updateMany({ where: { reviewedAt: null }, data: { reviewedAt: EPOCH } });
    await tx.withdrawalRequest.updateMany({ where: { paidAt: null }, data: { paidAt: EPOCH } });
    await tx.withdrawalRequest.updateMany({ where: { rejectionReason: null }, data: { rejectionReason: "" } });

    await tx.userActivityLog.updateMany({ where: { sessionId: null }, data: { sessionId: "" } });
    await tx.userActivityLog.updateMany({ where: { deviceId: null }, data: { deviceId: "" } });
    await tx.userActivityLog.updateMany({ where: { campaignId: null }, data: { campaignId: "" } });
    await tx.userActivityLog.updateMany({ where: { taskId: null }, data: { taskId: "" } });
    await tx.userActivityLog.updateMany({ where: { interactionType: null }, data: { interactionType: "" } });
    await tx.userActivityLog.updateMany({ where: { durationSeconds: null }, data: { durationSeconds: 0 } });
    await tx.userActivityLog.updateMany({ where: { focusLossCount: null }, data: { focusLossCount: 0 } });
    await tx.userActivityLog.updateMany({ where: { ipAddress: null }, data: { ipAddress: "" } });
    await tx.userActivityLog.updateMany({ where: { userAgent: null }, data: { userAgent: "" } });
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
