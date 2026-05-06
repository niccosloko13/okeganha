export const BANK_OPTIONS = [
  "Nubank",
  "Banco do Brasil",
  "Caixa Economica Federal",
  "Itau",
  "Bradesco",
  "Santander",
  "Inter",
  "C6 Bank",
  "Mercado Pago",
  "PicPay",
  "PagBank",
  "Banco Pan",
  "Sicredi",
  "Sicoob",
  "BTG Pactual",
  "Neon",
  "Original",
  "Outro",
] as const;

export type BankName = (typeof BANK_OPTIONS)[number];
