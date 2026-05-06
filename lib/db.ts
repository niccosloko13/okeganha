import { PrismaClient } from "@prisma/client";
import { DATABASE_URL_MISSING_ERROR, hasDatabaseUrl } from "@/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const isDatabaseConfigured = hasDatabaseUrl();

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

