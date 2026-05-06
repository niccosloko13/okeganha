export const DATABASE_URL_MISSING_ERROR = "DATABASE_URL_MISSING";
export const SESSION_SECRET_MISSING_ERROR = "SESSION_SECRET_MISSING";

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

export function getDatabaseUrlErrorMessage(): string {
  return "Configuração ausente: defina DATABASE_URL no arquivo .env antes de usar o app.";
}

export function isDatabaseUrlMissingError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.message.includes(DATABASE_URL_MISSING_ERROR) || error.message.includes("Environment variable not found: DATABASE_URL");
}

export function getRequiredSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim() ?? "";
  if (!secret) {
    throw new Error("SESSION_SECRET obrigatório. Configure no arquivo .env.");
  }
  return secret;
}
