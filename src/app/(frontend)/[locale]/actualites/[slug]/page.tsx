import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { PostCard } from '@/components/content/PostCards'
import { ShareLinks } from '@/components/content/ShareLinks'
import { PageHero } from '@/components/layout/PageHero'
import { Reveal, Stagger, StaggerItem } from '@/components/motion'
import { RichText } from '@/components/RichText'
import { ArrowLink } from '@/components/ui/Button'
import { Clock, MapPin } from '@/components/ui/icons'
import { Container, Section, SectionHeading } from '@/components/ui/Section'
import { Tag } from '@/components/ui/Tag'
import { pageLocale } from '@/i18n/params'
import { Link } from '@/i18n/navigation'
import { eventLabel, formatDate } from '@/lib/format'
import { buildMetadata } from '@/lib/metadata'
import { getPost, getRelatedPosts } from '@/lib/payload'
import type { Theme } from '@/payload-types'

export const revalidate = 600

/** Rendered on first request, then cached (ISR) and refreshed by the CMS revalidation hooks. */
export function generateStaticParams() {
  return []
}

type Params = Promise<{ locale: string; slug: string }>

type LexNode = { text?: string; children?: LexNode[] }
const normalize = (s: string) => s.replace(/\s+/g, ' ').trim().toLowerCase()
/** Plain text of the first few blocks of a rich-text document. */
const leadingText = (content: unknown) => {
  const walk = (n: LexNode): string => n.text ?? (n.children ?? []).map(walk).join(' ')
  const root = (content as { root?: LexNode } | null)?.root
  return normalize((root?.children ?? []).slice(0, 4).map(walk).join(' '))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = await pageLocale(params)
  const { slug } = await params
  const post = await getPost(locale, slug)
  if (!post) return {}
  return buildMetadata({
    seo: post.meta,
    title: post.title,
    description: post.summary,
    image: post.cover,
    path: `actualites/${post.slug}`,
    locale,
    type: 'article',
  })
}

export default async function PostPage({ params }: { params: Params }) {
  const locale = await pageLocale(params)
  const { slug } = await params
  const post = await getPost(locale, decodeURIComponent(slug))
  if (!post) notFound()

  const t = await getTranslations('common')
  const tn = await getTranslations('nav')
  const tnews = await getTranslations('news')
  const related = await getRelatedPosts(locale, post)
  const themes = (post.themes ?? []).filter((x): x is Theme => typeof x === 'object')
  const when = post.eventStart ? eventLabel(post, locale) : null
  // Migrated posts often open with the summary text itself: don't print it twice.
  const showLead = Boolean(post.summary) && !leadingText(post.content).includes(normalize(post.summary!).slice(0, 80))
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fondationgacha.org'
  const url = `${base}${locale === 'en' ? '/en' : ''}/actualites/${post.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': post.eventStart ? 'Event' : 'NewsArticle',
    ...(post.eventStart
      ? {
          name: post.title,
          startDate: post.eventStart,
          endDate: post.eventEnd ?? post.eventStart,
          location: { '@type': 'Place', name: post.place || 'Fondation Jean-Félicien Gacha', address: 'Bangoulap, Cameroun' },
          organizer: { '@type': 'NGO', name: 'Fondation Jean-Félicien Gacha', url: base },
        }
      : { headline: post.title, datePublished: post.publishedAt, dateModified: post.updatedAt }),
    description: post.summary ?? undefined,
  }

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        eyebrow={themes[0]?.title ?? tn('news')}
        title={post.title}
        image={post.cover}
        crumbs={[{ href: '/actualites', label: tn('news') }]}
      >
        <p className="text-sm text-ivory/70">{t('published', { date: formatDate(post.publishedAt, locale) })}</p>
      </PageHero>

      <Section tone="ivory" spacing="md">
        <Container className="grid gap-12 lg:grid-cols-12">
          <aside className="order-2 lg:order-1 lg:col-span-3">
            <div className="flex flex-col gap-6 lg:sticky lg:top-28">
              {(when || post.place) && (
                <dl className="space-y-4 rounded-sm bg-sand p-5 text-sm">
                  {when && (
                    <div className="flex gap-3">
                      <Clock className="mt-0.5 size-5 shrink-0 text-terracotta" />
                      <div>
                        <dt className="eyebrow text-[0.65rem] text-muted">{tnews('when')}</dt>
                        <dd className="mt-1 first-letter:uppercase">{when}</dd>
                      </div>
                    </div>
                  )}
                  {post.place && (
                    <div className="flex gap-3">
                      <MapPin className="mt-0.5 size-5 shrink-0 text-terracotta" />
                      <div>
                        <dt className="eyebrow text-[0.65rem] text-muted">{tnews('where')}</dt>
                        <dd className="mt-1">{post.place}</dd>
                      </div>
                    </div>
                  )}
                </dl>
              )}
              {themes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {themes.map((th) => (
                    <Link key={th.id} href={`/actualites?theme=${th.slug}`}>
                      <Tag tone="terracotta">{th.title}</Tag>
                    </Link>
                  ))}
                </div>
              )}
              <ShareLinks title={post.title} url={url} labels={{ share: t('share'), copy: t('copy'), copied: t('copied') }} />
            </div>
          </aside>

          <div className="order-1 min-w-0 lg:order-2 lg:col-span-8 lg:col-start-5">
            {showLead && (
              <Reveal>
                <p className="mb-10 font-display text-display-sm font-light text-balance text-ink">{post.summary}</p>
              </Reveal>
            )}
            <RichText data={post.content as never} className="max-w-[44rem]" />
            <div className="mt-16 border-t border-line pt-8">
              <ArrowLink href="/actualites">{t('backToNews')}</ArrowLink>
            </div>
          </div>
        </Container>
      </Section>

      {related.docs.length > 0 && (
        <Section tone="paper" spacing="md">
          <Container>
            <SectionHeading title={t('related')} size="sm" />
            <Stagger className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.docs.map((p) => (
                <StaggerItem key={p.id}>
                  <PostCard post={p} locale={locale} />
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>
      )}
    </article>
  )
}
