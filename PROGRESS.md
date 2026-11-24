# Fondation Jean-Félicien Gacha — redesign progress & handover

_Last updated: 24 November 2026 (after the pre-launch design polish)_

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
  terracotta `#A24A25` (darkened in Phase 5 for contrast), forest `#2F4A3A`, ink `#1B1B1F`.
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
| 3 | Public pages | ✅ Done |
| 4 | Forms, admin polish, live preview | ✅ Done |
| 5 | English content, SEO, performance, accessibility | ✅ Done |
| 6 | QA, deployment, DNS switch | ⏳ Next |

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

### Phase 3 — Public pages ✅
**Goal:** the complete public website, driven by the CMS, in the new design.

Building blocks:
- Data layer `src/lib/payload.ts` (cached queries with locale + FR fallback, media URL helpers, redirects lookup).
- `RichText` renderer with site typography (`.prose-gacha`), responsive images, safe embeds (YouTube via
  youtube-nocookie, Vimeo, Facebook, Libsyn, Spotify; anything else becomes a link).
- `PageHero` (dark hero with breadcrumbs, image or Ndop motif), `CmsImage` (focal-point aware), post cards
  (featured, standard, compact), event rows, share links, copy-to-clipboard fields.
- Metadata helper (SEO tab → title/description/Open Graph, FR/EN alternates); JSON-LD on articles (NewsArticle / Event).

Pages:
| Route | Content |
|---|---|
| `/` | Hero with parallax + split-text title and next/latest event chip; mission + aerial photo; president's quote; animated key figures; "Nos actions" pinned horizontal scroll; news (featured + compact list); agenda when events are upcoming; Villa Boutanga feature with starting price; Ndop heritage; partner marquee; donation call to action |
| `/actualites` | Upcoming events, theme and year filters (links, no JS needed), result count, pagination |
| `/actualites/[slug]` | Hero with cover, dates/place card, themes, share (Facebook, WhatsApp, email, copy), summary lead, rich text, related posts |
| `/actions`, `/actions/[slug]` | Alternating editorial list with Ndop accents; detail with content, highlights, residents list (Résidences), related news, other actions |
| CMS pages (catch-all) | `fondation`, `fondation/infrastructures`, `fondation/equipe` (team grid), `sejourner/villa-boutanga` (rooms + Villa contact), `sejourner/visites` (visit prices + contacts), `sejourner/boutique`, `soutenir/don` (IBAN/BIC copy, PayPal, receipt), `soutenir/adhesion` (membership cards), `soutenir/partenaires` (partner grid), `ressources/presse`, `ressources/bilans` (PDF downloads), `maison-gacha` |
| Code-only pages | Hubs `/sejourner`, `/soutenir`, `/ressources`; `/contact` (contacts + OpenStreetMap), `/soutenir/benevolat`, `/ressources/publications`, `/mentions-legales`; `/sejourner/restaurant` → Villa page |
| System | Styled 404, `sitemap.xml` (258 URLs with FR/EN alternates), `robots.txt`, favicon |

Behaviour:
- **Old URLs**: any unknown path is looked up in Redirections and answered with a permanent redirect
  (e.g. `/activites/sante-et-social/` → `/actions/sante-social`, `/<post>/` → `/actualites/<post>`).
- **Caching**: homepage and indexes revalidate every 10 min; detail pages are rendered on first visit and cached
  (ISR, ~10 ms per cached hit in production); any change saved in the admin refreshes the site immediately
  (`src/hooks/revalidate.ts`).
- Header is transparent over every page's dark hero and turns solid on scroll.

Checks: production build passes; typecheck and lint clean; **14 Playwright e2e tests** (homepage FR/EN, mobile menu,
styleguide, news filters + pagination, article, actions, structured sections, old-URL redirects, 404, sitemap,
admin) and **10 unit tests** pass; desktop (1440 px) and mobile (390 px) screenshots reviewed, no horizontal
overflow, no console errors.

