# Mukti — Premium Developer Portfolio & Admin CMS

A production-ready personal portfolio website with a full private admin dashboard, built with Next.js 16, TypeScript, Tailwind CSS v4, PostgreSQL, and Prisma ORM.

---

## Features

### Public Portfolio
- **Hero section** — eyebrow label, headline, description, availability badge, CTA buttons
- **About section** — bio, profile image, and interest/approach/education info cards
- **Skills section** — grouped by category with Lucide icons
- **Projects grid** — card-based listing with category badges and featured highlights
- **Project case studies** — full detail pages with problem, goals, architecture, challenges, screenshots, and related projects
- **Contact form** — inquiry type selector, honeypot spam protection, rate limiting, inbox storage, optional email notification
- **Site-wide header & footer** — dynamic navigation, availability indicator, social links
- **SEO** — metadata, Open Graph, sitemap, robots.txt, canonical URLs
- **404 page** — styled not-found page

### Admin Dashboard (`/admin`)
- **Overview** — stats for projects, messages, skills, media
- **Projects** — full CRUD, status (Draft / Published / Unpublished), featured flag, display order, slug auto-generation, thumbnail + screenshot picker
- **Skills** — create / edit / delete / toggle published per skill with icon picker and category grouping
- **Experience & Education** — separate pages backed by the same component; supports Employment, Internship, Education, Certification, Training, Academic Project, Achievement
- **Services** — manage what you offer with icon and description
- **Profile** — all hero/about copy, bio, links (GitHub, LinkedIn, etc.), CV file, profile photo, availability toggle
- **Site Settings** — site title, meta description, footer, social links, contact email, theme accent, CV visibility, social image
- **Media Library** — upload images (JPEG, PNG, WebP, AVIF, GIF, SVG) and PDFs, delete, copy URL; public images use Cloudinary when configured (otherwise `/uploads/`), private files via authenticated API route
- **Messages (Inbox)** — view, filter, mark read/unread, reply, delete contact form submissions
- **Admin auth** — JWT sessions stored in HttpOnly cookies, 7-day TTL, proxy-layer optimistic redirect, server-side `requireAdmin()` guard on every action

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Database | PostgreSQL |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Auth | `jose` (JWT HS256, Web Crypto API) |
| Validation | Zod v4 |
| Password | bcryptjs |
| Email | Resend (optional) |
| Animations | Framer Motion |
| Testing | Vitest + jsdom |
| Dev server | `next dev` (Turbopack) |

---

## Project Structure

```
portifol/
├── prisma/
│   ├── schema.prisma          # All database models
│   ├── seed.ts                # Idempotent seed (admin + 5 projects + profile)
│   └── migrations/            # SQL migration files
├── scripts/
│   └── create-admin.ts        # CLI tool to add/reset an admin account
├── src/
│   ├── app/
│   │   ├── (public)/          # Public portfolio routes (/, /projects, /contact, /privacy)
│   │   │   ├── page.tsx       # Homepage (Hero + About + Skills + Projects + Contact)
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx   # Projects listing
│   │   │   │   └── [slug]/    # Case study detail page
│   │   │   └── contact/       # Contact page
│   │   ├── admin/
│   │   │   ├── login/         # Sign-in page (unauthenticated)
│   │   │   └── (dashboard)/   # Protected admin area
│   │   │       ├── page.tsx   # Overview / stats
│   │   │       ├── projects/  # List, new, [id]/edit
│   │   │       ├── skills/
│   │   │       ├── experience/
│   │   │       ├── education/
│   │   │       ├── services/
│   │   │       ├── profile/
│   │   │       ├── settings/
│   │   │       ├── media/
│   │   │       └── messages/
│   │   └── api/
│   │       └── media/private/[id]/  # Authenticated private file serving
│   ├── components/
│   │   ├── admin/             # Admin UI components
│   │   ├── forms/             # Contact form
│   │   ├── layout/            # SiteHeader, SiteFooter
│   │   ├── projects/          # ProjectCard, CaseStudy
│   │   ├── sections/          # Hero, About, Skills, Contact info
│   │   └── ui/                # Design system (Button, Card, Field, Icon, Badge, etc.)
│   ├── lib/
│   │   ├── actions/           # Server Actions (auth, projects, skills, profile, …)
│   │   ├── auth/              # session.ts, guard.ts, password.ts
│   │   ├── email/             # Resend email notification
│   │   ├── storage/           # Local disk upload/read/delete
│   │   ├── validation/        # Zod schemas + format helpers
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── queries.ts         # Data-fetching helpers for public pages
│   │   ├── defaults.ts        # Fallback profile/settings before DB seed
│   │   ├── rate-limit.ts      # In-memory rate limiter
│   │   └── utils.ts           # cn, slugify, uniqueSlug, truncate, initials, …
│   ├── generated/prisma/      # Auto-generated Prisma client (do not edit)
│   └── proxy.ts               # Next.js 16 Proxy (formerly middleware)
├── public/uploads/            # Publicly served uploaded images
├── private/                   # Private uploaded files (CV, etc.)
├── .env                       # Local environment variables (not committed)
├── .env.example               # Template — copy to .env and fill in values
├── next.config.ts
├── prisma7.config.ts
├── tailwind.config.ts
└── vitest.config.ts
```

