import type { ReactNode } from 'react'

import { getTranslations } from 'next-intl/server'

import { ArrowRight, Mail, Phone } from '@/components/ui/icons'
import { Container } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { cn } from '@/lib/cn'
import { telHref } from '@/lib/format'
import { getNavigation } from '@/lib/navigation'
import { contact } from '@/lib/site'

/**
 * The one layout for every long text page (pages, actions, news):
 * text column aligned with the page title on the left, sticky sidebar on the right.
 */
export function ReadingLayout({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <Container className="grid gap-14 lg:grid-cols-12 lg:gap-10">
      <div className="min-w-0 lg:col-span-7">{children}</div>
      {aside && (
        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="flex flex-col gap-6 lg:sticky lg:top-28">{aside}</div>
        </aside>
      )}
    </Container>
  )
}

/** "In this section": the other pages of the same menu entry, current one highlighted. */
export async function SectionNav({ locale, current, links }: { locale: Locale; current: string; links?: { label: string; href: string }[] }) {
  const t = await getTranslations('common')
  let items = links
  if (!items) {
    const nav = await getNavigation(locale)
    const parent = nav.find((n) => n.children.some((c) => c.href === current) || n.href === current)
    items = parent?.children ?? []
  }
  if (items.length < 2) return null
  return (
    <nav aria-label={t('inThisSection')} className="rounded-3xl border border-line bg-paper p-6">
      <p className="eyebrow text-accent">{t('inThisSection')}</p>
      <ul className="mt-4 flex flex-col">
        {items.map((l) => {
          const active = l.href === current
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] transition-colors duration-300',
                  active ? 'bg-sand font-medium text-ink' : 'text-muted hover:bg-sand/60 hover:text-ink',
                )}
              >
                {l.label}
                <ArrowRight
                  className={cn(
                    'size-4 shrink-0 transition-all duration-500 ease-out-expo',
                    active ? 'text-accent' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100',
                  )}
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Small contact card closing every sidebar. */
export async function HelpCard({ locale }: { locale: Locale }) {
  const t = await getTranslations('common')
  return (
    <div className="relative overflow-hidden rounded-3xl bg-indigo-ndop p-6 text-ivory dark:bg-indigo-soft">
      <p className="font-display text-xl">{t('helpTitle')}</p>
      <p className="mt-2 text-sm text-ivory/70">{t('helpText')}</p>
      <ul className="mt-5 space-y-2 text-sm">
        <li>
          <a href={telHref(contact.phone)} className="inline-flex items-center gap-2 text-ivory/85 hover:text-ivory">
            <Phone className="size-4 text-raffia" />
            {contact.phone}
          </a>
        </li>
        <li>
          <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 text-ivory/85 hover:text-ivory">
            <Mail className="size-4 text-raffia" />
            {contact.email}
          </a>
        </li>
      </ul>
      <Link
        href="/contact"
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-full bg-ivory px-4 text-sm font-medium text-indigo-ndop transition-transform duration-500 ease-out-expo hover:-translate-y-0.5"
        locale={locale}
      >
        {t('contactUs')}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  )
}