Known limitations (planned for later phases):
- English pages show French content until translations are entered (Phase 5); interface text is translated.
- The newsletter field and the membership/donation buttons use email links until forms exist (Phase 4).
- Some migrated pages still contain the old text alongside the new structured sections (e.g. the Villa room
  list); editors can trim the old text in the admin.
- Photos in `public/images/sg/` (hero, hubs) are taken from the old site; replace with new photography when available.

### Phase 4 — Forms, admin polish, live preview ✅
**Goal:** visitors can contact, book, join and subscribe from the site; editors manage menus and preview drafts.

**Forms** (Payload form builder, admin group *Formulaires*):
| Form (slug) | Where | Sent to |
|---|---|---|
| Contact (`contact`) | `/contact` | contact@fondationgacha.org |
| Villa booking request (`reservation-villa`) — dates, guests, room, restaurant | `/sejourner/villa-boutanga#reserver`, homepage "Réserver" | villa@fondationgacha.org |
| Membership (`adhesion`) — card choice | `/soutenir/adhesion#adherer` (the card buttons scroll to it) | donations & volunteering |
| Volunteering (`benevolat`) | `/soutenir/benevolat` | donations & volunteering |
| Donation receipt (`recu-don`) | `/soutenir/don#recu` | donations & volunteering |

- Labels in French and English; editors can change fields, recipients and confirmation texts in the admin.
- Every submission is stored in **Messages reçus** (staff only) and emailed with a filled-in subject
  (e.g. "Demande de réservation — Name (2027-01-10 → 2027-01-12)") and the visitor's address as reply-to.
- Spam protection: hidden honeypot field, 8 submissions / 10 min per IP, 5,000-character limit.
- `pnpm seed:forms` (re)creates the five forms.

**Email:** SMTP through `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`EMAIL_FROM` (any provider: Brevo, Resend SMTP,
OVH mail…). Without SMTP (local dev) emails are printed in the server console.

**Newsletter:** the footer field posts to `/api-site/newsletter`; addresses are stored in **Abonnés newsletter**
(private, duplicates ignored, honeypot, rate limit) and mirrored to the existing Mailchimp list when
`MAILCHIMP_API_KEY` + `MAILCHIMP_LIST_ID` are set.

**Editable menu:** new global **Menu du site** (sections, sub-links with descriptions, featured image card,
"show in footer"), FR/EN. Header mega menu, mobile menu and footer columns read it; the built-in menu is the
fallback. `pnpm seed:nav` resets it.

**Draft preview & live preview:** the admin's eye icon opens a side-by-side live preview (mobile / tablet / desktop)
that refreshes on every autosave; the preview button opens the page in draft mode with a "Mode aperçu" bar.
`/next/preview` only works for logged-in staff and only redirects to paths on this site; the public always sees
the published version.

**Admin dashboard:** welcome block with "Nouvelle actualité" and "Voir le site", counters (messages in the last
7 days, drafts, subscribers) and the latest edited posts and messages.

Checks: production build (pages still cached), typecheck, lint, **21 e2e tests** (+7: form rendering and
validation, booking form, membership anchor, English labels, newsletter validation and privacy, honeypot
rejection, preview protection), 10 unit tests. Manually verified: a booking submission is stored and the email
is addressed to villa@ with the right subject; draft edits are visible only in preview mode.

Still open:
- SMTP credentials and the Mailchimp API key must be provided (Phase 6 environment).
- PayPal donation link: add the URL in *Réglages du site → Dons* when the Foundation provides it.
- Online card / Mobile Money payments: not built; decide provider first.

### Phase 5 — English, SEO, performance, accessibility ✅
**Goal:** a real English site, strong search presence, fast on Cameroonian mobile networks, accessible to all.

**English content** (written by hand from the French; no translation service was available):
| Content | English |
|---|---|
| Interface, menus, forms, footer | 100 % |
| 12 pages, 8 actions | 100 % — text translated block by block, images/videos/links kept |
| Rooms, partners, team roles, residents, reports, themes | 100 % |
| News titles | 228 / 228 |
| News summaries | 2021–2025 (59 posts); older summaries stay French |
| News event dates | 185, generated in English from the dates |
| News article bodies | French (≈220,000 characters) — English pages show a notice and mark the text `lang="fr"` |

Tooling: `I18N=export pnpm i18n` writes `data/i18n/fr.json`; translations live in `data/i18n/en-*.json`
(and French corrections in `fr-*.json`); `I18N=import pnpm i18n` applies them. Block counts are checked so a
translation can never scramble a page. Weak French page intros inherited from the old site were rewritten.

**SEO:** structured data — NGO + WebSite on every page, BreadcrumbList on content pages, LodgingBusiness with room
offers on the Villa page, NewsArticle / Event on news; `hreflang` fr / en / x-default and self-canonicals;
Open Graph locale data and a generated default share image (1200×630) for pages without a photo; sitemap and
robots from Phase 3.

**Performance** (Lighthouse 12, production build; mobile = simulated slow 4G + 4× CPU):
| Page | Mobile before → after | Desktop after |
|---|---|---|
| Home | 63 → 79 | 96 |
| Article | 60 → 81 | — |
| Villa Boutanga | 56 → 75 | 88 |
| Actions (EN) | 58 → 83 | — |
| News list | — → 84 | — |

Changes: hero titles and intros now animate in pure CSS on first paint (LCP no longer waits for JavaScript);
Motion loaded through `LazyMotion` (lighter `m` components); only the menu's translation strings are sent to the
browser; Lenis smooth scroll loaded after hydration in its own chunk; counter animation without the animation
engine; display font reduced to one variable axis; no layout shift (CLS 0) anywhere.
What remains on mobile is mostly React's own hydration cost; further gains would need fewer client components
on long pages (e.g. server-rendered cards without motion wrappers).

**Accessibility:** Lighthouse accessibility 100 on all audited pages; **axe WCAG 2.1 AA: 0 violations** on 15 pages
(FR + EN) and the mobile menu, now part of the test suite. Fixes: terracotta darkened to `#A24A25` (all small text
≥ 4.5:1, white on terracotta 5.4:1), logo and language-switch accessible names match their visible text, valid
definition list for event dates, heading order on the news list, `lang` on untranslated text.

