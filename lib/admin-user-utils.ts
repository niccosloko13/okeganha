export function maskCpf(cpf: string | null): string {
  if (!cpf) return "-";
  const clean = cpf.replace(/\D/g, "");
  if (clean.length < 4) return "***";
  return `***.***.***-${clean.slice(-2)}`;
}

export function maskPix(pix: string | null): string {
  if (!pix) return "-";
  if (pix.length <= 4) return "***";
  return `${pix.slice(0, 3)}***${pix.slice(-2)}`;
}

export function computeUserBalance(txs: Array<{ type: string; amount: number }>): number {
  return txs.reduce((acc, tx) => {
    if (tx.type === "CREDIT" || tx.type === "ADJUSTMENT") return acc + tx.amount;
    if (tx.type === "DEBIT" || tx.type === "WITHDRAWAL_HOLD" || tx.type === "WITHDRAWAL_PAID") return acc - Math.abs(tx.amount);
    return acc;
  }, 0);
}

export function calculateRisk(input: {
  pending: number;
  rejected: number;
  blocked: boolean;
  incomplete: boolean;
  sameDayCount: number;
  recentWithdrawals: number;
  shortProofs: number;
}): { level: "LOW" | "MEDIUM" | "HIGH"; reasons: string[] } {
  const reasons: string[] = [];
  if (input.blocked) reasons.push("Conta bloqueada");
  if (input.incomplete) reasons.push("Cadastro incompleto");
  if (input.pending >= 8) reasons.push("Muitas tarefas pendentes");
  if (input.rejected >= 3) reasons.push("Muitas reprovações");
  if (input.sameDayCount >= 6) reasons.push("Muitas tarefas no mesmo dia");
  if (input.recentWithdrawals >= 2) reasons.push("Múltiplos saques recentes");
  if (input.shortProofs >= 3) reasons.push("Provas curtas recorrentes");

  if (input.blocked || input.rejected >= 6 || input.sameDayCount >= 10) return { level: "HIGH", reasons };
  if (input.pending >= 5 || input.rejected >= 3 || input.incomplete || input.recentWithdrawals >= 1) { return { level: "MEDIUM", reasons };
  }
  return { level: "LOW", reasons };
}
