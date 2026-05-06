import { z } from "zod";
import { BANK_OPTIONS } from "@/lib/banks";

const onlyDigits = (value: string) => value.replace(/\D/g, "");
const cpfSchema = z
  .string()
  .min(11, "CPF inválido")
  .transform(onlyDigits)
  .refine((value) => value.length === 11, "CPF inválido");

export const registerSchema = z.object({
  name: z.string().min(3, "Nome precisa ter ao menos 3 caracteres"),
  email: z.string().email("Email inválido").toLowerCase(),
  password: z
    .string()
    .min(8, "Senha precisa ter ao menos 8 caracteres")
    .regex(/[A-Z]/, "Senha precisa ter ao menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha precisa ter ao menos uma letra minúscula")
    .regex(/[0-9]/, "Senha precisa ter ao menos um número"),
  phone: z.string().min(10, "Telefone inválido"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido").toLowerCase(), password: z.string().min(1, "Informe a senha"),
});

export const profileSchema = z.object({
  phone: z.string().min(10, "Telefone inválido"), pixKey: z.string().min(4, "Chave Pix inválida"),
});

export const completeOnboardingSchema = z.object({
  phone: z.string().min(10, "Telefone inválido"), cpf: cpfSchema,
  pixType: z.literal("CPF"), pixKey: cpfSchema, bankName: z.enum(BANK_OPTIONS),
}).superRefine((value, ctx) => {
  if (value.pixKey !== value.cpf) {
    ctx.addIssue({
      path: ["pixKey"], code: z.ZodIssueCode.custom, message: "Para tipo CPF, a chave Pix deve ser o mesmo CPF informado",
    });
  }
});

export const taskProofSchema = z.object({
  taskId: z.string().min(1), proofText: z.string().trim().min(12, "Descreva melhor sua comprovação"), proofImageUrl: z.string().url("Informe uma URL válida").optional().or(z.literal("")),
});

export const withdrawalSchema = z.object({
  amount: z.coerce.number().positive(), pixKey: z.string().min(4, "Chave Pix inválida"),
});

export const campaignFiltersSchema = z.object({
  city: z.string().optional(), category: z.string().optional(), sort: z.enum(["highest_reward", "default"]).optional(),
});

export const userSocialAccountSchema = z.object({
  platform: z.enum(["INSTAGRAM", "TIKTOK", "FACEBOOK", "GOOGLE", "YOUTUBE", "OTHER"]), profileUrl: z.string().trim().url("Informe uma URL válida."), username: z.string().trim().max(60).optional(),
});

export const startTaskSessionSchema = z.object({
  taskId: z.string().min(1),
});

export const heartbeatTaskSessionSchema = z.object({
  sessionId: z.string().min(1), isVisible: z.boolean(), isFocused: z.boolean(), focusLossIncrement: z.number().int().min(0).max(1).default(0), deviceFingerprint: z
    .object({
      timezone: z.string().optional(), language: z.string().optional(), platform: z.string().optional(), screen: z.string().optional(), colorDepth: z.number().optional(), hardwareConcurrency: z.number().optional(), maxTouchPoints: z.number().optional(), pluginsLength: z.number().optional(), canvasHash: z.string().optional(), webglHash: z.string().optional(), webdriver: z.boolean().optional(), clickIntervalMs: z.number().optional(),
    })
    .optional(),
});

export const finishTaskSessionSchema = z.object({
  sessionId: z.string().min(1),
});
