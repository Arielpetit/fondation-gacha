/**
 * WordPress (fondationgacha.org) → Payload migration.
 * Idempotent: documents are matched on their WordPress id / slug / legacy URL, so it can be re-run.
 *
 *   node scripts/wp/fetch.mjs && node scripts/wp/fetch-extras.mjs   # refresh the export (optional)
 *   pnpm migrate:wp                                                   # import into the local database
 *
 * Flags: --limit=20 (posts only, for a quick trial)
 */
import { editorConfigFactory } from '@payloadcms/richtext-lexical'
import { getPayload, type Payload, type Where } from 'payload'

import config from '@payload-config'
import { contentEditor } from '@/fields/richText'

import { htmlToLexical, textToLexical, type ConvertContext } from './wp/html'
import {
  activityPath,
  cleanDateLabel,
  OLD_HOST,
  PAGE_MAP,
  parseDateLabel,
  plain,
  readExport,
  THEMES,
  type PostExtra,
  type WPPost,
  type WPTag,
} from './wp/lib'
import { createMediaImporter } from './wp/media'
import * as seed from './wp/seed'

// `payload run` rewrites argv, so read the flag from the environment or any argv position.
const limitArg = process.env.WP_LIMIT ?? process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1]
const LIMIT = limitArg ? Number(limitArg) : Infinity
const log = (...m: unknown[]) => console.log('›', ...m)

type Collection = Parameters<Payload['create']>[0]['collection']

/** Create or update the first document matching `where`. */
async function upsert(
  payload: Payload,
  collection: Collection,
  where: Where,
  data: Record<string, unknown>,
  opts: { draft?: boolean } = {},
): Promise<number> {
  const found = await payload.find({ collection, where, limit: 1, depth: 0, draft: true })
  const common = { collection, data, locale: 'fr' as const, depth: 0, context: { migration: true } }
  if (found.docs[0]) {
    const doc = await payload.update({ ...common, id: found.docs[0].id, draft: opts.draft })
    return doc.id as number
  }
  const doc = await payload.create({ ...common, draft: opts.draft })
  return doc.id as number
}

const summarize = (text: string, max = 280) => {
  const t = plain(text).replace(/\s*\[…\]|\s*\[&hellip;\]/g, '')
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  return cut.slice(0, cut.lastIndexOf(' ')) + '…'
}

