# Deploying Mukti Portfolio + CMS

This guide covers how to deploy the app (Next.js 16 + Prisma 7 + PostgreSQL) and how
to manage every image the site needs once it is live.

---

## 1. What you are deploying

| Piece | Detail |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack, Cache Components) |
| UI | React 19, Tailwind CSS v4, Framer Motion, lucide-react |
| Portfolio assistant | Local, data-backed answers from published portfolio content; no AI provider or API key required |
| Data | PostgreSQL via Prisma 7 (`@prisma/adapter-pg`, raw SQL — no Prisma Accelerate needed) |
| Auth | Hand-rolled JWT session cookie (`jose` + `bcryptjs`) — no third-party auth |
| Files | Cloudinary for public images when configured; local disk for private files/CVs and as a fallback |
| Email | Optional — Resend (`RESEND_API_KEY`); without it, messages only land in the admin inbox |

**You need:** a PostgreSQL database, a Node 22+ host, and a place for uploaded files that
survives a redeploy.

---

## 2. Environment variables

Copy `.env.example` → `.env` and fill it in.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ | `postgresql://USER:PASS@host:5432/db?schema=public` |
| `AUTH_SECRET` | ✅ | 32+ random bytes. `openssl rand -base64 32` |
| `SITE_URL` | ✅ | Public URL, no trailing slash. Used by sitemap/robots/OG tags |
| `ADMIN_EMAIL` | for seeding | First admin login |
| `ADMIN_INITIAL_PASSWORD` | for seeding | First admin password — change it after first login |
| `UPLOAD_DIR` | optional | Default `./public/uploads`. Point at a mounted volume in production |
| `PRIVATE_UPLOAD_DIR` | optional | Default `./private`. Must NOT be inside `public/` |
| `MAX_UPLOAD_MB` | optional | Per-file limit, default `8` |
| `CLOUDINARY_URL` | optional | Cloudinary API URL; public image uploads use it when set. Store it as a server-side secret |
| `RESEND_API_KEY` | optional | Enables email delivery of contact messages |
| `CONTACT_NOTIFY_EMAIL` | optional | Where contact notifications are sent |
| `RATE_LIMIT_*` | optional | In-memory limiter, per-minute caps |
| `RATE_LIMIT_PORTFOLIO_ASSISTANT_PER_MINUTE` | optional | Assistant requests per IP per minute; defaults to `8` |

The portfolio assistant answers from published profile, skills, projects, experience,
education, services, and contact information. It makes no third-party AI requests and
requires no API key. If a detail is not in the published portfolio, it says so instead
of guessing.

---

## 3. Deploy option A — Docker (recommended)

The included `Dockerfile` + `docker-compose.yml` give you Postgres, migrations, the app and
**persistent volumes for your images** in one command.

```bash
cp .env.example .env
# edit .env: set POSTGRES_PASSWORD, AUTH_SECRET, SITE_URL, ADMIN_EMAIL, ADMIN_INITIAL_PASSWORD
docker compose up -d --build
docker compose logs -f app
```

* Site → `http://localhost:3000`
* Admin → `http://localhost:3000/admin/login`

What compose does for you:

* `db` — PostgreSQL 17 with a named volume (`db-data`) → your data survives rebuilds.
* `migrate` — runs `prisma migrate deploy` once, then exits; `app` waits for it to succeed.
* `app` — the Next.js server.
* `uploads` / `private` — named volumes mounted at `/app/public/uploads` and `/app/private`.
  **This is what makes uploaded images survive a redeploy.**

Create the first admin (once the stack is up):

```bash
docker compose exec app npm run create-admin
# or seed everything (admin + profile + settings + demo projects + skills/services)
docker compose exec app npm run db:seed
```

### Behind a reverse proxy / domain

Terminate TLS with Caddy, nginx or Traefik and forward to `127.0.0.1:3000`.
Set `SITE_URL=https://your-domain.com` — the session cookie sets `secure` automatically
when `NODE_ENV=production`, so **HTTPS is required** or admin login will not stick.

---

## 4. Deploy option B — VPS / any Node host

```bash
nvm install 22
nvm use 22
git clone <repo> /srv/portifol && cd /srv/portifol
npm ci
cp .env.example .env && nano .env      # DATABASE_URL, AUTH_SECRET, SITE_URL …
npx prisma migrate deploy               # apply migrations
npm run db:seed                         # first admin + starter content
npm run build && npm run start          # production server on :3000
```

