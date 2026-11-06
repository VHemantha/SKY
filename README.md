# Skylantic Holidays — website & admin panel

Travel agency website for Skylantic Holidays, Sri Lanka: wildlife safaris and tours, with an admin panel to manage tours, destinations, enquiries, FAQs, page text and contact details.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Prisma + PostgreSQL · hosted on Netlify (uploads in Netlify Blobs)

---

## Run it locally

Requires Node.js 20.9 or newer and a PostgreSQL database. The easiest is a free [Neon](https://neon.tech) project: create a separate `dev` branch for local work so you never touch live data.

```bash
npm install
cp .env.example .env       # set DATABASE_URL / DIRECT_URL to a Postgres database
npx prisma migrate deploy  # creates the tables
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
| `DATABASE_URL` | Pooled Postgres connection used by the app (add `pgbouncer=true` when it goes through a pooler). |
| `DIRECT_URL` | Direct Postgres connection used for migrations. Locally can equal `DATABASE_URL`. |
| `SESSION_SECRET` | Random string (32+ chars) used to sign admin logins. |
| `NEXT_PUBLIC_SITE_URL` | Live domain, e.g. `https://www.skylantic.lk`. Used for SEO tags, sitemap and canonical URLs. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First admin account, created by `npm run db:seed`. |
| `UPLOAD_DIR` | Local dev only: folder for uploaded photos (default `./storage/uploads`). On Netlify photos go to Netlify Blobs automatically. |

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

## Deploying to Netlify

The repo is ready for Netlify: [`netlify.toml`](netlify.toml) runs database migrations, seeds starter content on the first deploy, and builds the site. Uploaded photos are stored in **Netlify Blobs** (no setup needed).

1. **Database.** By default the site uses **Netlify Database** — no connection strings needed. Netlify applies the SQL in `netlify/database/migrations/` just before each deploy goes live, starter content is added on the first page request, and the admin account is created on the first login from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. When you change `prisma/schema.prisma`, run `npx prisma migrate dev` locally and copy the new migration folder into `netlify/database/migrations/` too.
   To use an external Postgres (e.g. [neon.tech](https://neon.tech)) instead, set the **pooled** connection string (with `&pgbouncer=true`) as `DATABASE_URL` and the **direct** one as `DIRECT_URL`; the build then runs `prisma migrate deploy` and the seed itself.
2. **Create the site.** Push this repo to GitHub, then in Netlify: *Add new site → Import an existing project* → pick the repo. Build settings are read from `netlify.toml`.
3. **Set environment variables** (*Site configuration → Environment variables*):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` / `DIRECT_URL` | only for an external Postgres (see step 1) |
   | `SESSION_SECRET` | output of the generate command above |
   | `NEXT_PUBLIC_SITE_URL` | `https://<your-site>.netlify.app` for now, your domain later |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` | first admin login (8+ chars) |

4. **Deploy.** The first build creates the tables, the admin account and the starter tours/pages.
5. **After the first deploy:** sign in at `/admin`, change the password under **Account**, then **delete `ADMIN_EMAIL` and `ADMIN_PASSWORD`** from Netlify so seeding stops running on later builds.
6. **Custom domain:** *Domain management → Add a domain*, then update `NEXT_PUBLIC_SITE_URL` and redeploy.

Changing `NEXT_PUBLIC_SITE_URL` always needs a redeploy (*Deploys → Trigger deploy*), because it's built into the pages.

To try the Netlify setup locally (including Blobs): `npm i -g netlify-cli`, `netlify link`, `netlify dev`.

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
