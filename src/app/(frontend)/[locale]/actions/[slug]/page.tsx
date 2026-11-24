import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { PostCard } from '@/components/content/PostCards'
import { ResidentsList } from '@/components/content/sections'
import { PageHero } from '@/components/layout/PageHero'
import { CmsImage } from '@/components/media/CmsImage'
import { Reveal, Stagger, StaggerItem } from '@/components/motion'
import { HelpCard, ReadingLayout } from '@/components/layout/ReadingLayout'
import { RichText } from '@/components/RichText'
import { ArrowLink } from '@/components/ui/Button'
import { Container, Section, SectionHeading } from '@/components/ui/Section'
import { pageLocale } from '@/i18n/params'
import { Link } from '@/i18n/navigation'
import { buildMetadata } from '@/lib/metadata'
import { getActivities, getActivity, getPosts, getResidents } from '@/lib/payload'

export const revalidate = 600

/** Rendered on first request, then cached (ISR) and refreshed by the CMS revalidation hooks. */
export function generateStaticParams() {
  return []
}

/** Which news theme best matches each action, for the "related news" strip. */
const THEME_FOR: Record<string, string> = {
  education: 'education',
  'formation-professionnelle': 'education',
  artisanat: 'artisanat',
  culture: 'cinema',
  residences: 'residences',
  environnement: 'nature',
  'sante-social': 'sante-social',
  'tourisme-solidaire': 'nature',
}

type Params = Promise<{ locale: string; slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = await pageLocale(params)
  const { slug } = await params
  const a = await getActivity(locale, slug)
  if (!a) return {}
  return buildMetadata({ seo: a.meta, title: a.title, description: a.summary, image: a.cover, path: `actions/${a.slug}`, locale })
}

export default async function ActionPage({ params }: { params: Params }) {
  const locale = await pageLocale(params)
  const { slug } = await params
  const action = await getActivity(locale, slug)
  if (!action) notFound()

  const t = await getTranslations('actions')
  const tc = await getTranslations('common')
  const tn = await getTranslations('nav')
  const [all, news, residents] = await Promise.all([
    getActivities(locale),
    getPosts(locale, { theme: THEME_FOR[slug], limit: 3 }),
    slug === 'residences' ? getResidents(locale) : Promise.resolve(null),
  ])
  const others = all.docs.filter((a) => a.id !== action.id)

  return (
    <>
      <PageHero
        eyebrow={tn('actions')}
        title={action.title}
        intro={action.summary}
        image={action.cover}
        crumbs={[{ href: '/actions', label: tn('actions') }]}
      />

      <Section tone="ivory" spacing="md">
        <ReadingLayout
          aside={
            <>
              {action.highlights && action.highlights.length > 0 && (
                <div className="rounded-3xl bg-indigo-ndop p-7 text-ivory dark:bg-indigo-soft">
                  <p className="eyebrow text-raffia">{t('highlights')}</p>
                  <ul className="mt-5 space-y-3.5">
                    {action.highlights.map((h) => (
                      <li key={h.id} className="flex gap-3 text-ivory/85">
                        <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-raffia" />
                        {h.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <HelpCard locale={locale} />
            </>
          }
        >
          <RichText data={action.content as never} locale={locale} />
        </ReadingLayout>
      </Section>

      {residents && residents.docs.length > 0 && <ResidentsList residents={residents.docs} />}

      {news.docs.length > 0 && (
        <Section tone="paper" spacing="md">
          <Container>
            <SectionHeading title={t('news')} size="sm" action={<ArrowLink href={`/actualites?theme=${THEME_FOR[slug]}`}>{tc('seeAll')}</ArrowLink>} />
            <Stagger className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {news.docs.map((p) => (
                <StaggerItem key={p.id}>
                  <PostCard post={p} locale={locale} />
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>
      )}

      <Section tone="sand" spacing="md">
        <Container>
          <SectionHeading title={t('other')} size="sm" action={<ArrowLink href="/actions">{tc('allActions')}</ArrowLink>} />
          <div className="-mx-[var(--gutter)] mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4">
            {others.map((a) => (
              <Reveal key={a.id} className="w-[70vw] shrink-0 snap-start sm:w-[40vw] lg:w-[22rem]">
                <Link href={`/actions/${a.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-indigo-deep">
                    <CmsImage media={a.cover} sizes="360px" className="transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105" />
                  </div>
                  <p className="mt-4 font-display text-xl group-hover:underline group-hover:underline-offset-4">{a.title}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>
    </>
  )
}
