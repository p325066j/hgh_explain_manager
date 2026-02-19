import { PrismaClient } from "@prisma/client";
import { isAbsolute, resolve } from "node:path";

const ensureAbsoluteDatabaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url || !url.startsWith("file:")) return;
  const pathPart = url.slice("file:".length);
  const normalizedPath = isAbsolute(pathPart) ? pathPart : resolve(process.cwd(), pathPart);
  const normalizedUrl = `file:${normalizedPath.replace(/\\/g, "/")}`;
  if (normalizedUrl !== url) {
    process.env.DATABASE_URL = normalizedUrl;
  }
};

ensureAbsoluteDatabaseUrl();

// Next.js の開発時ホットリロード対策で PrismaClient をシングルトンに保持
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["warn", "error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