Checks: **37 e2e tests** (+16 accessibility), 10 unit tests, typecheck, lint, production build.

Still open for the Foundation:
- Translating older news summaries and full article bodies (the tooling is ready).
- Reviewing the English texts.
- Better alt texts: many migrated images use the post title.
- About 200 straight apostrophes remain inside migrated article bodies (most already use ’).
- Partner logos still missing for Les Amis du Chœur Madrigal du Cameroun, Afro-Polis and IAM Intense Art Magazine;
  please check the 8 logos found are the current official ones.

### Pre-launch design polish ✅
**Goal:** a last design, UX and motion review before hosting, with a dark theme.

**Dark theme.** Light/dark switch in the header and in the mobile menu; the first visit follows the system
setting, the choice is then remembered. A small script in `<head>` applies the theme before the first paint
(no flash). Surfaces and text use theme-aware tokens (`canvas`, `paper`, `sand`, `ink`, `muted`, `line`,
`accent`); brand colours (indigo, ivory, terracotta, raffia) stay the same in both themes. The dark palette
("Ndop at night": deep indigo surfaces, warm cream text, a lighter terracotta for text accents) keeps WCAG AA
contrast.

**Images.** Consecutive images in an article or page become a gallery (grid) with a lightbox: keyboard (Esc,
arrows), swipe on phones, focus returns to the image. News articles have a plain title header and show the cover
(often an event poster) in full, only when the article has no images of its own; a reading-progress bar sits at
the top of the page.

**Villa Boutanga.** Rebuilt page: intro text with photo gallery, a price list grouped into rooms and suites
(capacity, price variants), a restaurant block (opening hours editable in *Paramètres du site → Horaires du
restaurant*) and the booking form, linked from every "Réserver" button.

**Motion and details.** Short fade-up on every page change (pure CSS, off with reduced motion); heavier hero
titles; footer columns fixed at 1024 px; partner strip, buttons, tags, cards and forms adapted to the dark theme;
no horizontal scroll at 360 / 768 / 1024 / 1440 px (the Actions list no longer widens the page on phones
while its images slide in).

