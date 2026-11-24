import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

import { EventRow, PostCard } from '@/components/content/PostCards'
import { CmsImage } from '@/components/media/CmsImage'
import { Counter, ImageReveal, Magnetic, Marquee, Reveal, SplitText, Stagger, StaggerItem } from '@/components/motion'
import { NdopDraw } from '@/components/ndop/NdopDraw'
import { NdopBand, NdopPattern } from '@/components/ndop/NdopPattern'
import { ArrowLink, Button } from '@/components/ui/Button'
import { Quote } from '@/components/ui/cards'
import { HeroSeal } from '@/components/ui/HeroSeal'
import { VillaLogo } from '@/components/ui/Logo'
import { PartnerTile } from '@/components/ui/PartnerTile'
import { ArrowUpRight, Bed, Calendar, Users } from '@/components/ui/icons'
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
  getRooms,
  getUpcomingEvents,
} from '@/lib/payload'

export const revalidate = 600

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = await pageLocale(params)
  const t = await getTranslations('home')
  const tc = await getTranslations('common')

  const [activities, news, upcoming, recent, partners, rooms, presentation] = await Promise.all([
    getActivities(locale),
    getPosts(locale, { limit: 4 }),
    getUpcomingEvents(locale, 4),
    getRecentEvents(locale, 4),
    getPartners(locale),
    getRooms(locale),
    getPage(locale, 'fondation'),
  ])

  const events = upcoming.docs.length ? upcoming.docs : recent.docs
  const [featured, ...latest] = news.docs
  const minPrice = Math.min(...rooms.docs.map((r) => r.price))

  return (
    <>
      {/* ── Hero: text on the left, arch-framed photo with floating cards on the right ── */}
      <section className="relative isolate overflow-hidden bg-indigo-deep text-ivory">
        <div className="pointer-events-none absolute inset-0 -z-10 text-ivory/[0.035]" aria-hidden>
          <NdopPattern motif="diamonds" scale={1.4} />
        </div>
        <div
          className="pointer-events-none absolute -top-40 right-[-10%] -z-10 size-[42rem] rounded-full bg-terracotta/25 blur-[120px]"
          aria-hidden
        />
        <Container className="grid items-center gap-14 pt-[calc(var(--header-h)+3rem)] pb-16 sm:pb-20 lg:grid-cols-12 lg:gap-10 lg:pt-[calc(var(--header-h)+3.5rem)]">
          <div className="lg:col-span-7">
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
              className="mt-6 font-display text-display-lg font-[360] text-balance"
            />
            <Reveal immediate delay={0.4}>
              <p className="mt-7 max-w-xl text-lead text-pretty text-ivory/75">{t('intro')}</p>
              <div className="mt-9 flex flex-wrap gap-3">
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
            <Reveal immediate delay={0.55}>
              <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-ivory/15 pt-7">
                {[
                  { value: activities.totalDocs, label: t('statActions') },
                  { value: 26, label: t('statRoomsShort') },
                  { value: 1500, suffix: ' m', label: t('statAltitudeShort') },
                ].map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd>
                      <Counter value={s.value} suffix={s.suffix} locale={locale} className="font-display text-[1.6rem] font-light whitespace-nowrap sm:text-3xl" />
                      <span className="mt-1 block text-xs leading-snug text-ivory/60 sm:text-sm">{s.label}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <div className="relative mx-auto w-full max-w-[27rem] lg:col-span-5 lg:mr-0">
            {/* Photo in a frame woven with a Ndop zigzag; it opens on load, then the cards pop in. */}
            <div className="hero-frame-wrap relative rounded-[2rem] p-3 text-raffia/40 ring-1 ring-ivory/10">
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]" aria-hidden>
                <NdopPattern motif="zigzag" scale={0.55} />
              </div>
              <div className="hero-arch-photo relative aspect-[5/4] overflow-hidden rounded-[1.4rem] lg:aspect-square">
                <Image
                  src="/images/sg/site-aerial.webp"
                  alt={t('heroAlt')}
                  fill
                  priority
                  sizes="(min-width: 1024px) 27rem, 90vw"
                  className="object-cover"
                />
              </div>
            </div>

            {events[0] && (
              <Link
                href={`/actualites/${events[0].slug}`}
                className="hero-float hero-float-1 group absolute -bottom-6 -left-4 flex max-w-[16rem] items-start gap-3 rounded-2xl bg-ivory p-4 text-indigo-ndop shadow-[0_24px_48px_-18px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-out-expo hover:-translate-y-1 sm:-left-12"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-indigo-ndop text-raffia" aria-hidden>
                  <Calendar className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="eyebrow block text-[0.6rem] text-terracotta">
                    {upcoming.docs.length ? t('agendaTitle') : t('agendaRecent')}
                  </span>
                  <span className="mt-1.5 line-clamp-2 block font-display text-[0.95rem] leading-snug">{events[0].title}</span>
                  <span className="mt-1 block text-xs text-indigo-ndop/80">{events[0].eventLabel}</span>
                </span>
              </Link>
            )}
            <Link
              href="/sejourner/villa-boutanga"
              className="hero-float hero-float-2 absolute -top-5 -right-2 flex sm:-right-6 items-center gap-3 rounded-2xl bg-ivory px-4 py-3 text-indigo-ndop shadow-[0_24px_48px_-18px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-out-expo hover:-translate-y-1 "
            >
              <span className="grid size-9 place-items-center rounded-xl bg-terracotta text-ivory" aria-hidden>
                <Bed className="size-5" />
              </span>
              <span>
                <span className="block font-display text-[0.95rem] leading-tight">Villa Boutanga</span>
                <span className="block text-xs text-indigo-ndop/80">
                  {Number.isFinite(minPrice) ? `${locale === 'fr' ? 'dès' : 'from'} ${formatPrice(minPrice, locale)} FCFA` : t('villaEyebrow')}
                </span>
              </span>
            </Link>
            <HeroSeal label="Fondation Gacha · Bangoulap · Cameroun · " />
          </div>
        </Container>
      </section>

      {/* ── Mission: text + collage of three photos with floating cards ── */}
      <Section tone="ivory" spacing="md" labelledBy="mission">
        <Container className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <SectionHeading id="mission" eyebrow={t('missionEyebrow')} title={t('missionTitle')} />
            <Reveal className="mt-6 max-w-xl text-lead text-muted">{t('missionText')}</Reveal>
            <Reveal className="mt-7">
              <ArrowLink href="/fondation">{t('discover')}</ArrowLink>
            </Reveal>
            <Reveal className="mt-10 border-t border-line pt-8">
              <div className="flex items-center gap-5">
                {presentation?.hero?.image && typeof presentation.hero.image === 'object' && (
                  <span className="relative block size-16 shrink-0 overflow-hidden rounded-full ring-2 ring-accent/30">
                    <CmsImage media={presentation.hero.image} sizes="64px" />
                  </span>
                )}
                <Quote author={t('presidentName')} role={t('presidentRole')} compact>
                  {t('presidentQuote')}
                </Quote>
              </div>
            </Reveal>
          </div>

          <Reveal className="collage relative mx-auto w-full max-w-[34rem] pb-10 lg:col-span-6 lg:col-start-7 lg:max-w-none">
            <div className="relative ml-[12%] aspect-[4/4.4] overflow-hidden rounded-3xl shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)]">
              <Image src="/images/sg/collab-group.webp" alt={t('collageGroupAlt')} fill sizes="(min-width: 1024px) 28rem, 80vw" className="object-cover" />
            </div>
            <div className="collage-float absolute top-[-4%] left-0 w-[36%] overflow-hidden rounded-2xl border-4 border-ivory shadow-xl [--bob:7s] dark:border-canvas">
              <Image src="/images/sg/collab-horse.webp" alt={t('collageHorseAlt')} width={680} height={850} sizes="12rem" className="aspect-[4/5] object-cover" />
            </div>
            <div className="collage-float absolute right-[-2%] bottom-0 w-[44%] overflow-hidden rounded-2xl border-4 border-ivory shadow-xl [--bob:8s] dark:border-canvas">
              <Image src="/images/sg/collab-award.webp" alt={t('collageAwardAlt')} width={720} height={560} sizes="15rem" className="aspect-[4/3] object-cover" />
            </div>
            <div className="absolute bottom-[8%] left-[-2%] flex items-center gap-3 rounded-2xl bg-ivory px-4 py-3 text-indigo-ndop shadow-xl dark:bg-ivory">
              <span className="grid size-9 place-items-center rounded-xl bg-indigo-ndop text-raffia" aria-hidden>
                <Users className="size-5" />
              </span>
              <span>
                <span className="block font-display text-lg leading-none">{t('collageBadgeValue')}</span>
                <span className="block text-xs text-indigo-ndop/80">{t('collageBadgeLabel')}</span>
              </span>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ── Our work: bento grid (one large card, four small, two wide) ── */}
      <Section tone="paper" spacing="md" labelledBy="actions">
        <Container>
          <SectionHeading
            id="actions"
            eyebrow={t('actionsEyebrow')}
            title={t('actionsTitle')}
            intro={t('actionsIntro')}
            action={<ArrowLink href="/actions">{tc('allActions')}</ArrowLink>}
          />
          <Stagger className="mt-12 grid auto-rows-[14rem] gap-4 sm:grid-cols-2 sm:auto-rows-[15rem] lg:grid-cols-4">
            {activities.docs.map((a, i) => {
              const layout = i === 0 ? 'sm:col-span-2 sm:row-span-2' : i === 5 ? 'sm:col-span-2' : ''
              return (
                <StaggerItem key={a.id} className={layout}>
                  <Link
                    href={`/actions/${a.slug}`}
                    className="field-card group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-3xl bg-indigo-deep p-6 text-ivory lg:p-7"
                  >
                    <CmsImage
                      media={a.cover}
                      sizes={i === 0 ? '(min-width: 1024px) 50vw, 100vw' : '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'}
                      className="-z-20 transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.06]"
                    />
                    <span className="absolute inset-0 -z-10 bg-gradient-to-t from-indigo-deep/95 via-indigo-deep/35 to-indigo-deep/5" />
                    <span className="absolute top-5 left-5 rounded-full bg-ivory/15 px-3 py-1 font-display text-xs text-ivory backdrop-blur-md lg:top-6 lg:left-6">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="absolute top-5 right-5 grid size-10 place-items-center rounded-full bg-ivory text-indigo-ndop transition-transform duration-500 ease-out-expo group-hover:rotate-45 lg:top-6 lg:right-6"
                      aria-hidden
                    >
                      <ArrowUpRight className="size-4" />
                    </span>
                    <h3 className={i === 0 ? 'font-display text-display-sm font-light text-balance lg:text-[2rem] lg:leading-tight' : 'font-display text-xl leading-tight font-light text-balance'}>
                      {a.title}
                    </h3>
                    <p
                      className={
                        i === 0
                          ? 'mt-3 line-clamp-3 max-w-md text-sm leading-relaxed text-ivory/80 sm:text-base'
                          : 'field-card-text mt-2 line-clamp-2 text-sm leading-relaxed text-ivory/80'
                      }
                    >
                      {a.summary}
                    </p>
                  </Link>
                </StaggerItem>
              )
            })}
          </Stagger>
        </Container>
      </Section>

      {/* ── News & agenda ───────────────────────────────────────────── */}
      <Section tone="ivory" spacing="md" labelledBy="news">
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
      <Section tone="sand" spacing="md" labelledBy="villa" className="overflow-hidden">
        <Container className="grid items-center gap-12 lg:grid-cols-12">
          <div className="relative pb-10 lg:col-span-7">
            <ImageReveal
              src="/images/sg/bangoulap-hills.webp"
              alt={t('panoramaAlt')}
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="aspect-[4/3] rounded-3xl"
              from="left"
            />
            <div className="absolute right-3 -bottom-2 w-[42%] overflow-hidden rounded-2xl border-4 border-[var(--sand)] shadow-2xl sm:right-6">
              <ImageReveal
                src="/images/sg/villa-terrace.webp"
                alt="La terrasse de la Villa Boutanga"
                sizes="25vw"
                className="aspect-[4/3]"
                parallax={0}
                delay={0.3}
              />
            </div>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <VillaLogo className="mb-7 w-20 text-[#7a4a32] dark:text-raffia" />
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
      <Section tone="deep" spacing="md" labelledBy="heritage" className="relative overflow-hidden">
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
              className="col-span-3 aspect-[3/4] rounded-2xl"
            />
            <div className="col-span-2 flex flex-col gap-4 pt-16">
              <ImageReveal src="/images/sg/atelier-perlage.webp" alt="Atelier de perlage" sizes="20vw" className="aspect-[3/4] rounded-2xl" delay={0.15} />
              <div className="aspect-square rounded-2xl border border-ivory/15 text-raffia/70">
                <NdopPattern motif="moon" scale={0.9} />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Partners: logo tiles drifting slowly (pauses on hover) ── */}
      {partners.docs.length > 0 && (
        <section aria-labelledby="partners" className="bg-canvas py-20 sm:py-24">
          <Container>
            <SectionHeading id="partners" eyebrow={t('partnersEyebrow')} title={t('partnersTitle')} intro={t('partnersIntro')} size="sm" />
          </Container>
          <Marquee duration={partners.docs.length * 9} className="mt-12">
            {partners.docs.map((p) => (
              <PartnerTile key={p.id} partner={p} />
            ))}
          </Marquee>
        </section>
      )}

      {/* ── Support CTA ─────────────────────────────────────────────── */}
      <Section tone="terracotta" spacing="md" labelledBy="support" className="relative overflow-hidden">
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