Run it under systemd or pm2 so it restarts on reboot/crash. Keep `UPLOAD_DIR` and
`PRIVATE_UPLOAD_DIR` on a path that is **not** inside the build directory, e.g.
`/srv/portifol-data/uploads` and `/srv/portifol-data/private`.

---

## 5. Deploy option C — Vercel

Set `CLOUDINARY_URL` in Vercel's environment variables to persist public image uploads. Private uploads (including CVs) still use local disk and are not durable on serverless deployments.

1. Push the repo to GitHub and import it on Vercel.
2. Add the env vars from §2 (`DATABASE_URL` → Vercel Postgres / Neon / Supabase / Railway, and `CLOUDINARY_URL` as a Secret).
3. Build command `npm run build`, install `npm ci`.
4. Add a **build step or release command**: `npx prisma migrate deploy`.
5. Seed once from your machine: `DATABASE_URL=… npx prisma migrate deploy && npm run db:seed`.

### ⚠️ Private-file caveat on serverless

Public images are stored on Cloudinary when configured. Private uploads are written to
the local filesystem (`src/lib/storage/index.ts`), which is **read-only and wiped on every
redeploy** on Vercel. Use persistent private object storage for CV uploads, or deploy on a
host with persistent storage.

The local fallback for public images also requires persistent storage. Docker/option A
provides persistent local volumes without changing the storage configuration.

---

## 6. Images & media — the complete guide

Every image on the site is managed from **Admin → Media**. Nothing is hard-coded.

### 6.1 The six image slots

| Slot | Where it is used | Recommended size | Format |
|---|---|---|---|
| **Profile image** | Hero orb + About section | 800 × 1000 (4:5) | JPEG / WebP |
| **Project thumbnail** | Project card, case-study header, OG image | 1600 × 1000 (16:10) | JPEG / WebP |
| **Project screenshots** | Case-study gallery | 1920 × 1080 (16:9) | JPEG / WebP |
| **Social / OG image** | Link previews on WhatsApp, X, LinkedIn | 1200 × 630 | PNG / JPEG |
| **CV** | "Download CV" button (access-controlled) | A4 page | **PDF only** |
| **Favicon** | Browser tab | 32 × 32 / 48 × 48 | ICO / PNG |

### 6.2 Uploading

1. Sign in at `/admin/login`.
2. Go to **Media** in the sidebar.
3. Pick a **category** (this controls access rules):
   * `Profile image` — public
   * `Project thumbnail` / `Project screenshot` — public
   * `Social image` — public, used for link previews
   * `CV (private PDF)` — **private**; only reachable through the protected download route
   * `Other` — public
4. Choose the file and press **Upload**.

Allowed types are enforced server-side (`src/lib/storage/index.ts`): **JPEG, PNG, WebP,
AVIF, GIF, SVG** for images and **PDF** for documents. Max size = `MAX_UPLOAD_MB`
(default 8 MB). Files are renamed to a timestamp + random id, so never rely on the
original filename. Public images use Cloudinary if `CLOUDINARY_URL` is configured;
private images and PDFs remain local.

### 6.3 Where each image gets attached

| Image | Attach it at |
|---|---|
| Profile image | **Admin → Profile → Profile image** (select the uploaded file) |
| CV | **Admin → Profile → CV file** + tick *Show "Download CV" button publicly* |
| Project thumbnail | **Admin → Projects → [project] → Media → Thumbnail image** |
| Project screenshots | **Admin → Projects → [project] → Media → Screenshots** (tick each) |
| Social / OG image | **Admin → Settings → Social sharing image** |
| Favicon | **Admin → Settings → Favicon path** (default `/favicon.ico`); the file itself lives at `src/app/favicon.ico` |
| Hero copy & about text | **Admin → Profile → Hero / About** |

Then publish: **Admin → Projects → Publish** (only published projects appear publicly).

### 6.4 Image tips

* Export at **2×** the display size for retina screens but keep files small
  (thumbnail < 300 KB, screenshot < 800 KB) — `next/image` optimises them at request time.
* Prefer **WebP** (or AVIF) over PNG for photos; use PNG only for graphics with sharp
  edges or transparency.
