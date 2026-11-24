import type { Metadata } from 'next'

import { mediaSrc, type ImageLike } from '@/lib/payload'

type Seo = { title?: string | null; description?: string | null; image?: ImageLike } | null | undefined

/**
 * Page metadata from a document's SEO tab, falling back to its own title/summary.
 * `path` is the French path without locale ("actualites/slug"); English lives under /en.
 */
export function buildMetadata({
  seo,
  title,
  description,
  image,
  path,
  locale,
  type = 'website',
}: {
  seo?: Seo
  title: string
  description?: string | null
  image?: ImageLike
  path: string
  locale: string
  type?: 'website' | 'article'
}): Metadata {
  const clean = path.replace(/^\/+|\/+$/g, '')
  const fr = `/${clean}`
  const en = `/en${clean ? `/${clean}` : ''}`
  const ogImage = mediaSrc(seo?.image || image, 'wide')
  const desc = seo?.description || description || undefined

  return {
    // SEO titles from the plugin already end with "— Fondation Gacha".
    title: seo?.title ? { absolute: seo.title } : title,
    description: desc,
    alternates: { canonical: locale === 'en' ? en : fr, languages: { fr, en, 'x-default': fr } },
    openGraph: {
      type,
      title: seo?.title || title,
      description: desc,
      // Pages without a photo of their own share the branded default image.
      images: [{ url: ogImage ?? '/og-default.jpg', ...(ogImage ? {} : { width: 1200, height: 630, alt: 'Fondation Jean-Félicien Gacha — Bangoulap, Cameroun' }) }],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.title || title,
      description: desc,
      images: [ogImage ?? '/og-default.jpg'],
    },
  }
}
