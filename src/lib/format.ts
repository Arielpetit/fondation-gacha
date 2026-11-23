import type { Post } from '@/payload-types'

export const formatDate = (iso: string, locale: string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...opts }).format(new Date(iso))

/** "13 – 20 janvier 2025" / "Samedi 12 décembre 2026". */
export function formatEventRange(locale: string, start?: string | null, end?: string | null) {
  if (!start) return ''
  const s = new Date(start)
  if (!end || end.slice(0, 10) === start.slice(0, 10)) {
    return formatDate(start, locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }
  return new Intl.DateTimeFormat(locale, { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).formatRange(s, new Date(end))
}

/** Label shown for an event: the editor's text, or one computed from the dates. */
export const eventLabel = (post: Pick<Post, 'eventLabel' | 'eventStart' | 'eventEnd'>, locale: string) =>
  post.eventLabel || formatEventRange(locale, post.eventStart, post.eventEnd)

export const formatPrice = (value: number, locale: string) => new Intl.NumberFormat(locale).format(value)

/** Phone string "+237 695 85 60 95" → "tel:+237695856095". */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

export const splitPhones = (phones?: string | null) =>
  (phones ?? '')
    .split('/')
    .map((p) => p.trim())
    .filter(Boolean)
