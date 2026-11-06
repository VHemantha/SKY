import "server-only";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Prefer an explicit DATABASE_URL; otherwise use the site's Netlify Database.
const datasourceUrl = process.env.DATABASE_URL || process.env.NETLIFY_DB_URL;
// The schema declares directUrl (used only by migrations); default it so the client never trips on it.
if (datasourceUrl && !process.env.DIRECT_URL) process.env.DIRECT_URL = datasourceUrl;

export const db =
  globalForPrisma.prisma ?? new PrismaClient(datasourceUrl ? { datasourceUrl } : undefined);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
