import { WalletTransactionType } from "@prisma/client";

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatMoney(cents: number): string {
  return BRL.format(cents / 100);
}

export function parseMoneyToCents(input: string): number {
  const normalized = input.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const value = Number.parseFloat(normalized);
  if (Number.isNaN(value) || !Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}

export function walletSignedAmount(type: WalletTransactionType, amount: number): number {
  if (type === "CREDIT" || type === "ADJUSTMENT") return amount;
  return -Math.abs(amount);
}

