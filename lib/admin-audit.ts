import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

type AuditInput = {
  adminId: string;
  targetType: "USER" | "COMPANY" | "CAMPAIGN" | "SUBMISSION" | "WITHDRAWAL" | "TOKEN" | "SYSTEM";
  targetId: string;
  action: string;
  description: string;
  metadata?: Prisma.InputJsonValue;
};

export async function createAdminAuditLog(input: AuditInput): Promise<void> {
  await db.adminAuditLog.create({
    data: {
      adminId: input.adminId,
      targetType: input.targetType,
      targetId: input.targetId,
      action: input.action,
      description: input.description,
      metadata: input.metadata ?? undefined,
    },
  });
}
