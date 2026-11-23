# Fondation Jean-Félicien Gacha — redesign progress & handover

_Last updated: 23 November 2026_

This document describes the rebuild of **fondationgacha.org**: why it is being rebuilt, what has been done
phase by phase, how the project is organised, and what remains. It is meant to let anyone pick the work up.

---

## 1. Context

### The organisation
The **Fondation Jean-Félicien Gacha** is a Cameroonian NGO founded by **Ly Dumas** in memory of her father,
based in **Bangoulap** (Ndé division, West Cameroon, 1,500 m above sea level, near Bangangté).
Motto: _« La reconnaissance de l’autre et de ses valeurs »_.

It works in five areas — education & training, culture & crafts, health & social action,
environment & farming, community tourism — through:
- the **Centre des Cultures JLD** (workshops, auditorium, Harth library, computer room, the Ly & Frédéric Dumas collection);
- state-approved (**MINEFOP**) vocational training: sewing, beadwork, carpentry, masonry, plumbing, farming…;
- the **Villa Boutanga** guesthouse (26 rooms and suites) and **Le Jacaranda** restaurant;
- artist and writer residencies, the **Vacances Utiles** summer programme, film screenings, language classes;
- a sister structure in Paris, **Maison Gacha / Espace Culturel Gacha**.

### Audit of the old site (November 2026)
| Topic | Finding |
|---|---|
| Stack | WordPress **4.9.36** (2018), PHP **5.6** (end of life 2018), Yoast SEO 7.2, jQuery 1.12 + 3.2.1 + jQuery UI, OVH shared hosting |
| Speed | Homepage loads **~36 MB** of images (6 MB camera JPGs, 4 MB PNG screenshots), no caching headers, ~1 s time to first byte |
| Security | HTTP not redirected to HTTPS, mixed content, no security headers, version leaks (`x-powered-by`, generator tag), public `/readme.html`, **user list exposed** via `/wp-json/wp/v2/users`, `xmlrpc.php` reachable |
| Content | 26 pages, 228 posts (2013 → Jan 2025), 1,737 media files; the "English" switch shows French; activity reports stop at 2017; team page from 2020 |
| Last activity | Last post 14 Jan 2025; last page edit 9 Sep 2025 |

---

## 2. Target & decisions

| Area | Decision |
|---|---|
| Framework | **Next.js 16** (App Router, TypeScript), Turbopack |
| CMS / admin | **Payload CMS 3**, embedded in the same app at `/admin` |
| Database | **PostgreSQL 17** (local Docker in dev; Neon or Supabase in production — to decide) |
| Styling | **Tailwind CSS v4** with design tokens |
| Motion | **Motion** (Framer) + **Lenis** smooth scroll; every animation respects `prefers-reduced-motion` |
| Languages | **next-intl** — French at `/`, English at `/en`; Payload content localised FR/EN (FR fallback) |
| Media | Images re-encoded to **WebP** (max 2560 px) with 4 responsive sizes; served through `next/image` (AVIF/WebP) |
| Hosting | **Vercel**, domain kept at OVH (DNS switch at launch) |
| Donations | PayPal + bank transfer details (copy button); card / Mobile Money (Stripe or CinetPay) possible later |
| Villa booking | Booking **request** form (email + admin inbox), not a full booking engine |
| English content | Machine-translated draft, reviewed by the Foundation |

### Design direction
Editorial and gallery-like, rooted in **Ndop** (the indigo-and-white resist-dyed cloth of the Grassfields)
and West Cameroon earth tones.
- **Palette:** Ndop indigo `#1E2A55`, deep indigo `#121933`, ivory `#F7F3EC`, sand `#EDE4D3`, raffia `#D9C7A3`,
  terracotta `#B4532A`, forest `#2F4A3A`, ink `#1B1B1F`.
- **Type:** Fraunces (display serif) + Inter (text), fluid type scale.
- **Motifs:** seven Ndop patterns redrawn as SVG (dots, zigzag, diamonds, checker, moon, spider, ladder)
  and an emblem that draws itself on scroll.

---

## 3. Phase overview

| Phase | Scope | Status |
|---|---|---|
| 0 | Project setup | ✅ Done |
| 1 | Design system | ✅ Done |
| 2 | Content model + WordPress migration | ✅ Done |
| 3 | Public pages | 🟡 In progress |
| 4 | Forms, admin polish, live preview | ⏳ To do |
| 5 | English content, SEO, performance, accessibility | ⏳ To do |
| 6 | QA, deployment, DNS switch | ⏳ To do |

---

## 4. Phase details

### Phase 0 — Project setup ✅
**Goal:** a working Next.js + Payload + Postgres app with i18n and secure defaults.

Done:
- Scaffolded from Payload's blank template; Node 24 (`.nvmrc`), pnpm 10 pinned via `packageManager`.
- Local Postgres 17 in Docker (`gacha-postgres`, port 5434, persistent volume).
- next-intl routing: French unprefixed, English under `/en`, no automatic redirect from browser language;
  `src/proxy.ts` skips `/admin` and `/api`.
