import { defineRouting } from 'next-intl/routing'

export const locales = ['fr', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'fr'

export const routing = defineRouting({
  locales,
  defaultLocale,
  // French URLs stay unprefixed (/fondation), English gets /en/...
  localePrefix: 'as-needed',
  // French is the site's primary language: never auto-redirect on Accept-Language.
  localeDetection: false,
})
