/**
 * Seeds the database with the first admin user and starter content.
 * Safe to run more than once: existing records are left untouched.
 *
 *   npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { seedAdmin, seedContent } from "../src/lib/seed";

const db = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL || process.env.NETLIFY_DB_URL });

async function main() {
  if (await seedAdmin(db, process.env.ADMIN_EMAIL || "", process.env.ADMIN_PASSWORD || "")) {
    console.log("✔ Admin user created");
  }
  await seedContent(db);
  console.log("✔ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
