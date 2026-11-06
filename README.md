# Skylantic Holidays — website & admin panel

Travel agency website for Skylantic Holidays, Sri Lanka: wildlife safaris and tours, with an admin panel to manage tours, destinations, FAQs, page text and contact details.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · **no database** — all content lives in [`data/content.json`](data/content.json) · hosted on Render

---

## Run it locally

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env       # set SESSION_SECRET
npm run dev                # http://localhost:3000
```

Admin panel: <http://localhost:3000/admin>. The username and password are hard-coded in [`src/lib/admin-credentials.ts`](src/lib/admin-credentials.ts) (only a bcrypt hash of the password is stored). To change the password:

```bash
node -e "console.log(require('bcryptjs').hashSync('YOUR-NEW-PASSWORD', 12))"
```

Paste the output into `ADMIN_PASSWORD_HASH`, commit and push.

## Content: `data/content.json`

One JSON file holds everything the site shows: `settings` (contact details, hero text and slides), `destinations`, `tours`, `faqs` and `pages`. Tours link to parks through `destinationIds`.

- **Locally**, the admin panel edits `data/content.json` directly, so you can make changes in the admin, then commit and push them.
- **On Render**, the committed file is copied to the persistent disk on first start (`$DATA_DIR/content.json`) and the admin edits that copy. Later pushes **do not overwrite** content edited on the live site. To replace live content with the committed file, delete `/var/data/content.json` from the Render *Shell* tab and restart.

## Enquiries

There's no database to store enquiries. The enquiry forms on the Contact and tour pages build a message with the visitor's details and open **WhatsApp** or their **email app**, addressed to the WhatsApp number and email set in **Site settings**. If neither is set, the form shows "Online enquiries are being set up".

## Environment variables

| Variable | Purpose |
| --- | --- |
| `SESSION_SECRET` | Random string (32+ chars) used to sign admin logins. |
| `NEXT_PUBLIC_SITE_URL` | Live domain, e.g. `https://www.skylantic.lk`. Used for SEO tags, sitemap and canonical URLs. |
| `DATA_DIR` | Folder holding `content.json` (default `./data`). `/var/data` on Render. |
| `UPLOAD_DIR` | Folder for uploaded photos (default `./storage/uploads`). `/var/data/uploads` on Render. |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`

## Deploying to Render

[`render.yaml`](render.yaml) is a Render Blueprint that sets everything up.

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, connect the repo and confirm.
3. When asked, enter `NEXT_PUBLIC_SITE_URL` (e.g. `https://skylantic-web.onrender.com` for now). `SESSION_SECRET` is generated automatically.
4. Wait for the first deploy, then sign in at `/admin`.
5. **Custom domain:** *Settings → Custom Domains*, then update `NEXT_PUBLIC_SITE_URL` and redeploy.

**Why it's a web service, not a Render Static Site:** the admin login and saving edits need a server. The Blueprint uses the **Starter** plan with a 1 GB persistent disk (about US$7/month plus US$0.25/GB) so admin edits and uploaded photos survive restarts and deploys. You can set `plan: free` and remove the `disk:` block, but then every admin edit and uploaded photo is lost whenever the service sleeps (after 15 minutes idle), restarts or redeploys. On the free plan, edit content locally and push instead.

### Domain & email
- Register a domain such as `skylantic.lk` (via LK Domain Registry) or `skylanticholidays.com`.
- Set `NEXT_PUBLIC_SITE_URL` to the final domain and redeploy.
- For a business address like `hello@skylantic.lk`, use Google Workspace or Zoho Mail, then enter it under **Site settings**.
- Submit `https://your-domain/sitemap.xml` to Google Search Console.

## What's included

**Public site:** home, tours (filter by type and park), tour detail pages with an enquiry form, destinations / national parks, About, Why choose us, FAQ, Contact, Terms, Privacy, photo credits, a WhatsApp button and a 404 page.

**SEO:** server-rendered pages, unique titles and descriptions, canonical URLs, Open Graph images, `sitemap.xml`, `robots.txt`, and JSON-LD structured data (TravelAgency, TouristTrip with offers, TouristDestination, FAQPage, BreadcrumbList).

**Admin (`/admin`):**
- **Dashboard:** content counts and a launch checklist
- **Tours:** name, type (day / overnight / private / night safari / round tour), parks covered, duration, price and currency (per person / group / jeep), max group size, highlights, included / excluded, itinerary, cover photo, gallery, YouTube/Vimeo video, featured / published, SEO fields
- **Destinations, FAQs, Pages** (About, Why us, Terms, Privacy), **Site settings** (contact details, social links, credentials, hero text and photos)

Saving in the admin updates the live site immediately.

## Before launch

- [ ] Add phone, WhatsApp, email, address and social links in **Site settings** (the enquiry forms need WhatsApp or email)
- [ ] Add SLTDA registration or other credentials in **Site settings → Credentials**
- [ ] Replace the 6 sample tours with real tours, prices and photos
- [ ] Have **Terms** and **Privacy** reviewed by a legal adviser
- [ ] Replace the placeholder photos with your own (then update `/photo-credits`)

## Project structure

```
data/content.json           all site content (no database)
render.yaml                 Render Blueprint
src/app/(site)/             public pages
src/app/admin/              admin panel (login + (panel) routes, server actions)
src/app/api/admin/upload/   photo upload endpoint
src/app/uploads/[name]/     serves uploaded photos
src/components/             UI components (admin/ for admin-only)
src/lib/content.ts          reads/writes content.json
src/lib/admin-credentials.ts  hard-coded admin username + password hash
src/lib/data.ts             queries used by the public pages
src/proxy.ts                redirects signed-out users away from /admin
public/images/              placeholder photography (Wikimedia Commons, see /photo-credits)
```
