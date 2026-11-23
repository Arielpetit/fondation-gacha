import { getTranslations } from 'next-intl/server'
import { cache } from 'react'

import type { Locale } from '@/i18n/routing'
import { mediaSrc, payload } from '@/lib/payload'
import { navigation as fallbackNav, t } from '@/lib/site'

/** Menu item with labels already resolved for one locale (safe to pass to client components). */
export type ResolvedNavItem = {
  id: string
  label: string
  href: string
  inFooter: boolean
  children: { label: string; href: string; description?: string }[]
  feature?: { image: string; alt: string; title: string; text: string; href: string }
}

/** Menu from the "Menu du site" global; falls back to the built-in menu (src/lib/site.ts) when empty. */
export const getNavigation = cache(async (locale: Locale): Promise<ResolvedNavItem[]> => {
  const p = await payload()
  const nav = await p.findGlobal({ slug: 'navigation', locale, fallbackLocale: 'fr', depth: 1 })

  if (nav.items?.length) {
    return nav.items.map((item, i) => {
      const img = item.feature?.image
      const src = mediaSrc(img, 'card')
      return {
        id: item.id ?? `item-${i}`,
        label: item.label,
        href: item.href,
        inFooter: item.inFooter ?? true,
        children: (item.children ?? []).map((c) => ({ label: c.label, href: c.href, description: c.description ?? undefined })),
        feature:
          src && item.feature?.href
            ? {
                image: src,
                alt: (typeof img === 'object' && img?.alt) || '',
                title: item.feature.title ?? '',
                text: item.feature.text ?? '',
                href: item.feature.href,
              }
            : undefined,
      }
    })
  }

  const tn = await getTranslations({ locale, namespace: 'nav' })
  return fallbackNav.map((item) => ({
    id: item.key,
    label: tn(item.key),
    href: item.href,
    inFooter: ['foundation', 'actions', 'stay', 'support'].includes(item.key),
    children: (item.children ?? []).map((c) => ({
      label: t(c.label, locale),
      href: c.href,
      description: c.description ? t(c.description, locale) : undefined,
    })),
    feature: item.feature
      ? {
          image: item.feature.image,
          alt: t(item.feature.alt, locale),
          title: t(item.feature.title, locale),
          text: t(item.feature.text, locale),
          href: item.feature.href,
        }
      : undefined,
  }))
})
