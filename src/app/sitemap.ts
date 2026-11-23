import type { MetadataRoute } from 'next'

import { getActivities, getAllPages, getAllPostSlugs } from '@/lib/payload'

export const revalidate = 3600

const STATIC = ['', 'actualites', 'actions', 'sejourner', 'soutenir', 'ressources', 'contact', 'soutenir/benevolat', 'ressources/publications', 'mentions-legales']

/** Every public URL in French, with its English alternate. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fondationgacha.org').replace(/\/$/, '')
  const entry = (path: string, lastModified?: string, priority = 0.6): MetadataRoute.Sitemap[number] => {
    const clean = path.replace(/^\/+/, '')
    return {
      url: `${base}/${clean}`,
      lastModified: lastModified ? new Date(lastModified) : undefined,
      priority,
      alternates: { languages: { fr: `${base}/${clean}`, en: `${base}/en${clean ? `/${clean}` : ''}` } },
    }
  }

  const [pages, posts, activities] = await Promise.all([getAllPages(), getAllPostSlugs(), getActivities('fr')])

  return [
    ...STATIC.map((p) => entry(p, undefined, p === '' ? 1 : 0.7)),
    ...pages.map((p) => entry(p.path, p.updatedAt, 0.7)),
    ...activities.docs.map((a) => entry(`actions/${a.slug}`, a.updatedAt, 0.8)),
    ...posts.map((p) => entry(`actualites/${p.slug}`, p.updatedAt, 0.5)),
  ]
}
