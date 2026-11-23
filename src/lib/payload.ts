import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { getPayload, type Where } from 'payload'
import { cache } from 'react'

import type { Locale } from '@/i18n/routing'
import type { Activity, Media, Page, Post } from '@/payload-types'

export const payload = cache(async () => getPayload({ config: configPromise }))

type L = { locale: Locale }
const base = (locale: Locale) => ({ locale, fallbackLocale: 'fr' as const, overrideAccess: false })

/**
 * Query options for a single document: in draft mode (enabled only for logged-in staff by /next/preview)
 * the latest draft is returned; otherwise only published content.
 */
async function docOptions(locale: Locale) {
  let draft = false
  try {
    draft = (await draftMode()).isEnabled
  } catch {
    // Outside a request (build, sitemap): published content only.
  }
  return { locale, fallbackLocale: 'fr' as const, draft, overrideAccess: draft }
}

// ── Media helpers ───────────────────────────────────────────────────────────
export type ImageLike = Media | number | null | undefined

export const asMedia = (m: ImageLike): Media | null => (m && typeof m === 'object' ? m : null)

/** Host-independent file path ("/api/media/file/x.webp"), so next/image treats it as local. */
export function mediaSrc(m: ImageLike, size?: 'thumb' | 'card' | 'wide' | 'hero'): string | null {
  const media = asMedia(m)
  if (!media) return null
  const url = (size && media.sizes?.[size]?.url) || media.url
  if (!url) return null
  return url.replace(/^https?:\/\/[^/]+/, '')
}

export const isImage = (m: ImageLike) => Boolean(asMedia(m)?.mimeType?.startsWith('image/'))

// ── Settings ────────────────────────────────────────────────────────────────
export const getSettings = cache(async (locale: Locale) =>
  (await payload()).findGlobal({ slug: 'settings', ...base(locale), depth: 0 }),
)

// ── News & agenda ───────────────────────────────────────────────────────────
export const POSTS_PER_PAGE = 12

export const getPosts = cache(
  async (locale: Locale, opts: { page?: number; theme?: string; year?: number; limit?: number } = {}) => {
    const p = await payload()
    const and: Where[] = []
    if (opts.theme) {
      const theme = await p.find({ collection: 'themes', where: { slug: { equals: opts.theme } }, limit: 1, depth: 0 })
      and.push({ themes: { in: theme.docs.map((t) => t.id) } })
    }
    if (opts.year) {
      and.push({ publishedAt: { greater_than_equal: `${opts.year}-01-01T00:00:00.000Z` } })
      and.push({ publishedAt: { less_than: `${opts.year + 1}-01-01T00:00:00.000Z` } })
    }
    return p.find({
      collection: 'posts',
      ...base(locale),
      where: and.length ? { and } : undefined,
      sort: '-publishedAt',
      page: opts.page ?? 1,
      limit: opts.limit ?? POSTS_PER_PAGE,
      depth: 1,
      select: { title: true, slug: true, summary: true, cover: true, publishedAt: true, themes: true, eventStart: true, eventEnd: true, eventLabel: true, place: true },
    })
  },
)

/** Events whose end (or start) is today or later, soonest first. */
export const getUpcomingEvents = cache(async (locale: Locale, limit = 4) => {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const now = today.toISOString()
  return (await payload()).find({
    collection: 'posts',
    ...base(locale),
    where: { or: [{ eventEnd: { greater_than_equal: now } }, { and: [{ eventEnd: { exists: false } }, { eventStart: { greater_than_equal: now } }] }] },
    sort: 'eventStart',
    limit,
    depth: 1,
  })
})

/** Most recent past events, for the agenda when nothing is upcoming. */
export const getRecentEvents = cache(async (locale: Locale, limit = 4) =>
  (await payload()).find({
    collection: 'posts',
    ...base(locale),
    where: { eventStart: { exists: true } },
    sort: '-eventStart',
    limit,
    depth: 1,
  }),
)

