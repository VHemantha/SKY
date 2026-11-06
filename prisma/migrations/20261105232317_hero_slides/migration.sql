-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "siteName" TEXT NOT NULL DEFAULT 'Skylantic Holidays',
    "tagline" TEXT NOT NULL DEFAULT 'Wildlife safaris & tailor-made holidays in Sri Lanka',
    "heroTitle" TEXT NOT NULL DEFAULT 'Meet Sri Lanka''s wild side',
    "heroSubtitle" TEXT NOT NULL DEFAULT '',
    "heroImage" TEXT NOT NULL DEFAULT '/images/yala-leopard.jpg',
    "heroSlides" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "whatsapp" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "facebook" TEXT NOT NULL DEFAULT '',
    "instagram" TEXT NOT NULL DEFAULT '',
    "tripadvisor" TEXT NOT NULL DEFAULT '',
    "credentials" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_SiteSettings" ("address", "credentials", "email", "facebook", "heroImage", "heroSubtitle", "heroTitle", "id", "instagram", "phone", "siteName", "tagline", "tripadvisor", "whatsapp") SELECT "address", "credentials", "email", "facebook", "heroImage", "heroSubtitle", "heroTitle", "id", "instagram", "phone", "siteName", "tagline", "tripadvisor", "whatsapp" FROM "SiteSettings";
DROP TABLE "SiteSettings";
ALTER TABLE "new_SiteSettings" RENAME TO "SiteSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
