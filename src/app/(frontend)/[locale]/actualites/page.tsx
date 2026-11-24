import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { EventRow, PostCard } from '@/components/content/PostCards'
import { PageHero } from '@/components/layout/PageHero'
import { Reveal, Stagger, StaggerItem } from '@/components/motion'
import { ArrowRight } from '@/components/ui/icons'
import { Container, Section, SectionHeading } from '@/components/ui/Section'
import { pageLocale } from '@/i18n/params'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { getPostYears, getPosts, getThemes, getUpcomingEvents } from '@/lib/payload'

export const revalidate = 600

type Search = { theme?: string; year?: string; page?: string }

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await pageLocale(params)
  const t = await getTranslations({ locale, namespace: 'news' })
  return { title: t('title'), description: t('intro'), alternates: { canonical: '/actualites' } }
}

/** Builds a filter URL keeping the other filters, resetting the page. */
const hrefWith = (current: Search, patch: Partial<Search>) => {
  const q = new URLSearchParams()
  const next = { ...current, page: undefined, ...patch }
  for (const [k, v] of Object.entries(next)) if (v) q.set(k, String(v))
  const s = q.toString()
  return `/actualites${s ? `?${s}` : ''}`
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'inline-flex h-9 shrink-0 items-center rounded-full border px-4 text-sm whitespace-nowrap transition-colors',
        active ? 'border-indigo-ndop bg-indigo-ndop text-ivory' : 'border-ink/15 hover:border-ink',
      )}
    >
      {children}
    </Link>
  )
}

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Search>
}) {
  const locale = await pageLocale(params)
  const search = await searchParams
  const t = await getTranslations('news')
  const tn = await getTranslations('nav')

  const page = Math.max(1, Number(search.page) || 1)
  const year = Number(search.year) || undefined
  const filtered = Boolean(search.theme || year)

  const [posts, themes, years, upcoming] = await Promise.all([
    getPosts(locale, { page, theme: search.theme, year }),
    getThemes(locale),
    getPostYears(),
    getUpcomingEvents(locale, 6),
  ])

  return (
    <>
      <PageHero eyebrow={tn('news')} title={t('title')} intro={t('intro')} motif="dots" />

      {upcoming.docs.length > 0 && page === 1 && !filtered && (
        <Section tone="paper" spacing="md">
          <Container>
            <SectionHeading eyebrow={t('upcoming')} title={t('upcoming')} size="sm" />
            <div className="mt-8 border-b border-line">
              {upcoming.docs.map((e) => (
                <EventRow key={e.id} post={e} locale={locale} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section tone="ivory" spacing="md" id="liste">
        <Container>
          {/* Filters */}
          <div className="flex flex-col gap-5 border-b border-line pb-8">
            <div className="flex items-center gap-3">
              <span className="eyebrow w-20 shrink-0 text-muted">{t('theme')}</span>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pr-10 pb-1 [scrollbar-width:none] [mask-image:linear-gradient(to_right,black_calc(100%-3rem),transparent)]">
                <Chip href={hrefWith(search, { theme: undefined })} active={!search.theme}>
                  {t('allThemes')}
                </Chip>
                {themes.docs.map((th) => (
                  <Chip key={th.id} href={hrefWith(search, { theme: th.slug ?? undefined })} active={search.theme === th.slug}>
                    {th.title}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="eyebrow w-20 shrink-0 text-muted">{t('year')}</span>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pr-10 pb-1 [scrollbar-width:none] [mask-image:linear-gradient(to_right,black_calc(100%-3rem),transparent)]">
                <Chip href={hrefWith(search, { year: undefined })} active={!year}>
                  {t('allYears')}
                </Chip>
                {years.map((y) => (
                  <Chip key={y} href={hrefWith(search, { year: String(y) })} active={year === y}>
                    {y}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          <h2 className="sr-only">{t('title')}</h2>
          <div className="mt-8 flex items-center justify-between text-sm text-muted" aria-live="polite">
            <span>{t('results', { count: posts.totalDocs })}</span>
            {filtered && (
              <Link href="/actualites" className="underline underline-offset-4 hover:text-ink">
                {t('reset')}
              </Link>
            )}
          </div>

          {posts.docs.length === 0 ? (
            <p className="py-24 text-center text-lead text-muted">{t('noResults')}</p>
          ) : (
            <Stagger key={`${search.theme}-${year}-${page}`} className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {posts.docs.map((p, i) => (
                <StaggerItem key={p.id} className={cn(i === 0 && page === 1 && !filtered && 'sm:col-span-2')}>
                  <PostCard post={p} locale={locale} featured={i === 0 && page === 1 && !filtered} />
                </StaggerItem>
              ))}
            </Stagger>
          )}

          {posts.totalPages > 1 && (
            <Reveal>
              <nav aria-label="Pagination" className="mt-20 flex items-center justify-between border-t border-line pt-8">
                {posts.hasPrevPage ? (
                  <Link href={hrefWith(search, { page: page - 1 > 1 ? String(page - 1) : undefined })} className="group inline-flex items-center gap-2 font-medium">
                    <ArrowRight className="size-4 rotate-180 transition-transform group-hover:-translate-x-1" />
                    {t('previous')}
                  </Link>
                ) : (
                  <span />
                )}
                <span className="text-sm text-muted">{t('page', { page, total: posts.totalPages })}</span>
                {posts.hasNextPage ? (
                  <Link href={hrefWith(search, { page: String(page + 1) })} className="group inline-flex items-center gap-2 font-medium">
                    {t('next')}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            </Reveal>
          )}
        </Container>
      </Section>
    </>
  )
}