- Payload: FR/EN localisation, **admin / editor roles**, first account becomes admin, 5-attempt login lockout.
- Security headers (HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy), `x-powered-by` removed,
  strong `PAYLOAD_SECRET`.
- ESLint flat config fixed for Next 16; Playwright + Vitest set up.

### Phase 1 — Design system ✅
**Goal:** every visual building block, documented on one page.

Done (all in `src/components/`, visible at **`/styleguide`**, not indexed):
- Tokens and fluid type scale (`src/app/(frontend)/styles.css`), paper-grain utility.
- **Ndop**: `NdopPattern` (7 motifs), `NdopBand`, `NdopDraw` (self-drawing emblem).
- **Motion**: `SplitText` (word reveal), `ImageReveal` (clip-path curtain + zoom + parallax), `Reveal`,
  `Stagger`, `Parallax`, `Counter`, `Magnetic`, `Marquee`, `HorizontalScroll` (pinned horizontal track).
  All hydration-safe (`useSafeReducedMotion`) and disabled under reduced motion.
- **UI**: `Button` (sliding arrow), `ArrowLink`, `Section` / `Container` / `SectionHeading` / `Eyebrow`, `Tag`,
  cards (`ActivityCard`, `NewsCard`, `EventCard`, `RoomCard`, `TierCard`, `Quote`), `NewsletterForm`, `Logo` (placeholder).
- **Header**: transparent over dark heroes, solid on scroll, hides on scroll down; desktop mega menu (≥1280 px)
  with featured image; full-screen mobile menu with accordions; FR/EN switch; Donate button.
- **Footer**: contacts, hours, newsletter, link columns, Ndop band and emblem.

