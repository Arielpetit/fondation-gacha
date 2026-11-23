import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { EventRow, PostCard } from '@/components/content/PostCards'
import { CmsImage } from '@/components/media/CmsImage'
import { Counter, ImageReveal, Magnetic, Marquee, Parallax, Reveal, SplitText, Stagger, StaggerItem } from '@/components/motion'
import { HorizontalScroll } from '@/components/motion/HorizontalScroll'
import { NdopDraw } from '@/components/ndop/NdopDraw'
import { NdopBand, NdopPattern } from '@/components/ndop/NdopPattern'
import { ArrowLink, Button } from '@/components/ui/Button'
import { Quote } from '@/components/ui/cards'
import { Container, Eyebrow, Section, SectionHeading } from '@/components/ui/Section'
import { pageLocale } from '@/i18n/params'
import { Link } from '@/i18n/navigation'
import { formatPrice } from '@/lib/format'
import {
  getActivities,
  getPage,
  getPartners,
  getPosts,
  getRecentEvents,
  getResidents,
  getRooms,
  getUpcomingEvents,
} from '@/lib/payload'

export const revalidate = 600

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await pageLocale(params)
  const t = await getTranslations('home')
  const tc = await getTranslations('common')

  const [activities, news, upcoming, recent, partners, residents, rooms, presentation] = await Promise.all([
    getActivities(locale),
    getPosts(locale, { limit: 4 }),
    getUpcomingEvents(locale, 4),
    getRecentEvents(locale, 4),
    getPartners(locale),
    getResidents(locale),
    getRooms(locale),
    getPage(locale, 'fondation'),
  ])

  const events = upcoming.docs.length ? upcoming.docs : recent.docs
  const [featured, ...latest] = news.docs
  const minPrice = Math.min(...rooms.docs.map((r) => r.price))

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-indigo-deep text-ivory">
        <Parallax speed={-0.6} className="absolute inset-0 -z-20">
          <Image src="/images/sg/case-sunset.webp" alt="" fill priority sizes="100vw" className="scale-110 object-cover opacity-75" />
        </Parallax>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-indigo-deep via-indigo-deep/45 to-indigo-deep/20" />

        <Container className="pt-40 pb-14 sm:pb-20">
          <Reveal immediate delay={0.1}>
            <Eyebrow dark>Bangoulap · Ouest-Cameroun</Eyebrow>
          </Reveal>
          <SplitText
            as="h1"
            animateOnMount
            delay={0.15}
            stagger={0.05}
            duration={0.85}
            text={t('tagline')}
            className="mt-6 max-w-5xl font-display text-display-xl font-[360] text-balance"
          />
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
            <Reveal immediate delay={0.4} className="lg:col-span-6">
              <p className="text-lead text-pretty text-ivory/80">{t('intro')}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Magnetic>
                  <Button href="/fondation" variant="light" arrow size="lg">
                    {t('discover')}
                  </Button>
                </Magnetic>
                <Button href="/soutenir/don" variant="outline-light" size="lg">
                  {t('support')}
                </Button>
              </div>
            </Reveal>
            {events[0] && (
              <Reveal immediate delay={0.55} className="lg:col-span-4 lg:col-start-9">
                <Link
                  href={`/actualites/${events[0].slug}`}
                  className="group block rounded-sm border border-ivory/20 bg-indigo-deep/40 p-5 backdrop-blur-md transition-colors hover:bg-indigo-deep/70"
                >
                  <p className="eyebrow text-raffia">{upcoming.docs.length ? t('agendaTitle') : t('agendaRecent')}</p>
                  <p className="mt-3 font-display text-xl leading-snug">{events[0].title}</p>
                  <p className="mt-2 text-sm text-ivory/65">{events[0].eventLabel}</p>
                </Link>
              </Reveal>
            )}
          </div>
          <div className="mt-14 hidden items-center gap-3 text-xs tracking-[0.25em] text-ivory/50 uppercase sm:flex" aria-hidden>
            <span className="relative block h-10 w-px overflow-hidden bg-ivory/20">
              <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2s_ease-in-out_infinite] bg-ivory motion-reduce:animate-none" />
            </span>
            {t('scroll')}
          </div>
        </Container>
      </section>

      {/* ── Mission & president ─────────────────────────────────────── */}
      <Section tone="ivory" labelledBy="mission">
        <Container className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <SectionHeading id="mission" eyebrow={t('missionEyebrow')} title={t('missionTitle')} size="lg" />
            <Reveal className="mt-8 max-w-xl text-lead text-muted">{t('missionText')}</Reveal>
            <Reveal className="mt-8">
              <ArrowLink href="/fondation">{t('discover')}</ArrowLink>
            </Reveal>
          </div>
          <div className="relative lg:col-span-5 lg:col-start-8">
            <ImageReveal
              src="/images/sg/site-aerial.webp"
              alt="Le site de la Fondation à Bangoulap"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="aspect-[4/5] rounded-sm"
            />
            <NdopDraw className="absolute -bottom-16 -left-16 hidden size-48 text-accent/60 lg:block" />
          </div>
        </Container>
        <Container className="mt-24 lg:mt-32">
          <div className="grid gap-12 lg:grid-cols-12">
            {presentation?.hero?.image && typeof presentation.hero.image === 'object' && (
              <Reveal className="relative aspect-square w-32 overflow-hidden rounded-full lg:col-span-2 lg:w-full">
                <CmsImage media={presentation.hero.image} sizes="200px" />
              </Reveal>
            )}
            <Reveal className="lg:col-span-9 lg:col-start-4">
              <Quote author={t('presidentName')} role={t('presidentRole')}>
                {t('presidentQuote')}
              </Quote>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ── Key figures ─────────────────────────────────────────────── */}
      <Section tone="indigo" spacing="md" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 text-ivory/[0.04]">
          <NdopPattern motif="diamonds" scale={1.6} />
        </div>
        <Container className="relative">
          <Stagger className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
            {[
              { value: 26, label: t('statRooms') },
              { value: 9, label: t('statTrades') },
              { value: residents.totalDocs, label: t('statResidents') },
              { value: 1500, suffix: ' m', label: t('statAltitude') },
            ].map((s) => (
              <StaggerItem key={s.label} className="border-t border-ivory/20 pt-6">
                <Counter value={s.value} suffix={s.suffix} locale={locale} className="font-display text-display-md font-light" />
                <p className="mt-3 max-w-[16rem] text-sm text-ivory/70">{s.label}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      {/* ── Our work (pinned horizontal scroll on desktop) ───────────── */}
      <section aria-labelledby="actions" className="bg-paper">
        <HorizontalScroll
          header={
            <Container className="mb-10 lg:mb-12">
              <SectionHeading
                id="actions"
                eyebrow={t('actionsEyebrow')}
                title={t('actionsTitle')}
                intro={t('actionsIntro')}
                action={<ArrowLink href="/actions">{tc('allActions')}</ArrowLink>}
              />
            </Container>
          }
        >
          {activities.docs.map((a, i) => (
            <Link
              key={a.id}
              href={`/actions/${a.slug}`}
              className="group relative isolate flex aspect-[3/4] w-[78vw] shrink-0 snap-start flex-col justify-end overflow-hidden rounded-sm bg-indigo-deep p-6 text-ivory sm:w-[46vw] lg:h-[60vh] lg:w-auto lg:p-8"
            >
              <CmsImage
                media={a.cover}
                sizes="(min-width: 1024px) 30vw, 80vw"
                className="-z-10 opacity-80 transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105"
              />
              <span className="absolute inset-0 -z-10 bg-gradient-to-t from-indigo-deep via-indigo-deep/40 to-transparent" />
              <span className="absolute top-6 left-6 font-display text-sm text-raffia lg:top-8 lg:left-8">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-display-sm font-light text-balance">{a.title}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ivory/75">{a.summary}</p>
            </Link>
          ))}
        </HorizontalScroll>
      </section>

      {/* ── News & agenda ───────────────────────────────────────────── */}
      <Section tone="ivory" labelledBy="news">
        <Container>
          <SectionHeading
            id="news"
            eyebrow={t('newsEyebrow')}
            title={t('newsTitle')}
            action={<ArrowLink href="/actualites">{tc('allNews')}</ArrowLink>}
          />
          <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-10">
            {featured && (
              <Reveal className="lg:col-span-7">
                <PostCard post={featured} locale={locale} featured />
              </Reveal>
            )}
            <Stagger className="flex flex-col gap-10 lg:col-span-5">
              {latest.map((p) => (
                <StaggerItem key={p.id}>
                  <PostCard post={p} locale={locale} compact />
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          {upcoming.docs.length > 0 && (
            <div className="mt-24">
              <SectionHeading eyebrow={t('agendaEyebrow')} title={t('agendaTitle')} size="sm" />
              <div className="mt-8 border-b border-line">
                {upcoming.docs.map((e) => (
                  <EventRow key={e.id} post={e} locale={locale} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </Section>

      {/* ── Villa Boutanga ──────────────────────────────────────────── */}
      <Section tone="sand" labelledBy="villa" className="overflow-hidden">
        <Container className="grid items-center gap-14 lg:grid-cols-12">
          <div className="relative lg:col-span-7">
            <ImageReveal
              src="/images/sg/villa-terrace.webp"
              alt="La terrasse de la Villa Boutanga"
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="aspect-[4/3] rounded-sm"
              from="left"
            />
            <Parallax speed={0.5} className="absolute -right-6 -bottom-12 hidden w-2/5 sm:block lg:-right-16">
              <ImageReveal
                src="/images/sg/jacaranda-restaurant.webp"
                alt="Le restaurant Le Jacaranda"
                sizes="25vw"
                className="aspect-[3/4] rounded-sm shadow-2xl"
                parallax={0}
                delay={0.3}
              />
            </Parallax>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <SectionHeading id="villa" eyebrow={t('villaEyebrow')} title={t('villaTitle')} />
            <Reveal className="mt-6 text-lead text-muted">{t('villaText')}</Reveal>
            {Number.isFinite(minPrice) && (
              <Reveal className="mt-8 border-t border-line pt-6">
                <p className="font-display text-display-sm">
                  {locale === 'fr' ? 'dès ' : 'from '}
                  {formatPrice(minPrice, locale)} <span className="font-sans text-base text-muted">FCFA</span>
                </p>
                <p className="text-sm text-muted">{tc('perNight')}</p>
              </Reveal>
            )}
            <Reveal className="mt-8 flex flex-wrap gap-3">
              <Button href="/sejourner/villa-boutanga" variant="secondary" arrow>
                {t('villaCta')}
              </Button>
              <Button href="/sejourner/villa-boutanga#reserver" variant="outline">
                {t('villaBook')}
              </Button>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* ── Heritage ────────────────────────────────────────────────── */}
      <Section tone="deep" labelledBy="heritage" className="relative overflow-hidden">
        <Container className="relative grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading dark id="heritage" eyebrow={t('heritageEyebrow')} title={t('heritageTitle')} />
            <Reveal className="mt-6 text-lead text-ivory/75">{t('heritageText')}</Reveal>
            <Reveal className="mt-8">
              <Button href="/actions/artisanat" variant="outline-light" arrow>
                {t('heritageCta')}
              </Button>
            </Reveal>
          </div>
          <div className="grid grid-cols-5 gap-4 lg:col-span-6 lg:col-start-7">
            <ImageReveal
              src="/images/sg/ndop-textile.webp"
              alt="Étoffes Ndop"
              sizes="(min-width: 1024px) 30vw, 60vw"
              className="col-span-3 aspect-[3/4] rounded-sm"
            />
            <div className="col-span-2 flex flex-col gap-4 pt-16">
              <ImageReveal src="/images/sg/atelier-perlage.webp" alt="Atelier de perlage" sizes="20vw" className="aspect-[3/4] rounded-sm" delay={0.15} />
              <div className="aspect-square rounded-sm border border-ivory/15 text-raffia/70">
                <NdopPattern motif="moon" scale={0.9} />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Partners ────────────────────────────────────────────────── */}
      {partners.docs.length > 0 && (
        <section aria-label={t('partnersEyebrow')} className="bg-canvas py-16">
          <Container>
            <Eyebrow className="mb-8">{t('partnersEyebrow')}</Eyebrow>
          </Container>
          <Marquee duration={60}>
            {partners.docs.map((p) => (
              <span key={p.id} className="flex items-center gap-10 px-5 font-display text-2xl font-light whitespace-nowrap text-ink/70 sm:text-3xl">
                {p.name}
                <span className="size-1.5 rounded-full bg-terracotta" aria-hidden />
              </span>
            ))}
          </Marquee>
        </section>
      )}

      {/* ── Support CTA ─────────────────────────────────────────────── */}
      <Section tone="terracotta" labelledBy="support" className="relative overflow-hidden">
        <NdopDraw className="pointer-events-none absolute top-1/2 -right-24 size-[30rem] -translate-y-1/2 text-ivory/15 sm:size-[40rem]" />
        <Container className="relative">
          <NdopBand className="mb-14 max-w-xs text-ivory/50" motif="zigzag" />
          <SectionHeading dark id="support" eyebrow={t('supportEyebrow')} title={t('supportTitle')} intro={t('supportText')} size="lg" />
          <Reveal className="mt-10 flex flex-wrap gap-3">
            <Magnetic>
              <Button href="/soutenir/don" variant="light" size="lg" arrow>
                {t('supportDonate')}
              </Button>
            </Magnetic>
            <Button href="/soutenir/adhesion" variant="outline-light" size="lg">
              {t('supportMember')}
            </Button>
          </Reveal>
        </Container>
      </Section>
    </>
  )
}
