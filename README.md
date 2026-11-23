# Fondation Jean-Félicien Gacha — website

Redesign of fondationgacha.org. Next.js 16 (App Router) + Payload CMS 3 (admin at `/admin`) + Postgres.

## Stack

- **Next.js 16**, TypeScript, Tailwind CSS v4
- **Payload CMS 3**, embedded in the same app; localized FR (default) / EN
- **next-intl**: French at `/`, English at `/en`
- **Motion** + **Lenis** for animation and smooth scroll (reduced-motion respected)
- **Postgres 17** (local Docker in dev)

## Requirements

- Node 24 (`nvm use`, see `.nvmrc`)
- pnpm 10 (pinned via `packageManager`, enable with `corepack enable`)
- Docker

## Local setup

```bash
# 1. Database (once)
docker run -d --name gacha-postgres \
  -e POSTGRES_USER=gacha -e POSTGRES_PASSWORD=gacha_dev -e POSTGRES_DB=gacha \
  -p 5434:5432 -v gacha-pgdata:/var/lib/postgresql/data \
  --restart unless-stopped postgres:17-alpine

# 2. Env
cp .env.example .env   # then fill DATABASE_URL and PAYLOAD_SECRET (openssl rand -hex 32)

# 3. Run
pnpm install
pnpm dev -p 3005
```

- Site: http://localhost:3005 (FR) and http://localhost:3005/en (EN)
- Admin: http://localhost:3005/admin. The first account created becomes an administrator.

## Importing the old WordPress site

All content from fondationgacha.org (228 news posts, pages, "Nos actions", images and PDFs) is imported
into Payload by a script. It is idempotent: re-running it updates documents instead of duplicating them.

```bash
pnpm wp:fetch      # optional: refresh data/wp-export/ from the live site (public REST API + post pages)
pnpm migrate:wp    # import into the local database (~15 min first run, ~1 min after; downloads are cached)
```

- Downloads are cached in `data/wp-cache/` (≈1 GB, gitignored); imported files go to `media/` (gitignored).
- Images are re-encoded to WebP (max 2560 px) and get 4 responsive sizes; file names are made ASCII.
- WordPress HTML becomes Payload rich text: inline images become uploads, YouTube iframes become
  "Vidéo / intégration" blocks, links to old pages are rewritten to the new paths, dead links become text.
- Event dates ("Du 13 au 20 janvier 2025") are parsed into the post's Agenda tab; themes are assigned by keyword.
- Team, residents, partners, Villa Boutanga rooms, visit prices, membership cards and contacts are seeded from
  [src/scripts/wp/seed.ts](src/scripts/wp/seed.ts).
- Every old URL gets a 301 entry in **Redirections** (e.g. `/activites/sante-et-social/` → `/actions/sante-social`).
- About 55 files from 2013–2014 no longer exist on the old server; they are listed in
  `data/wp-cache/failed-media.txt` after a run.
- `WP_ONLY=5862 pnpm migrate:wp` re-imports specific WordPress post ids; `WP_LIMIT=20` imports only the latest 20.

## Forms, menu and preview

```bash
pnpm seed:forms    # create/update the 5 site forms (FR/EN labels)
pnpm seed:nav      # reset the "Menu du site" global from the built-in menu
```

- Form submissions land in **Formulaires → Messages reçus** and are emailed (set `SMTP_*` in `.env`;
  without it, emails are printed in the dev server console).
- Newsletter sign-ups land in **Abonnés newsletter** and sync to Mailchimp when `MAILCHIMP_*` is set.
- Editors preview drafts with the eye icon (live preview) or the preview button (`/next/preview`, staff only).

## Content model (admin)

| Group | Collections |
|---|---|
| Contenu | Actualités (news + agenda, drafts & versions), Pages, Nos actions, Médiathèque |
| Classement | Thèmes, Mots-clés |
| Fondation | Équipe & bénévoles, Résidents, Partenaires |
| Séjourner | Chambres (Villa Boutanga) |
| Ressources | Presse, Bilans d’activités |
| Administration | Utilisateurs, Redirections, Réglages du site (contacts, tarifs, adhésion, dons) |

Content fields are localized FR/EN (FR is the default and the fallback). The admin UI is in French.

## Structure

```
src/
  app/(frontend)/[locale]/   public site (per-locale layout + pages)
  app/(payload)/             Payload admin + REST/GraphQL API
  access/roles.ts            admin / editor access helpers
  collections/               Payload collections (Posts, Pages, Activities, Media, …)
  globals/                   Payload globals (site settings)
  fields/, blocks/           shared fields (slug, rich text, legacy) and rich-text blocks
  scripts/migrate-wp.ts      WordPress → Payload import (helpers in scripts/wp/)
  components/                UI + motion components
  i18n/                      next-intl routing, request config, navigation
  proxy.ts                   locale routing (skips /admin and /api)
messages/                    UI strings fr.json / en.json
data/wp-export/              JSON dump of the old WordPress site (REST API + post-extras), used by the migration
scripts/wp/                  export download scripts (fetch.mjs, fetch-extras.mjs)
```

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| 0 | Setup: Next.js, Payload, Postgres, Tailwind, i18n, security headers | done |
| 1 | Design system: tokens, type, Ndop patterns, components, motion primitives (see `/styleguide`) | done |
| 2 | Data model + WordPress migration (228 posts, 12 pages, 8 actions, 838 media, 253 redirects) | done |
| 3 | Public pages: homepage, news + agenda, actions, CMS pages with structured sections, hubs, old-URL redirects, 404, sitemap, ISR | done |
| 4 | Forms (contact, Villa booking, membership, volunteering, receipts), newsletter, editable menu, live preview, admin dashboard | done |
| 5 | English content, SEO, performance and accessibility | |
| 6 | QA, Vercel deploy, OVH DNS switch | |