---

## Getting Started

### 1. Prerequisites

- **Node.js 20+**
- **PostgreSQL** running locally (or a hosted instance)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random 32-byte secret for JWT signing — generate with `node -e "console.log(crypto.randomBytes(32).toString('base64'))"` |
| `SITE_URL` | Canonical URL (e.g. `https://mukti.dev`) |
| `ADMIN_EMAIL` | Your admin email address |
| `ADMIN_INITIAL_PASSWORD` | Initial admin password (change after first login) |
| `CLOUDINARY_URL` | *(Optional)* Cloudinary URL for public image uploads; keep the API secret server-side |
| `RESEND_API_KEY` | *(Optional)* Resend key for contact email notifications |
| `CONTACT_NOTIFY_EMAIL` | *(Optional)* Where contact notifications are sent |

### 4. Set up the database

```bash
# Run migrations (creates all tables)
npm run db:migrate

# Seed initial data (admin account + 5 projects + default profile)
npm run db:seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public portfolio.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

Default admin credentials (from seed / `.env`):
- **Email:** `admin@example.com`
- **Password:** `changeme123!`

> ⚠️ Change the password immediately after first login via the admin Settings page.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm test` | Run Vitest unit tests |
| `npm run typecheck` | TypeScript type-check (no emit) |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply Prisma migrations |
| `npm run db:seed` | Seed the database |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run create-admin` | CLI to add or reset an admin account |

---

## Database Schema

The Prisma schema defines the following models:

- **`Admin`** — administrator accounts (email, bcrypt password hash)
- **`Profile`** — bio, hero copy, social links, profile image, CV file, availability
- **`Project`** — title, slug, description, case study fields, technologies, features, status, media
- **`ProjectScreenshot`** — ordered screenshots linked to a project
- **`Skill`** — name, category, icon, display order, published flag
- **`Experience`** — employment, education, internship, certification, etc.
- **`Service`** — what you offer (title, description, icon)
- **`ContactMessage`** — contact form submissions with read/unread status and admin reply
- **`Media`** — uploaded files (images + PDFs) with public/private flag and storage key
- **`SiteSettings`** — site title, meta description, footer, social links, theme accent

---

## Authentication

The admin area uses **JWT sessions** with the following properties:

- Algorithm: **HS256** (Web Crypto API — `crypto.subtle.importKey`)
- Cookie: `mukti_admin_session` (HttpOnly, SameSite=Lax, Secure in production)
- TTL: **7 days**
- Guard: `requireAdmin()` is called server-side in **every** admin Server Component and Server Action — the proxy layer only provides an optimistic redirect
- Password hashing: **bcryptjs** (cost factor 12)

---

## File Uploads

Files are stored on the local filesystem:

- **Public images** → `./public/uploads/` — served directly by Next.js static file handling at `/uploads/filename`
- **Private files (CV, etc.)** → `./private/` — served only via `/api/media/private/[id]` which verifies the session or CV visibility setting

Allowed types:
- Images: JPEG, PNG, WebP, AVIF, GIF, SVG
- Documents: PDF (CV uploads only)
- Max size: configurable via `MAX_UPLOAD_MB` (default 8 MB)

---

## Testing

```bash
npm test
```

The test suite covers (no database required):
- Zod validation schemas (contact form, login, project)
- Utility functions (`slugify`, `uniqueSlug`, `truncate`, `initials`, `parseList`)
- Password hashing and verification (`bcryptjs`)
- JWT session signing and verification (`jose` with Web Crypto)

**Result: 33 tests, all passing.**

---

## Deployment

### Environment
Set all variables from `.env.example` in your hosting platform's environment configuration.

### Database
Run migrations on deploy:
```bash
npm run db:migrate
```

### File storage
When `CLOUDINARY_URL` is set, public image uploads are stored in Cloudinary; PDFs and private uploads remain on local disk behind the protected media route. Without Cloudinary, public images are stored under `./public/uploads/`. Private files need persistent storage in production.

### Build
```bash
npm run build
npm start
```

---

## Customisation

Everything about the public portfolio is editable from the admin dashboard at `/admin` without touching source code:

| What | Where in admin |
|---|---|
| Name, headline, bio | Profile |
| Profile photo | Profile → upload in Media, then select |
| CV file | Profile → upload PDF in Media (category CV), then select |
| Projects | Projects → New project |
| Skills | Skills |
| Work experience | Experience |
| Education | Education |
| Services offered | Services |
| Site title, description, footer | Settings |
| Contact email | Settings |
| Social image (OG) | Settings → upload in Media, then select |

---

## License

MIT — built and owned by Mukti.
