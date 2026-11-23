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

## Structure

```
src/
  app/(frontend)/[locale]/   public site (per-locale layout + pages)
  app/(payload)/             Payload admin + REST/GraphQL API
  access/roles.ts            admin / editor access helpers
  collections/               Payload collections (Users, Media, …)
  components/                UI + motion components
  i18n/                      next-intl routing, request config, navigation
  proxy.ts                   locale routing (skips /admin and /api)
messages/                    UI strings fr.json / en.json
data/wp-export/              JSON dump of the old WordPress site (REST API), used by the migration
```

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| 0 | Setup: Next.js, Payload, Postgres, Tailwind, i18n, security headers | done |
| 1 | Design system: tokens, type, Ndop patterns, components, motion primitives (see `/styleguide`) | done |
| 2 | Data model + WordPress migration (pages, 228 posts, 1764 media, redirects) | |
| 3 | Public pages | |
| 4 | Forms, admin polish, live preview, roles | |
| 5 | English content, SEO, performance and accessibility | |
| 6 | QA, Vercel deploy, OVH DNS switch | |
