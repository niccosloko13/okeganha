import crypto from "crypto";

export type DeviceFingerprintInput = {
  timezone: string;
  language: string;
  platform: string;
  screen: string;
  colorDepth: number;
  hardwareConcurrency: number;
  maxTouchPoints: number;
  pluginsLength: number;
  canvasHash: string;
  webglHash: string;
  webdriver: boolean;
};

export function normalizeFingerprint(input: DeviceFingerprintInput) {
  return {
    timezone: input.timezone ?? "",
    language: input.language ?? "",
    platform: input.platform ?? "",
    screen: input.screen ?? "",
    colorDepth: input.colorDepth ?? 0,
    hardwareConcurrency: input.hardwareConcurrency ?? 0,
    maxTouchPoints: input.maxTouchPoints ?? 0,
    pluginsLength: input.pluginsLength ?? 0,
    canvasHash: input.canvasHash ?? "",
    webglHash: input.webglHash ?? "",
    webdriver: Boolean(input.webdriver),
  };
}

export function hashDeviceFingerprint(input: DeviceFingerprintInput): string {
  const normalized = normalizeFingerprint(input);
  return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}
