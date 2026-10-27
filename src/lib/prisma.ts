import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // `prisma dev` (PGlite) memutus koneksi bila terlalu banyak koneksi paralel,
  // jadi ukuran pool bisa dibatasi lewat DATABASE_POOL_MAX. Kosong = default pg (10).
  const max = Number(process.env.DATABASE_POOL_MAX) || undefined;
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ...(max && { max, idleTimeoutMillis: 1000 }),
  });

  return new PrismaClient({ adapter });
}

// Satu instance saja selama hot reload di mode development.
export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