export const getPost = cache(async (locale: Locale, slug: string) => {
  const res = await (await payload()).find({
    collection: 'posts',
    ...(await docOptions(locale)),
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return (res.docs[0] as Post | undefined) ?? null
})

export const getRelatedPosts = cache(async (locale: Locale, post: Post, limit = 3) => {
  const themeIds = (post.themes ?? []).map((t) => (typeof t === 'object' ? t.id : t))
  return (await payload()).find({
    collection: 'posts',
    ...base(locale),
    where: { and: [{ id: { not_equals: post.id } }, ...(themeIds.length ? [{ themes: { in: themeIds } }] : [])] },
    sort: '-publishedAt',
    limit,
    depth: 1,
  })
})

export const getThemes = cache(async (locale: Locale) =>
  (await payload()).find({ collection: 'themes', ...base(locale), limit: 50, sort: 'title', depth: 0 }),
)

/** Distinct publication years, newest first. */
export const getPostYears = cache(async () => {
  const p = await payload()
  const [newest, oldest] = await Promise.all([
    p.find({ collection: 'posts', sort: '-publishedAt', limit: 1, depth: 0, select: { publishedAt: true } }),
    p.find({ collection: 'posts', sort: 'publishedAt', limit: 1, depth: 0, select: { publishedAt: true } }),
  ])
  const to = new Date(newest.docs[0]?.publishedAt ?? Date.now()).getFullYear()
  const from = new Date(oldest.docs[0]?.publishedAt ?? Date.now()).getFullYear()
  return Array.from({ length: to - from + 1 }, (_, i) => to - i)
})

export const getAllPostSlugs = cache(async () => {
  const res = await (await payload()).find({ collection: 'posts', limit: 1000, depth: 0, select: { slug: true, updatedAt: true } })
  return res.docs
})

// ── Activities ──────────────────────────────────────────────────────────────
export const getActivities = cache(async (locale: Locale) =>
  (await payload()).find({ collection: 'activities', ...base(locale), sort: 'order', limit: 20, depth: 1 }),
)

export const getActivity = cache(async (locale: Locale, slug: string) => {
  const res = await (await payload()).find({
    collection: 'activities',
    ...(await docOptions(locale)),
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  return (res.docs[0] as Activity | undefined) ?? null
})

// ── Pages ───────────────────────────────────────────────────────────────────
export const getPage = cache(async (locale: Locale, path: string) => {
  const res = await (await payload()).find({
    collection: 'pages',
    ...(await docOptions(locale)),
    where: { path: { equals: path } },
    limit: 1,
    depth: 2,
  })
  return (res.docs[0] as Page | undefined) ?? null
})

export const getAllPages = cache(async () => {
  const res = await (await payload()).find({ collection: 'pages', limit: 200, depth: 0, select: { path: true, updatedAt: true } })
  return res.docs
})

// ── Directory ───────────────────────────────────────────────────────────────
const list = <C extends 'team' | 'residents' | 'partners' | 'rooms' | 'reports' | 'press'>(collection: C, sort: string) =>
  cache(async (locale: Locale) => (await payload()).find({ collection, ...base(locale), sort, limit: 200, depth: 1 }))

export const getTeam = list('team', 'order')
export const getResidents = list('residents', '-year')
export const getPartners = list('partners', 'order')
export const getRooms = list('rooms', 'order')
export const getReports = list('reports', '-year')
export const getPress = list('press', '-date')

// ── Forms ───────────────────────────────────────────────────────────────────
export const getForm = cache(async (locale: Locale, slug: string) => {
  const res = await (await payload()).find({
    collection: 'forms',
    ...base(locale),
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return res.docs[0] ?? null
})

// ── Redirects (old WordPress URLs) ──────────────────────────────────────────
export const findRedirect = cache(async (path: string) => {
  const clean = '/' + path.replace(/^\/+|\/+$/g, '')
  const res = await (await payload()).find({
    collection: 'redirects',
    where: { or: [{ from: { equals: clean } }, { from: { equals: `${clean}/` } }] },
    limit: 1,
    depth: 0,
  })
  const r = res.docs[0]
  return r?.to?.type === 'custom' ? r.to.url : null
})

export type { L }
