// Prisma client — only available once `prisma generate` has been run against a live DB.
// Pages using mock data do NOT import this file.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prisma: any;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("@/generated/prisma");
  const globalForPrisma = globalThis as unknown as { prisma: typeof prisma };
  prisma = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
} catch {
  // Prisma client not generated yet — will be available after `prisma generate`
}

export { prisma };
