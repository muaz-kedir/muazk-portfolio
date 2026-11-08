import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma 7 requires a driver adapter. We use the PostgreSQL adapter backed by
 * `pg`. The connection pool is created lazily by the adapter and only opened
 * on the first query, so importing this module does not require a live database.
 */
const globalForPrisma = globalThis as unknown as { __prisma?: PrismaClient };
let cachedPrisma: PrismaClient | undefined;

function getPrisma(): PrismaClient {
  if (cachedPrisma) return cachedPrisma;
  if (globalForPrisma.__prisma) return globalForPrisma.__prisma;

  const url =
    process.env.DATABASE_URL ||
    "postgresql://dummy:dummy@127.0.0.1:5432/dummy?sslmode=disable";
  const adapter = new PrismaPg({ connectionString: url });
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__prisma = client;
  }
  cachedPrisma = client;
  return client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const val = Reflect.get(client, prop);
    return typeof val === "function" ? val.bind(client) : val;
  },
});
