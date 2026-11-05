# Skylantic Holidays — website & admin panel

Travel agency website for Skylantic Holidays, Sri Lanka: wildlife safaris and tours, with an admin panel to manage tours, destinations, enquiries, FAQs, page text and contact details.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Prisma (SQLite locally, PostgreSQL-ready)

---

## Run it locally

Requires Node.js 20.9 or newer.

```bash
npm install
npx prisma migrate dev     # creates prisma/dev.db
npm run db:seed            # admin user + starter content
npm run dev                # http://localhost:3000
```

Admin panel: <http://localhost:3000/admin> — sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`. Change the password under **Account** after the first login.

If npm blocks Prisma's install scripts (npm 11+), approve them once:

```bash
npm install-scripts approve prisma @prisma/engines @prisma/client esbuild
npm rebuild
```

## Environment variables (`.env`)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Database connection. `file:./dev.db` for SQLite. |
| `SESSION_SECRET` | Random string (32+ chars) used to sign admin logins. |
| `NEXT_PUBLIC_SITE_URL` | Live domain, e.g. `https://www.skylantic.lk`. Used for SEO tags, sitemap and canonical URLs. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First admin account, created by `npm run db:seed`. |
| `UPLOAD_DIR` | Folder for uploaded photos (default `./storage/uploads`). |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`

## What's included

**Public site:** home, tours (filter by type and park), tour detail pages with an enquiry form, destinations / national parks, About, Why choose us, FAQ, Contact, Terms, Privacy, photo credits, a WhatsApp button and a 404 page.

**SEO:** server-rendered pages, unique titles and descriptions, canonical URLs, Open Graph images, `sitemap.xml`, `robots.txt`, and JSON-LD structured data (TravelAgency, TouristTrip with offers, TouristDestination, FAQPage, BreadcrumbList).

**Admin (`/admin`):**
- **Dashboard:** new-enquiry count and a launch checklist
- **Enquiries:** inbox with status (New / Contacted / Confirmed / Closed), internal notes, and one-click reply by email, WhatsApp or phone
- **Tours:** name, type (day / overnight / private / night safari / round tour), parks covered, duration, price and currency (per person / group / jeep), max group size, highlights, included / excluded, itinerary, cover photo, gallery, YouTube/Vimeo video, featured / published, SEO fields
- **Destinations, FAQs, Pages** (About, Why us, Terms, Privacy), **Site settings** (contact details, social links, credentials, hero text and photo), **Account** (change password)

Saving in the admin updates the live site immediately.

## Hosting

The site needs a **Node.js host**, because the admin panel writes to a database and stores uploaded photos.

### Option A — VPS (recommended to start; simplest, about US$5–6/month)
e.g. DigitalOcean, Hetzner, Vultr or Hostinger VPS. SQLite and uploads work as-is.

```bash
git clone <repo> && cd skylantic-web
cp .env.example .env           # fill in real values
npm ci
npx prisma migrate deploy
npm run db:seed
npm run build
npx pm2 start "npm start" --name skylantic
```
Put Nginx or Caddy in front for HTTPS, and back up `prisma/dev.db` and `storage/uploads/` regularly.

### Option B — Vercel / serverless
Serverless hosts have no permanent disk, so:
1. Switch the database to PostgreSQL (e.g. Neon or Supabase): in `prisma/schema.prisma` set `provider = "postgresql"`, update `DATABASE_URL`, then delete `prisma/migrations` and run `npx prisma migrate dev --name init`.
2. Move photo uploads to object storage (e.g. Cloudinary, S3 or Vercel Blob) by changing `src/app/api/admin/upload/route.ts`.

### Domain & email
- Register a domain such as `skylantic.lk` (via LK Domain Registry) or `skylanticholidays.com`.
- Set `NEXT_PUBLIC_SITE_URL` to the final domain and rebuild.
- For a business address like `hello@skylantic.lk`, use Google Workspace or Zoho Mail, then enter it under **Site settings**.
- Submit `https://your-domain/sitemap.xml` to Google Search Console.

## Before launch

- [ ] Add phone, WhatsApp, email, address and social links in **Site settings**
- [ ] Add SLTDA registration or other credentials in **Site settings → Credentials**
- [ ] Replace the 6 sample tours with real tours, prices and photos
- [ ] Have **Terms** and **Privacy** reviewed by a legal adviser
- [ ] Replace the placeholder photos with your own (then update `/photo-credits`)
- [ ] Replace the text logo in `src/components/logo.tsx` and the icon in `src/app/icon.svg` with the final logo
- [ ] Change the admin password

## Project structure

```
prisma/schema.prisma        database models
prisma/seed.ts              starter content
src/app/(site)/             public pages
src/app/admin/              admin panel (login + (panel) routes, server actions)
src/app/api/admin/upload/   photo upload endpoint
src/app/uploads/[name]/     serves uploaded photos
src/components/             UI components (admin/ for admin-only)
src/lib/                    data access, auth, helpers
src/proxy.ts                redirects signed-out users away from /admin
public/images/              placeholder photography (Wikimedia Commons, see /photo-credits)
```
"# SKY" 