async function run() {
  const payload = await getPayload({ config })
  const started = Date.now()

  const posts = readExport<WPPost[]>('posts').sort((a, b) => a.date.localeCompare(b.date))
  const pages = readExport<WPPost[]>('pages')
  const tags = readExport<WPTag[]>('tags')
  const extras = readExport<Record<string, PostExtra>>('post-extras')

  const media = createMediaImporter(payload)
  const editorConfig = await editorConfigFactory.fromEditor({ config: payload.config, editor: contentEditor })

  // ── Link rewriting ────────────────────────────────────────────────────────
  const pagePathOf = (link: string) =>
    link.replace(OLD_HOST, '').split(/[?#]/)[0].replace(/^\/+|\/+$/g, '')
  const postSlugs = new Set(posts.map((p) => p.slug))

  const rewriteLink = async (href: string): Promise<string> => {
    if (!OLD_HOST.test(href)) return href
    const p = pagePathOf(href)
    if (p.startsWith('wp-content/uploads/')) {
      const id = await media.fromUrl(href)
      return (id && media.publicUrl(id)) || ''
    }
    const mapped = PAGE_MAP[p]
    if (mapped) return '/' + (mapped.kind === 'activity' ? activityPath(mapped.to) : mapped.to)
    if (postSlugs.has(p)) return `/actualites/${p}`
    const file = media.attachmentFileUrl(p)
    if (file) {
      const id = await media.fromUrl(file)
      return (id && media.publicUrl(id)) || ''
    }
    return '/' + p
  }

  const convert = (html: string, altFallback: string) =>
    htmlToLexical(html, { editorConfig, media, rewriteLink, altFallback } satisfies ConvertContext)

  // ── Taxonomies ───────────────────────────────────────────────────────────
  log('Themes & tags')
  const themeIds = new Map<string, number>()
  for (const t of THEMES) {
    const id = await upsert(payload, 'themes', { slug: { equals: t.slug } }, { title: t.fr, slug: t.slug, tone: t.tone })
    await payload.update({ collection: 'themes', id, locale: 'en', data: { title: t.en } })
    themeIds.set(t.slug, id)
  }
  const tagIds = new Map<number, number>()
  for (const t of tags.filter((t) => t.count > 0)) {
    tagIds.set(t.id, await upsert(payload, 'tags', { wpId: { equals: t.id } }, { title: plain(t.name), slug: t.slug, wpId: t.id }))
  }

  // ── Posts ────────────────────────────────────────────────────────────────
  // WP_ONLY=5862,7449 re-imports just those WordPress posts.
  const only = process.env.WP_ONLY?.split(',').map(Number)
  const selected = only
    ? posts.filter((p) => only.includes(p.id))
    : posts.slice(-Math.min(LIMIT, posts.length))
  log(`Posts: ${selected.length}`)
  let done = 0
  const queue = [...selected]
  const postIds = new Map<number, number>()

  async function importPost(post: WPPost) {
    const title = plain(post.title.rendered)
    const extra = extras[post.id] ?? { dateLabel: null, summary: null }
    const { start, end } = parseDateLabel(extra.dateLabel)
    const haystack = `${title} ${plain(post.content.rendered).slice(0, 600)}`
    const themes = THEMES.filter((t) => t.match.test(title)).map((t) => themeIds.get(t.slug)!)
    if (!themes.length) {
      const fromBody = THEMES.find((t) => t.match.test(haystack))
      // Nothing matched: file it under general Foundation news so every post has a theme.
      themes.push(themeIds.get(fromBody?.slug ?? 'fondation')!)
    }

    const id = await upsert(
      payload,
      'posts',
      { 'legacy.wpId': { equals: post.id } },
      {
        title,
        slug: post.slug.replace(/%e2%80%8b/gi, ''),
        summary: extra.summary || summarize(post.excerpt.rendered),
        cover: post.featured_media ? await media.fromWpId(post.featured_media, title) : null,
        content: await convert(post.content.rendered, title),
        publishedAt: new Date(post.date).toISOString(),
        eventStart: start ?? null,
        eventEnd: end ?? null,
        eventLabel: cleanDateLabel(extra.dateLabel) ?? null,
        themes: themes.slice(0, 3),
        tags: post.tags.map((t) => tagIds.get(t)).filter(Boolean),
        legacy: { wpId: post.id, url: post.link },
        _status: 'published',
      },
    )
    postIds.set(post.id, id)
    done++
    process.stdout.write(`\r  ${done}/${selected.length} posts · media +${media.stats.imported} (reused ${media.stats.reused})   `)
  }

  await Promise.all(
    Array.from({ length: 3 }, async () => {
      while (queue.length) {
        const post = queue.shift()!
        try {
          await importPost(post)
        } catch (e) {
          console.error(`\n  ✗ post ${post.id} ${post.slug}: ${(e as Error).message}`)
        }
      }
    }),
  )
  process.stdout.write('\n')

  // ── Pages & activities ──────────────────────────────────────────────────
  log('Pages & activities')
  const maisonPost = posts.find((p) => p.slug === 'creation-de-la-maison-gacha')
  for (const page of pages) {
    const oldPath = pagePathOf(page.link)
    const target = PAGE_MAP[oldPath]
    if (!target || target.kind === 'section') continue
    const meta = seed.PAGE_TITLES[target.to] ?? { title: plain(page.title.rendered) }
    let html = page.content.rendered
    if (!plain(html) && target.to === 'maison-gacha' && maisonPost) html = maisonPost.content.rendered
    const content = await convert(html, meta.title)
    const firstImage = html.match(/<img[^>]+src="([^"]+)"/)?.[1]
    const image = firstImage ? await media.fromUrl(firstImage, meta.title) : null
    const intro = summarize(html.split(/<\/p>/)[0] ?? '', 240)

    if (target.kind === 'activity') {
      await upsert(
        payload,
        'activities',
        { slug: { equals: target.to } },
        {
          title: meta.title,
          slug: target.to,
          summary: intro || meta.title,
          cover: image,
          content,
          order: meta.order ?? 0,
          motif: meta.motif ?? 'dots',
          legacy: { wpId: page.id, url: page.link },
          _status: 'published',
        },
      )
    } else {
      await upsert(
        payload,
        'pages',
        { path: { equals: target.to } },
        {
          title: meta.title,
          path: target.to,
          slug: target.to.split('/').pop(),
          hero: { eyebrow: meta.eyebrow, intro, image },
          content,
          legacy: { wpId: page.id, url: page.link },
          _status: 'published',
        },
      )
    }
  }

  // ── Structured data ─────────────────────────────────────────────────────
  log('Settings, team, residents, partners, rooms')
  await payload.updateGlobal({ slug: 'settings', locale: 'fr', data: seed.settings, context: { migration: true } })

  for (const [i, m] of seed.team.entries()) {
    await upsert(payload, 'team', { name: { equals: m.name } }, { ...m, order: i })
  }
  for (const r of seed.residents) {
    await upsert(payload, 'residents', { name: { equals: r.name } }, r)
  }
  for (const [i, p] of seed.partners.entries()) {
    await upsert(payload, 'partners', { name: { equals: p.name } }, { ...p, order: i })
  }
  const villaImages = await Promise.all(
    [
      'https://www.fondationgacha.org/wp-content/uploads/2022/01/NA_A6819.jpg',
      'https://www.fondationgacha.org/wp-content/uploads/2022/01/NA_A6740.jpg',
      'https://www.fondationgacha.org/wp-content/uploads/2022/01/NA_A6799.jpg',
    ].map((u) => media.fromUrl(u, 'Villa Boutanga')),
  )
  for (const [i, r] of seed.rooms.entries()) {
    await upsert(payload, 'rooms', { name: { equals: r.name } }, { ...r, order: i, images: villaImages.filter(Boolean) })
  }

  // Reports: PDFs linked from the old "bilans d'activités" page.
  const bilans = pages.find((p) => p.slug === 'bilans-dactivites')
  for (const m of bilans?.content.rendered.matchAll(/href="([^"]+)"[^>]*>([^<]*20(\d\d)[^<]*)</g) ?? []) {
    const fileUrl = /\.pdf$/i.test(m[1]) ? m[1] : media.attachmentFileUrl(pagePathOf(m[1]))
    const file = fileUrl ? await media.fromUrl(fileUrl, plain(m[2])) : null
    const year = 2000 + Number(m[3])
    await upsert(payload, 'reports', { year: { equals: year } }, { title: `Bilan d’activités ${year}`, year, file })
  }

  // Press: the press kit PDF and the official films.
  const presse = pages.find((p) => p.slug === 'presse')
  const kit = presse?.content.rendered.match(/href="([^"]+DOSSIER-DE-PRESSE[^"]+\.pdf)"/i)?.[1]
  if (kit) {
    await upsert(payload, 'press', { title: { equals: 'Dossier de presse — février 2022' } }, {
      title: 'Dossier de presse — février 2022',
      outlet: 'Fondation Jean-Félicien Gacha',
      date: '2022-02-01T12:00:00.000Z',
      file: await media.fromUrl(kit, 'Dossier de presse'),
    })
  }

  // ── Redirects (old URLs → new paths) ────────────────────────────────────
  log('Redirects')
  // Rebuilt from scratch on each run so renamed slugs never leave stale entries.
  await payload.delete({ collection: 'redirects', where: { from: { exists: true } }, context: { migration: true } })
  const redirect = (from: string, to: string) =>
    upsert(payload, 'redirects', { from: { equals: from } }, { from, to: { type: 'custom', url: to } })
  // Use the slug actually stored (the slug field normalises and may shorten it).
  const stored = await payload.find({
    collection: 'posts',
    where: { 'legacy.wpId': { exists: true } },
    limit: 1000,
    depth: 0,
    draft: true,
    select: { slug: true, legacy: true },
  })
  const slugByWpId = new Map(stored.docs.map((d) => [d.legacy?.wpId, d.slug]))
  for (const post of posts) {
    const slug = slugByWpId.get(post.id)
    if (slug) await redirect(`/${decodeURIComponent(post.slug)}/`, `/actualites/${slug}`)
  }
  for (const [from, target] of Object.entries(PAGE_MAP)) {
    await redirect(`/${from}/`, '/' + (target.kind === 'activity' ? activityPath(target.to) : target.to))
  }

  // ── Report ──────────────────────────────────────────────────────────────
  const count = async (c: Collection) => (await payload.count({ collection: c })).totalDocs
  const summary = {
    posts: await count('posts'),
    pages: await count('pages'),
    activities: await count('activities'),
    media: await count('media'),
    themes: await count('themes'),
    tags: await count('tags'),
    team: await count('team'),
    residents: await count('residents'),
    partners: await count('partners'),
    rooms: await count('rooms'),
    reports: await count('reports'),
    press: await count('press'),
    redirects: await count('redirects'),
  }
  console.table(summary)
  log(`Media imported ${media.stats.imported}, reused ${media.stats.reused}, renamed ${media.stats.renamed}, failed ${media.stats.failed.length}`)
  if (media.stats.failed.length) {
    // Full list kept next to the download cache (gitignored) for reference.
    const fs = await import('node:fs')
    fs.writeFileSync('data/wp-cache/failed-media.txt', media.stats.failed.join('\n') + '\n')
    log('Missing files listed in data/wp-cache/failed-media.txt')
  }
  log(`Done in ${Math.round((Date.now() - started) / 1000)}s`)
  // Silence unused warning for seeded helper kept for later phases.
  void textToLexical
  process.exit(0)
}

// Awaited at top level: `payload run` exits as soon as the module finishes evaluating.
try {
  await run()
} catch (e) {
  console.error(e)
  process.exit(1)
}