* Keep a consistent visual style across thumbnails — they sit in a 16:10 frame and are
  cropped to fill.
* SVG is accepted for icons/logos (e.g. a custom logo mark in the footer).
* A project with **no thumbnail** still looks good: the card renders an animated
  gradient + monogram fallback with the project's initials.

### 6.5 Where the files live on the server

| Set in | Path | Public? |
|---|---|---|
| `UPLOAD_DIR` | `./public/uploads` (Docker: `/app/public/uploads`) | Served at `/uploads/<file>` |
| `PRIVATE_UPLOAD_DIR` | `./private` (Docker: `/app/private`) | **Never** public — only via `/api/media/private/[id]` |

The private route allows access when: the admin is signed in, **or** the file is marked
public, **or** it is the published CV. Everything else returns `403`.

### 6.6 Moving images between environments

Because uploads are gitignored, they do **not** travel with a `git pull`:

* **Docker** — the `uploads` / `private` volumes already keep them; back up the volumes
  (see §8).
* **VPS** — copy the two directories, or tar them:
  `tar czf media.tgz public/uploads private && scp media.tgz server:/srv/`
* **Vercel** — re-upload through **Admin → Media**, or switch to object storage (§5).

---

## 7. First-run content checklist

Right after the first deploy the site is empty. Work through this in the admin:

1. **Profile** — name, professional title, eyebrow, hero headline + description,
   biography, interests, approach, learning goals, ambitions, education.
   Upload the profile image and CV, tick *Show About section publicly* and
   *Show "available for work"*.
2. **Skills** — add each technology, pick a category (Frontend / Backend / Mobile /
   Database / DevOps / Tools) and an icon name (`Code2`, `Database`, `Flame`, …).
3. **Services** — the services you sell, with an icon each.
4. **Experience** and **Education** — internships, employment, certifications, degrees.
   Tick *Current* for ongoing roles.
5. **Projects** — title, slug, category, short description, overview, problem, target
   users, goals, tech stack, key features, challenges, testing notes, links, thumbnail and
   screenshots → **Publish**.
6. **Settings** — site title, meta description, favicon path, social image, contact
   email, accent colour.
7. **Contact** — verify the form reaches **Admin → Messages** (and email if
   `RESEND_API_KEY` is set).

The public site ships in three languages (English / አማርኛ / Afaan Oromoo) — visitors pick
their language in the header, and you can pick an accent colour next to it.

---

## 8. Updating a deployment

```bash
git pull
docker compose up -d --build          # rebuild + restart (volumes keep your images)
docker compose exec app npm run db:deploy   # if you added migrations
```

Migrations are also applied automatically by the `migrate` service on every `up`.

### Backups

```bash
# database
docker compose exec db pg_dump -U mukti mukti | gzip > db-$(date +%F).sql.gz

# images
docker run --rm -v portifol_uploads:/u -v "$PWD":/backup alpine \
  tar czf /backup/uploads-$(date +%F).tgz -C /u .
```

---

## 9. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `AUTH_SECRET is not configured` | Set `AUTH_SECRET` in the environment and restart. |
| `Can't reach database server` | Wrong `DATABASE_URL`, or the DB isn't ready. Compose waits for the healthcheck automatically. |
| Admin login loops back to the login page | Not on HTTPS in production → the `secure` cookie is dropped. Serve over TLS. |
| Uploaded image disappears after redeploy | Uploads are on a local disk — use a persistent volume (Docker §3) or object storage (§5). |
| Image upload fails with "File is too large" | Raise `MAX_UPLOAD_MB`, or compress the file. |
| Image upload fails with a type error | Only JPEG/PNG/WebP/AVIF/GIF/SVG and PDF are allowed. |
| CV download returns 403 | The CV is private: either tick *Show "Download CV" button publicly* in Profile, or accept that only the admin can fetch it. |
| Build fails on `Route segment config "dynamic"` | Do not add `export const dynamic` — the app runs with Cache Components; use `export const instant = false` instead. |
| Contact messages not arriving by email | `RESEND_API_KEY` / `CONTACT_NOTIFY_EMAIL` unset — messages are still stored in the admin inbox. |
| Rate limit hits too early | The limiter is in-memory per instance; it resets on restart and is not shared between replicas. |