**Typography.** Large display titles cap Fraunces' optical size at 72: at its maximum the hairlines vanished and
"e" read as "c" on big screens. Interface texts use typographic apostrophes (’). Single images in articles and pages
now keep their own proportions, with no beige bars around portrait photos.

**Admin.** Branded login screen (emblem, Foundation name, short welcome text, soft brand background, fade-in),
sidebar emblem, brand colours on primary buttons (indigo; raffia in dark mode), Fraunces titles and Inter text.
The dashboard greets the editor by first name, offers quick links (news, pages, media library, menu, settings),
shows counters (messages this week, draft news, newsletter subscribers) and the latest news and messages; it works
in light and dark mode and on phones. No account exists yet: the first account created at `/admin` becomes
administrator.

Checks: **44 e2e tests** (axe WCAG 2.1 AA: 0 violations on 15 pages in the light theme and 6 in the dark theme,
plus a theme-toggle test), 10 unit tests, typecheck, lint, production build. A one-off axe pass on 9 more pages in
the dark theme also found 0 violations. Third-party embeds (YouTube iframes) are left out of the axe checks because
their markup is outside our control. Lighthouse (mobile, production build): accessibility, best practices and SEO
100 on 5 pages; performance unchanged from Phase 5 within measurement noise.

### Design pass 2 — homepage, layout consistency, motion ✅
Based on the Foundation's feedback and the motion language of the Bangangté site.

- **Homepage hero** no longer fills the screen with one photo: text on the left (title, intro, buttons, three key
  figures), and on the right an arch-shaped frame with a sharp photo of the heritage huts draped in Ndop cloth.
  The arch rises into place, the photo settles, then two cards (latest event, Villa Boutanga price) pop in and
  float gently, next to a terracotta seal whose ring of text turns slowly.
- **"Huit chantiers"**: the pinned horizontal scroll is replaced by a rounded bento grid (one large card, four
  small, one wide, two small). Hover zooms the photo, turns the arrow and reveals the short text. Four actions had
  blurry 1200×380 banners as covers; they now use sharp photos (2000 px) from their own pages or the media library.
- **Partners**: tiles that drift slowly and pause on hover. Each tile shows the partner's logo when one is uploaded
  (*Partenaires → Logo* in the admin), otherwise a monogram and the name.
- **Rounded design**: images and cards use soft 16–24 px corners everywhere instead of sharp edges.
- **One layout for every text page** (pages, actions, news): the text column starts on the same line as the page
  title, with a sticky sidebar on the right ("Dans cette rubrique" links, highlights or article details, and a
  contact card). Empty headings left over from the old site are removed; section titles get a short accent line.
- **Header**: a soft pill glides under the hovered menu item; *Contact* added to the menu; spacing adjusted so
  the full menu fits from 1280 px.

### Design pass 3 — lighter, calmer, sharper ✅
- **Menu: 5 entries** (La Fondation, Nos actions, Actualités, Séjourner, Soutenir). *La Fondation* now also
  holds Maison Gacha, Presse, Bilans d’activités and Publications; *Contact* is a discreet link next to the
  language switch (and a button in the mobile menu). Run `pnpm seed:nav` to reset the menu to this structure.
- **Slimmer header** (64 px) and **compact page headers**: title on the left, the photo on the right in a rounded
  frame that opens on load, instead of a tall, darkened full-width photo.
- **Smaller type and cards**: display sizes, lead text, section spacing and the homepage cards were all reduced.
- **Full width**: text pages use 8 of 12 columns plus the sidebar; large landscape photos fill the text column,
  small ones are never enlarged.
- **Sharper images**: Next.js image quality raised from 75 to 85 for every photo.
- **New photo** on the homepage: a wide panorama of ochre buildings in the Bangoulap hills (the source is only
  828×552, so it was enlarged 2× with sharpening; a higher-resolution original would look better).
- News filters scroll sideways with a faded edge instead of being cut off.

