import { PrismaClient } from "@prisma/client";
import { DATABASE_URL_MISSING_ERROR, hasDatabaseUrl } from "@/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const isDatabaseConfigured = hasDatabaseUrl();
const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
const databaseHost = (() => {
  if (!databaseUrl) return "missing";
  try {
    return new URL(databaseUrl).host;
  } catch {
    return "invalid";
  }
})();

if (process.env.NODE_ENV === "production") {
  console.log(`[db] DATABASE_HOST=${databaseHost}`);
}

if (process.env.VERCEL === "1" && (databaseHost.startsWith("localhost") || databaseHost.startsWith("127.0.0.1"))) {
  throw new Error("DATABASE_URL inválida para produção: host local detectado.");
}

const missingDatabaseProxy = new Proxy({} as PrismaClient, {
  get() {
    throw new Error(`${DATABASE_URL_MISSING_ERROR}: configure DATABASE_URL no arquivo .env`);
  },
});

const prismaClient = isDatabaseConfigured ? new PrismaClient() : missingDatabaseProxy;

export const db = global.prisma ?? prismaClient;

if (process.env.NODE_ENV !== "production" && isDatabaseConfigured) {
  global.prisma = db;
}

export { isDatabaseConfigured };

