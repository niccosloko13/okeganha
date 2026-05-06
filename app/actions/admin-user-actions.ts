"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAdminAuditLog } from "@/lib/admin-audit";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const userIdSchema = z.object({ userId: z.string().min(1) });

const adjustWalletSchema = z.object({
  userId: z.string().min(1), direction: z.enum(["CREDIT", "DEBIT"]), amount: z.coerce.number().int().positive(), reason: z.string().trim().min(5),
});

const updateSensitiveSchema = z.object({
  userId: z.string().min(1), phone: z.string().trim().min(8), pixKey: z.string().trim().min(5), bankName: z.string().trim().min(2),
});

const revealSchema = z.object({
  userId: z.string().min(1), field: z.enum(["cpf", "pixKey"]),
});

const addNoteSchema = z.object({
  userId: z.string().min(1), note: z.string().trim().min(5),
});

export async function getAdminUsers() {
  await requireAdmin();
  return db.user.findMany({
    include: {
      taskSubmissions: { select: { status: true, submittedAt: true, proofText: true } },
      withdrawals: { select: { status: true, requestedAt: true } },
      walletTxs: { select: { type: true, amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminUserDetail(userId: string) {
  await requireAdmin();
  return db.user.findUnique({
    where: { id: userId },
    include: {
      taskSubmissions: {
        include: { campaign: { select: { title: true, companyName: true } }, task: { select: { title: true } } },
        orderBy: { submittedAt: "desc" },
        take: 100,
      },
      walletTxs: { orderBy: { createdAt: "desc" }, take: 100 },
      withdrawals: { orderBy: { requestedAt: "desc" }, take: 100 },
      internalNotes: { include: { admin: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
}

export async function markUserVerified(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = userIdSchema.safeParse({ userId: formData.get("userId") });
  if (!parsed.success) return;

  await db.user.update({
    where: { id: parsed.data.userId },
    data: { identityVerificationStatus: "VERIFIED" },
  });

  await createAdminAuditLog({
    adminId: admin.id, targetType: "USER",
    targetId: parsed.data.userId, action: "MARK_USER_VERIFIED",
    description: "Admin marcou usuário como verificado.",
  });

  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${parsed.data.userId}`);
}

export async function adjustUserWallet(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = adjustWalletSchema.safeParse({
    userId: formData.get("userId"), direction: formData.get("direction"), amount: formData.get("amount"), reason: formData.get("reason"),
  });

  if (!parsed.success) return;

  const signedAmount = parsed.data.direction === "DEBIT" ? -parsed.data.amount : parsed.data.amount;
  await db.walletTransaction.create({
    data: {
      userId: parsed.data.userId, type: "ADJUSTMENT",
      amount: signedAmount, description: `Ajuste manual: ${parsed.data.reason}`,
      referenceId: `admin-adjustment-${admin.id}`,
    },
  });

  await createAdminAuditLog({
    adminId: admin.id, targetType: "USER",
    targetId: parsed.data.userId, action: "ADJUST_USER_WALLET",
    description: `Ajuste manual de saldo (${parsed.data.direction}).`,
    metadata: { amount: parsed.data.amount, reason: parsed.data.reason },
  });

  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${parsed.data.userId}`);
  revalidatePath("/usuario/carteira");
}

export async function updateUserSensitiveData(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = updateSensitiveSchema.safeParse({
    userId: formData.get("userId"), phone: formData.get("phone"), pixKey: formData.get("pixKey"), bankName: formData.get("bankName"),
  });
  if (!parsed.success) return;

  await db.user.update({
    where: { id: parsed.data.userId },
    data: {
      phone: parsed.data.phone, pixKey: parsed.data.pixKey, bankName: parsed.data.bankName,
    },
  });

  await createAdminAuditLog({
    adminId: admin.id, targetType: "USER",
    targetId: parsed.data.userId, action: "UPDATE_USER_SENSITIVE_DATA",
    description: "Admin atualizou telefone/Pix/banco do usuário.",
  });

  revalidatePath(`/admin/usuarios/${parsed.data.userId}`);
  revalidatePath("/usuario/perfil");
}

export async function revealSensitiveField(formData: FormData): Promise<{ value: string }> {
  const admin = await requireAdmin();
  const parsed = revealSchema.safeParse({
    userId: formData.get("userId"), field: formData.get("field"),
  });
  if (!parsed.success) return { value: "Indisponível" };

  const user = await db.user.findUnique({
    where: { id: parsed.data.userId },
    select: { cpf: true, pixKey: true },
  });
  if (!user) return { value: "Indisponível" };

  await createAdminAuditLog({
    adminId: admin.id, targetType: "USER",
    targetId: parsed.data.userId, action: "REVEAL_SENSITIVE_FIELD",
    description: `Admin revelou dado sensível (${parsed.data.field}).`,
    metadata: { field: parsed.data.field },
  });

  return { value: parsed.data.field === "cpf" ? user.cpf ?? "-" : user.pixKey ?? "-" };
}

export async function revealSensitiveFieldAction(
  _state: { value: string },
  formData: FormData,
): Promise<{ value: string }> {
  return revealSensitiveField(formData);
}

export async function addInternalUserNote(formData: FormData) {
  const admin = await requireAdmin();
  const parsed = addNoteSchema.safeParse({
    userId: formData.get("userId"), note: formData.get("note"),
  });
  if (!parsed.success) return;

  await db.userInternalNote.create({
    data: {
      userId: parsed.data.userId, adminId: admin.id, note: parsed.data.note,
    },
  });

  await createAdminAuditLog({
    adminId: admin.id, targetType: "USER",
    targetId: parsed.data.userId, action: "ADD_INTERNAL_NOTE",
    description: "Admin adicionou observação interna ao usuário.",
  });

  revalidatePath(`/admin/usuarios/${parsed.data.userId}`);
}
