import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { PageHero } from '@/components/layout/PageHero'
import { CmsImage } from '@/components/media/CmsImage'
import { Reveal } from '@/components/motion'
import { NdopPattern, type NdopMotif } from '@/components/ndop/NdopPattern'
import { ArrowRight } from '@/components/ui/icons'
import { Container, Section } from '@/components/ui/Section'
import { pageLocale } from '@/i18n/params'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { buildMetadata } from '@/lib/metadata'
import { getActivities } from '@/lib/payload'

export const revalidate = 600

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await pageLocale(params)
  const t = await getTranslations({ locale, namespace: 'actions' })
  return buildMetadata({ title: t('title'), description: t('intro'), path: 'actions', locale })
}

export default async function ActionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await pageLocale(params)
  const t = await getTranslations('actions')
  const tc = await getTranslations('common')
  const activities = await getActivities(locale)

  return (
    <>
      <PageHero eyebrow={t('title')} title={t('title')} intro={t('intro')} imageSrc="/images/sg/atelier-perlage.webp" />

      {/* overflow-x-clip: images sliding in from the side must not widen the page on phones. */}
      <Section tone="ivory" spacing="lg" className="overflow-x-clip">
        <Container className="flex flex-col gap-24 lg:gap-32">
          {activities.docs.map((a, i) => {
            const flip = i % 2 === 1
            return (
              <article key={a.id} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
                <Reveal
                  direction={flip ? 'left' : 'right'}
                  className={cn('relative lg:col-span-7', flip && 'lg:order-2 lg:col-start-6')}
                >
                  <Link href={`/actions/${a.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-indigo-deep">
                    <CmsImage
                      media={a.cover}
                      sizes="(min-width: 1024px) 55vw, 100vw"
                      className="transition-transform duration-[1.4s] ease-out-expo group-hover:scale-105"
                    />
                  </Link>
                  <div
                    className={cn(
                      'absolute -bottom-6 hidden size-28 rounded-2xl bg-terracotta p-3 text-ivory/80 sm:block',
                      flip ? '-left-6' : '-right-6',
                    )}
                    aria-hidden
                  >
                    <NdopPattern motif={(a.motif as NdopMotif) ?? 'dots'} scale={0.6} />
                  </div>
                </Reveal>
                <Reveal className={cn('lg:col-span-5', flip && 'lg:order-1 lg:col-span-5 lg:col-start-1')}>
                  <p className="font-display text-display-sm text-accent">{String(i + 1).padStart(2, '0')}</p>
                  <h2 className="mt-3 font-display text-display-md font-light text-balance">
                    <Link href={`/actions/${a.slug}`} className="hover:text-indigo-soft dark:hover:text-raffia">
                      {a.title}
                    </Link>
                  </h2>
                  <p className="mt-5 text-lead text-muted">{a.summary}</p>
                  <Link
                    href={`/actions/${a.slug}`}
                    className="group mt-8 inline-flex items-center gap-3 font-medium"
                  >
                    <span className="inline-flex size-11 items-center justify-center rounded-full bg-indigo-ndop text-ivory transition-transform duration-500 ease-out-expo group-hover:scale-110">
                      <ArrowRight className="size-5" />
                    </span>
                    {tc('discover')}
                  </Link>
                </Reveal>
              </article>
            )
          })}
        </Container>
      </Section>
    </>
  )
}
