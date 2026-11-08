/* eslint-disable no-console */
/**
 * Provision or reset an administrator.
 *   npm run create-admin -- --email=you@example.com --password=secret
 * Or rely on ADMIN_EMAIL / ADMIN_INITIAL_PASSWORD in .env.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { hashPassword } from "../src/lib/auth/password.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

function arg(name: string): string | undefined {
  return process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
}

async function main() {
  const email = (arg("email") ?? process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const password = arg("password") ?? process.env.ADMIN_INITIAL_PASSWORD;
  if (!password || password.length < 8) {
    console.error("Provide --password=<min-8-chars> or set ADMIN_INITIAL_PASSWORD (>=8 chars).");
    process.exit(1);
  }
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    await prisma.admin.update({
      where: { id: existing.id },
      data: { passwordHash: await hashPassword(password) },
    });
    console.log(`Updated password for admin: ${email}`);
  } else {
    await prisma.admin.create({
      data: { email, passwordHash: await hashPassword(password), name: "Mukti" },
    });
    console.log(`Created admin: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
