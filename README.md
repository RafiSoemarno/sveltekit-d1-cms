# SvelteKit D1 CMS

A small, complete content site with a custom admin, built on SvelteKit and
Cloudflare Workers. Content lives in **D1**, media lives in **R2**, and public
pages are server-rendered at request time. The UI is bilingual (English and
Indonesian) and the demo identity is deliberately fictional.

## What is included

- **Public site** — home, product catalog with filters and detail pages, and a
  privacy policy. Server-rendered, with locale-aware metadata, `hreflang`, and
  canonical URLs.
- **Admin** — draft/publish workflow, revision history with restore, media
  library with usage checks, per-collection ordering, and site settings.
- **Preview** — signed preview cookies render drafts without publishing them.
- **Media** — uploads are content-addressed, stored in R2, and streamed through
  `/media/*` with immutable caching.
- **Consent** — optional Google Ads tag gated behind a consent banner, disabled
  until real tag IDs are configured.
- **Tests** — Vitest running in the Workers runtime against a real local D1
  binding.

Everything branded in the demo (`Acme`, `Globex`, the palette, the copy) is a
placeholder. See [Making it yours](#making-it-yours).

## Stack

| Layer     | Choice                                    |
| --------- | ----------------------------------------- |
| Framework | SvelteKit 2 + Svelte 5                    |
| Runtime   | Cloudflare Workers (`adapter-cloudflare`) |
| Database  | Cloudflare D1                             |
| Media     | Cloudflare R2                             |
| Styling   | Tailwind CSS v4                           |
| Tests     | Vitest + `@cloudflare/vitest-plugin`      |

## Getting started

Requires Node 22 (`.nvmrc`).

```bash
npm install
npm run db:reset:local        # create the local D1 schema from db/schema.sql
cp db/seed.example.sql db/seed.local.sql   # optional demo content
npm run db:seed:local
npm run dev
```

`db/seed.local.sql` is gitignored. Its contents are demo data only.

For the admin and preview to work locally without Cloudflare Access, create a
`.dev.vars` file:

```bash
DEV_AUTH_EMAIL=you@example.com
PREVIEW_SECRET=dev-preview-secret
```

`vite dev` emulates the `DB` and `MEDIA` bindings through Wrangler. Local state
lives in `.wrangler/`.

To run the built Worker exactly as deployed:

```bash
npm run preview               # npm run build && wrangler dev
```

To copy media referenced by the remote database into local R2:

```bash
npm run media:pull:local -- --remote-bucket <bucket> --config wrangler.local.jsonc
```

The script reads `/media/*` references from D1, so there is no manifest to keep
in sync.

## Content model

Content is stored as JSON documents in a single `content_items` table, grouped by
collection and status. Drafts live in `content_drafts`, and each save or publish
writes a snapshot to `content_revisions`.

| Collection    | Shape                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------- |
| `slides`      | hero carousel (`image`, `title`, `tagline`, `description`)                                    |
| `products`    | `name`, `brand`, `category`, `image`, `gallery`, descriptions, `features`, `brochures`, `seo` |
| `solutions`   | `image`, `title`, `description`, `icon`                                                       |
| `services`    | `name`, `description`, `icon`                                                                 |
| `stats`       | `value`, `label`, `icon`                                                                      |
| `testimonies` | `paragraph`, `name`, `company`, `location`, optional image and LinkedIn                       |
| `partners`    | `name`, `logo`, `row`                                                                         |

Localized strings use `{ "en": "...", "id": "..." }`. Product IDs are public URL
slugs and become permanent after the first publish.

Brands and categories are configuration, not database rows. Product records
store the `id` values from `src/lib/catalog.ts`.

## Admin

`/admin` has four areas: homepage collections, products, media, and settings.

- Saving writes a draft; the live row stays unchanged until **Publish**.
- Publishing validates required fields in both languages and writes a revision.
- **Unpublish** removes the live row but keeps drafts. **Delete** keeps a
  snapshot that can be restored as a draft.
- The last 50 revisions per item are retained.
- Media deletion is blocked while live content, drafts, or settings reference
  the asset.

In production, put `/admin*` and `/api/admin*` behind Cloudflare Access. The
Worker fails closed with `403` when the Access header is missing.

## Making it yours

| What                                | Where                                                      |
| ----------------------------------- | ---------------------------------------------------------- |
| Site name, description, theme color | `src/lib/brand.ts`                                         |
| Brands and categories               | `src/lib/catalog.ts`                                       |
| UI copy and translations            | `src/lib/i18n/ui.ts`                                       |
| Logo and favicon                    | `static/logo.svg`, `src/lib/assets/logo.svg`               |
| Default share image                 | `static/story-image.png`                                   |
| Demo content                        | `db/seed.example.sql`                                      |
| Google Ads tag                      | `src/lib/constants.ts` (disabled while IDs contain `XXXX`) |

The layout reads contact details and SEO defaults from D1 settings, not from
code. A missing settings row renders no contact details rather than stale ones.

## Commands

| Command                    | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `npm run dev`              | Start the dev server with emulated D1/R2       |
| `npm run build`            | Build the Worker and static assets             |
| `npm run preview`          | Build, then run the Worker with `wrangler dev` |
| `npm run check`            | Type-check the project                         |
| `npm run lint`             | Check formatting and lint                      |
| `npm run format`           | Auto-fix formatting                            |
| `npm test`                 | Run the test suite against a local D1 binding  |
| `npm run db:reset:local`   | Create the local schema from `db/schema.sql`   |
| `npm run db:seed:local`    | Apply `db/seed.local.sql`                      |
| `npm run media:pull:local` | Copy referenced media from remote R2           |
| `npm run deploy`           | Deploy the production Worker                   |
| `npm run deploy:staging`   | Deploy the staging Worker                      |

## Tests

`npm test` runs in the Workers runtime with a real local D1 binding. The schema
is applied from `db/schema.sql`; tests cover the write state machine (save,
publish, unpublish, delete, restore), validation and caps, ordering, revision
pruning, IDs, and settings.

## Deployment

Deploys run locally so account, database, and route identifiers stay out of git:

```bash
cp wrangler.local.example.jsonc wrangler.local.jsonc
cp wrangler.staging.local.example.jsonc wrangler.staging.local.jsonc
npm run deploy
```

`wrangler.jsonc` is the local development config and contains placeholder
bindings only. Do not connect the repository to Cloudflare Workers Builds: a
build would deploy against those placeholders, and Wrangler auto-provisions
bindings that have no ID.

The production schema is managed separately. To change it, apply the change
privately and mirror the data-free result into `db/schema.sql`. D1 Time Travel
is the backstop for anything outside the revision history; export before a
destructive change:

```bash
npx wrangler d1 export DB --remote --output=d1-backup.sql
```

`PREVIEW_SECRET` signs preview cookies and is stored as a Worker secret:

```bash
openssl rand -hex 32 | npx wrangler secret put PREVIEW_SECRET -c wrangler.local.jsonc
```

Rotating it invalidates existing preview sessions; published content is
unaffected.
