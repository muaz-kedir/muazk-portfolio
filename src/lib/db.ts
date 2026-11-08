import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 requires a driver adapter. We use the PostgreSQL adapter backed by
 * `pg`. The connection pool is created lazily by the adapter and only opened
 * on the first query, so importing this module does not require a live database.
 */
function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not configured. Copy .env.example to .env and set DATABASE_URL."
    );
  }
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };

export const prisma: PrismaClient = globalForPrisma.__prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
