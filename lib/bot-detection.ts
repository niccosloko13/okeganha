import type { DeviceFingerprintInput } from "@/lib/device-fingerprint";

export type BotDetectionInput = DeviceFingerprintInput & {
  userAgent: string;
  clickIntervalMs: number;
};

export type BotDetectionResult = {
  score: number;
  reasons: string[];
  suspicious: boolean;
};

export function detectBotSignals(input: BotDetectionInput): BotDetectionResult {
  let score = 0;
  const reasons: string[] = [];

  if (input.webdriver) {
    score += 45;
    reasons.push("navigator.webdriver ativo");
  }

  if ((input.pluginsLength ?? 0) === 0) {
    score += 15;
    reasons.push("Sem plugins no navegador");
  }

  const ua = (input.userAgent ?? "").toLowerCase();
  if (ua.includes("headless") || ua.includes("playwright") || ua.includes("puppeteer")) {
    score += 35;
    reasons.push("User-Agent suspeito");
  }

  if (!input.timezone || input.timezone.length < 3) {
    score += 10;
    reasons.push("Timezone inválido");
  }

  if (!input.canvasHash || !input.webglHash) {
    score += 10;
    reasons.push("Fingerprint gráfico incompleto");
  }

  if ((input.clickIntervalMs ?? 9999) < 80) {
    score += 20;
    reasons.push("Padrão de clique não humano");
  }

  return {
    score,
    reasons,
    suspicious: score >= 50,
  };
}