### Design pass 4 — hero, partner logos, plain page headers ✅
- **Homepage hero** is shorter (no longer full-screen) and closer to the Bangangté site: aerial photo of the
  Foundation site and Le Jacaranda in a frame woven with a Ndop zigzag, two floating cards and the turning seal.
  The heritage-hut photo moved to the mission section.
- **Real partner logos** for 8 of the 11 partners, uploaded to the media library and linked in *Partenaires → Logo*:
  MINEFOP (minefop.gov.cm), AGIR abcd (agirabcd.org, white text recoloured navy), Institut français du Cameroun
  (old site), La Route des Chefferies (routedeschefferies.com), Université des Montagnes (udm.aed-cm.org),
  ICOM (Wikimedia Commons), Musée du quai Branly – Jacques Chirac (quaibranly.fr), Dexeus Mujer (dexeus.com).
  No logo found yet for Les Amis du Chœur Madrigal du Cameroun, Afro-Polis and IAM Intense Art Magazine; they
  keep a monogram tile. Logos show in colour on white tiles (also in dark mode).
- **Page headers have no photo any more**: breadcrumb, title and intro on indigo; photos stay in the page body.
- **"Dans cette rubrique" box removed** from the sidebar (the menu already lists those pages).
- **Soutenir dropdown** now has a featured photo like the other menus.
- Gallery tiles use a 4:3 crop so small photos are not enlarged into tall, blurry cells.

### Design pass 5 — collage, logos, contact map, instant pages ✅
- **Mission section** rebuilt as text + photo collage (team photo, resident with horse, Dexeus Mujer prize ceremony,
  floating "2002" badge), with the president's quote shortened beside her portrait; less empty space.
- **Villa section** now uses the hills photo (the building) with the terrace overlapping; the separate panorama band is gone.
- **Partners**: logos only, no cards (white pill behind them in dark mode); partners without a logo show a monogram + name.
- **Contact**: the map sits under the intro, next to the form; no header photo.
- **Production speed**: every content page (all pages, all actions, the 40 latest news per language) is now
  **pre-rendered at build time** (152 pages) and refreshed through ISR when the admin saves; pages answer in 15–30 ms
  locally. Older articles are rendered on first visit, then cached. `/actualites` stays dynamic because of its filters.
- Fixed a bug found by the production build: the old `/ressources` hub depended on the removed menu entry.
- Admin access: open `/admin`. While no account exists, the first one created there becomes administrator.

### Design pass 6 — real logos, people, rooms, gallery, socials ✅
- **Real logos**: the Foundation's house logo (from the old theme) in header, footer, hero seal, admin login/sidebar,
  favicon and structured data; the Villa Boutanga logo (extracted from the 2024 price poster) on the homepage Villa
  section and the Villa page. Both are drawn through a CSS mask so they follow the theme colour.
- **Team portraits** from the old team page (14 people + president) as portrait cards; Pierre Tchomobe and William
  Kuihane have no photo yet (monogram).
- **Room photos**: the Villa page shows the three room photos (cropped from the price poster, the only room
  pictures available). Better originals should be uploaded.
- **Photo gallery** `/galerie` (under La Fondation): albums (Foundation, each action, Villa & Jacaranda, events),
  filter chips, lightbox, “show more”; built from every photo already in pages and news.
- **Socials** in the footer: Facebook, Instagram (`espaceculturelgacha`, from the old content) and the YouTube channel.
- Audit: all 836 old-site images were already in the media library.

### Design pass 7 — admin redesign, slow partner strip ✅
- **Admin** is still **Payload CMS 3** (rebuilding the editor, media library, drafts, translations, live preview and
  access control from scratch would be slower and riskier), but its screens are now custom:
  split-screen login (Foundation logo and site photo on the left, form on the right), deep-indigo sidebar with a
  brand block and rounded links, a new dashboard view (greeting, four key figures, latest news with thumbnails and
  status, latest messages, and icon cards grouped by task), softer cards, tables and fields, light and dark mode.
- **Partners**: logos drift slowly again (no cards); the Route des Chefferies logo was removed (text tile).
- The admin database is the same Postgres as the site: once `DATABASE_URL` points to Supabase, the admin works on it.

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
