"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { signIn, signOut } from "@/auth";
import { logUserActivity } from "@/lib/anti-fraud";
import { clearUserSession, comparePassword, createUserSession, getCurrentUser, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDatabaseUrlErrorMessage, hasDatabaseUrl, isDatabaseUrlMissingError } from "@/lib/env";
import { loginSchema, registerSchema } from "@/lib/validations";
import type { ActionState } from "@/types";

const BLOCKED_ACCOUNT_COOKIE = "okg_blocked_account";

export async function registerAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  if (!hasDatabaseUrl()) {
    return { ok: false, message: getDatabaseUrlErrorMessage() };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"), 
      email: formData.get("email"), 
      password: formData.get("password"), 
      phone: formData.get("phone"), 
      cpf: formData.get("cpf"), 
      pixType: formData.get("pixType"), 
      pixKey: formData.get("pixKey"), 
      bankName: formData.get("bankName"),
  });

  if (!parsed.success) {
    return {
      ok: false, 
      message: "Confira os dados do cadastro.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const exists = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (exists) {
      return { ok: false, message: "Este e-mail já está em uso." };
    }

    const cpfExists = await db.user.findUnique({ where: { cpf: parsed.data.cpf } });
    if (cpfExists) {
      return { ok: false, message: "Este CPF já está cadastrado." };
    }

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await db.user.create({
      data: {
        name: parsed.data.name, 
      email: parsed.data.email,
        passwordHash, 
      phone: parsed.data.phone,
        cpf: parsed.data.cpf, 
      pixType: parsed.data.pixType,
        pixKey: parsed.data.pixKey, 
      bankName: parsed.data.bankName,
        onboardingCompleted: true, 
      status: "ACTIVE",
        role: "USER",
      },
    });

    await createUserSession(user.id, user.email);
    const store = await cookies();
    store.delete(BLOCKED_ACCOUNT_COOKIE);
  } catch (error) {
    if (isDatabaseUrlMissingError(error)) {
      return { ok: false, message: getDatabaseUrlErrorMessage() };
    }
    throw error;
  }

  redirect("/usuario/dashboard");
}

export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  if (!hasDatabaseUrl()) {
    return { ok: false, message: getDatabaseUrlErrorMessage() };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"), 
      password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false, 
      message: "Credenciais inválidas.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const user = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) {
      return { ok: false, message: "E-mail ou senha incorretos." };
    }

    if (!user.passwordHash) {
      return { ok: false, message: "Esta conta usa login social. Entre com Google." };
    }

    const validPassword = await comparePassword(parsed.data.password, user.passwordHash);
    if (!validPassword) {
      return { ok: false, message: "E-mail ou senha incorretos." };
    }

    if (user.status !== "ACTIVE") {
      return { ok: false, message: "Sua conta não está ativa." };
    }

    await createUserSession(user.id, user.email);
    const store = await cookies();
    store.delete(BLOCKED_ACCOUNT_COOKIE);
    await logUserActivity(user.id, "LOGIN", { method: "email_password", role: user.role });

    if (user.role === "ADMIN") {
      redirect("/admin/dashboard");
    }

    if (user.role === "COMPANY") {
      const company = user.companyId ? await db.company.findUnique({
            where: { id: user.companyId },
            select: { status: true },
          })
        : null;

      if (company?.status === "ACTIVE") {
        redirect("/empresa/dashboard");
      }

      redirect("/empresa/status");
    }

    if (!user.onboardingCompleted) {
      redirect("/usuario/completar-cadastro");
    }
  } catch (error) {
    if (isDatabaseUrlMissingError(error)) {
      return { ok: false, message: getDatabaseUrlErrorMessage() };
    }
    throw error;
  }

  redirect("/usuario/dashboard");
}

export async function logoutAction() {
  const currentUser = await getCurrentUser();
  if (currentUser) {
    await logUserActivity(currentUser.id, "LOGOUT", { method: "manual" });
  }
  await clearUserSession();
  await signOut({ redirect: false });
  redirect("/login");
}

export async function googleSignInAction() {
  await signIn("google", { redirectTo: "/usuario/dashboard" });
}

export async function getCurrentUserAction() {
  const user = await getCurrentUser();
  if (!user) return null;

  return {
    id: user.id, 
      name: user.name,
    email: user.email, 
      phone: user.phone,
    cpf: user.cpf, 
      onboardingCompleted: user.onboardingCompleted,
    identityVerificationStatus: user.identityVerificationStatus, 
      pixKey: user.pixKey,
    pixType: user.pixType, 
      bankName: user.bankName,
    status: user.status, 
      role: user.role,
  };
}