Bugs fixed during review: reduced-motion hydration mismatch; image reveal never opening (Chrome's
IntersectionObserver honours the element's own `clip-path`); hover-then-click closing the mega menu.

### Phase 2 — Content model + migration ✅
**Goal:** all old content editable in `/admin`, old URLs preserved.

**Content model** (admin in French):
| Group | Collections |
|---|---|
| Contenu | Actualités (news + agenda tab, drafts, autosave, versions), Pages (by path), Nos actions, Médiathèque |
| Classement | Thèmes (11 curated), Mots-clés (238 from WordPress) |
| Fondation | Équipe & bénévoles, Résidents, Partenaires |
| Séjourner | Chambres (Villa Boutanga, with price variants) |
| Ressources | Presse, Bilans d’activités |
| Administration | Utilisateurs, Redirections, Réglages du site (contacts, hours, visit prices, membership cards & perks, donation details — bank fields admin-only) |

Plus the SEO plugin (meta tab on posts/pages/actions) and the redirects plugin.

**Migration** (`pnpm migrate:wp`, idempotent — see README):
- Full REST export saved in `data/wp-export/` + `post-extras.json` (event-date lines and summaries scraped from
  each post page, which the old theme kept outside the API).
- HTML → Payload rich text: inline images → uploads, YouTube/podcast iframes → embed blocks, links to old pages
  rewritten to new paths, dead links → plain text, emoji images → emoji characters, tracking pixels dropped.
- Media re-encoded to WebP under ASCII file names.
- Event dates parsed ("Du 13 au 20 janvier 2025" → start/end), themes assigned by keyword.
- Structured data seeded from the old pages (`src/scripts/wp/seed.ts`).

**Result in the local database:**
| Content | Count |
|---|---|
| News posts | 228 / 228 (214 with cover, 184 with event dates, 225 with summary, all themed) |
| Pages | 12 |
| Nos actions | 8 |
| Media | 838 (≈700 MB incl. sizes, gitignored) |
| Team / residents / partners / rooms | 18 / 11 / 11 / 8 |
| Reports / press | 4 / 1 |
| Redirects (old URL → new) | 253 |

Known gap: ~55 files from 2013–2014 return 404 on the old server and cannot be recovered
(list written to `data/wp-cache/failed-media.txt`).

Checks: typecheck, lint, 7 Playwright e2e tests, 10 unit tests (date parsing, URL normalisation, slugs);
admin screens reviewed by screenshot; `/api/users` returns 403 to the public.

### Phase 3 — Public pages 🟡 In progress
**Goal:** the complete public website, driven by the CMS, in the new design.

Done so far:
- Data layer `src/lib/payload.ts` (cached queries with locale + FR fallback, media URL helpers, redirects lookup).
- `RichText` renderer with site typography (`.prose-gacha`), responsive images, safe embeds (YouTube via
  youtube-nocookie, Vimeo, Facebook, Libsyn, Spotify; anything else becomes a link).
- `PageHero` (dark hero with breadcrumbs, image or Ndop motif), `CmsImage` (focal point aware), post cards
  (featured, standard, compact) and event rows.
- **Homepage**: full-screen hero with parallax and split-text title, next/latest event chip, mission + aerial
  photo + president's quote, animated key figures, "Nos actions" pinned horizontal scroll, news (featured + list),
  agenda (when events are upcoming), Villa Boutanga feature with starting price, Ndop heritage section,
  partner marquee, donation call to action.
- Full FR/EN interface strings for all Phase 3 pages (`messages/*.json`), favicon, locale guard on pages.

Remaining:
- **News**: `/actualites` (theme + year filters, pagination, upcoming events on top) and `/actualites/[slug]`
  (hero, event dates/place, summary, rich text, share, related posts).
- **Nos actions**: `/actions` index and `/actions/[slug]` (content, highlights, related news, other actions).
- **CMS pages** via a catch-all route, with page-specific sections:
  - `fondation/equipe` → team & volunteers grid; `fondation` → president's word;
  - `sejourner/villa-boutanga` → rooms & prices, restaurant hours; `sejourner/visites` → visit prices, contacts;
  - `soutenir/don` → bank transfer (copy), PayPal, receipt; `soutenir/adhesion` → membership cards & perks;
  - `soutenir/partenaires` → partner grid; `ressources/bilans` → report downloads; `ressources/presse` → press;
  - `actions/residences` → residents list.
- **Hub pages**: `/sejourner`, `/soutenir`, `/ressources`; static pages `/contact`, `/soutenir/benevolat`,
  `/ressources/publications`, `/mentions-legales`; `/sejourner/restaurant` → Villa page anchor.
- **Old URLs**: catch-all checks the Redirections collection and issues 308 redirects.
- 404 page, `sitemap.xml`, `robots.txt`, metadata from the SEO fields, Open Graph images.
- Revalidation hooks so edits in the admin appear on the site immediately.
- Verification: production build, e2e tests for each template, desktop + mobile screenshots.

### Phase 4 — Forms, admin polish, live preview ⏳
- Payload form builder: contact, Villa booking request, membership, volunteering; submissions inbox + email
  notifications (email adapter: Resend or SMTP).
- Newsletter: connect to the existing Mailchimp list.
- Live preview and draft preview for posts, pages and actions.
- Navigation and footer as editable globals (today in `src/lib/site.ts`).
- Admin dashboard tweaks (quick links, recent posts), role review (editors cannot change bank details or users).
- Donation page: copy-to-clipboard for IBAN, PayPal link; optional online card / Mobile Money payments.

### Phase 5 — English, SEO, performance, accessibility ⏳
- English translations of all content (machine draft + review), `hreflang` alternates, localized slugs if wanted.
- Structured data (Organization, NGO, Event, Article, LodgingBusiness).
- Lighthouse ≥ 95 on all four scores; image budget; font subsetting.
- WCAG AA audit: contrast, focus order, keyboard menus, alt texts (many migrated alts are the post title).

### Phase 6 — QA & launch ⏳
- Production database (Neon or Supabase) and media storage (Cloudflare R2, S3 or Supabase Storage).
- Payload migrations for production (`payload migrate:create`), migrate local content to production.
- Vercel project, environment variables, preview deployments.
- Cross-device QA (including slow 3G from Cameroon), final content review with the Foundation.
- DNS switch at OVH, HTTPS only, redirects verified, old WordPress decommissioned.

---

## 5. Running the project

Requirements: Node 24 (`nvm use`), pnpm 10 (`corepack enable`), Docker.

```bash
# database (once)
docker run -d --name gacha-postgres -e POSTGRES_USER=gacha -e POSTGRES_PASSWORD=gacha_dev \
  -e POSTGRES_DB=gacha -p 5434:5432 -v gacha-pgdata:/var/lib/postgresql/data \
  --restart unless-stopped postgres:17-alpine

cp .env.example .env        # set DATABASE_URL and PAYLOAD_SECRET (openssl rand -hex 32)
pnpm install
pnpm migrate:wp             # import the old site (first run ~15 min)
pnpm dev -p 3005            # site http://localhost:3005, admin http://localhost:3005/admin
```

Tests: `pnpm lint`, `npx tsc --noEmit`, `pnpm test:int`, `npx playwright test`.

---

## 6. Repository map

```
src/
  app/(frontend)/[locale]/   public pages (home, styleguide, … Phase 3 routes)
  app/(payload)/             admin + REST/GraphQL API
  access/                    roles and published-only access
  collections/  globals/     Payload content model
  fields/  blocks/           slug, rich text, legacy fields; embed block
  components/                layout (header, footer, hero), motion, ndop, ui, content, media, RichText
  i18n/                      routing, request config, navigation, locale guard
  lib/                       payload queries, formatting, site navigation, cn
  scripts/migrate-wp.ts      WordPress import (helpers in scripts/wp/)
messages/                    FR/EN interface strings
data/wp-export/              old site export used by the import
scripts/wp/                  export download scripts
tests/                       Playwright e2e + Vitest unit tests
```

---

## 7. Open questions for the Foundation
1. **Logo**: a vector logo (SVG) to replace the placeholder emblem.
2. **Photos**: recent, high-quality photos (team, Villa rooms, workshops) and a portrait of Ly Dumas.
3. **Content to update**: activity reports after 2017, current team, 2025–2026 prices, upcoming events.
4. **English**: who reviews the translations.
5. **Payments**: is online card / Mobile Money donation wanted, and through which provider.
6. **Accounts**: Vercel, production database, media storage, and access to the OVH DNS for launch.
7. **Bank details**: confirm the IBAN shown on the old site is still the one to publish.
