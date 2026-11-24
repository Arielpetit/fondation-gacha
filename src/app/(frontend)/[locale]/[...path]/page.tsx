import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { notFound, permanentRedirect } from 'next/navigation'
import type { ReactNode } from 'react'

import { PostCard } from '@/components/content/PostCards'
import { CmsForm } from '@/components/forms/CmsForm'
import {
  ContactsSection,
  DonationSection,
  MembershipSection,
  PartnersGrid,
  PressList,
  ReportsList,
  RestaurantSection,
  RoomsSection,
  VillaIntro,
  TeamGrid,
  VisitPrices,
} from '@/components/content/sections'
import { PageHero, type Crumb } from '@/components/layout/PageHero'
import { Stagger, StaggerItem } from '@/components/motion'
import { HelpCard, ReadingLayout, SectionNav } from '@/components/layout/ReadingLayout'
import { RichText } from '@/components/RichText'
import { Button } from '@/components/ui/Button'
import { ArrowUpRight } from '@/components/ui/icons'
import { Container, Section } from '@/components/ui/Section'
import { pageLocale } from '@/i18n/params'
import type { Locale } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import { breadcrumbLd, JsonLd, lodgingLd } from '@/lib/jsonLd'
import { buildMetadata } from '@/lib/metadata'
import { type GalleryImage } from '@/components/media/Gallery'
import {
  asMedia,
  findRedirect,
  mediaSrc,
  getPage,
  getPartners,
  getPosts,
  getPress,
  getReports,
  getRooms,
  getSettings,
  getTeam,
} from '@/lib/payload'
import { navigation, t as l10n } from '@/lib/site'
import type { Page } from '@/payload-types'

export const revalidate = 600

/** Rendered on first request, then cached (ISR) and refreshed by the CMS revalidation hooks. */
export function generateStaticParams() {
  return []
}

type Params = Promise<{ locale: string; path: string[] }>

const SECTION_KEY: Record<string, 'foundation' | 'stay' | 'support' | 'resources'> = {
  fondation: 'foundation',
  sejourner: 'stay',
  soutenir: 'support',
  ressources: 'resources',
}

/** Images for hub cards (pages without their own hero image). */
const HUB_IMAGES: Record<string, string> = {
  '/sejourner/villa-boutanga': '/images/sg/villa-terrace.webp',
  '/sejourner/restaurant': '/images/sg/jacaranda-restaurant.webp',
  '/sejourner/boutique': '/images/sg/atelier-perlage.webp',
  '/sejourner/visites': '/images/sg/site-aerial.webp',
  '/soutenir/don': '/images/sg/school-donation.webp',
  '/soutenir/adhesion': '/images/sg/case-sunset.webp',
  '/soutenir/partenaires': '/images/sg/residence-alice.webp',
  '/soutenir/benevolat': '/images/sg/atelier-perlage.webp',
  '/ressources/presse': '/images/sg/ndop-textile.webp',
  '/ressources/bilans': '/images/sg/school-donation.webp',
  '/ressources/publications': '/images/sg/residence-barbara.webp',
}

const joinPath = (segments: string[]) => segments.map((s) => decodeURIComponent(s)).join('/')

/** Breadcrumb trail for a nested path ("soutenir/don" → Soutenir). */
async function crumbsFor(path: string): Promise<Crumb[]> {
  const tn = await getTranslations('nav')
  const [first, ...rest] = path.split('/')
  const key = SECTION_KEY[first]
  if (!key || rest.length === 0) return []
  return [{ href: first === 'fondation' ? '/fondation' : `/${first}`, label: tn(key) }]
}

// ── Pages that exist only in code (hubs, contact, legal…) ───────────────────
type Virtual = { title: string; eyebrow?: string; intro?: string; image?: string; body: () => Promise<ReactNode> }

async function virtualPage(path: string, locale: Locale): Promise<Virtual | null> {
  const t = await getTranslations('pages')
  const tn = await getTranslations('nav')

  const hub = (key: 'stay' | 'support' | 'resources', title: string, intro: string, image: string): Virtual => ({
    title,
    eyebrow: tn(key),
    intro,
    image,
    body: async () => {
      const item = navigation.find((n) => n.key === key)!
      return (
        <Section tone="ivory" spacing="md">
          <Container>
            <Stagger className="grid gap-4 sm:grid-cols-2">
              {item.children!.map((c, i) => (
                <StaggerItem key={c.href}>
                  <Link href={c.href} className="group relative isolate flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-2xl bg-indigo-deep p-6 text-ivory sm:p-8">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={HUB_IMAGES[c.href] ?? '/images/sg/site-aerial.webp'}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70 transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105"
                    />
                    <span className="absolute inset-0 -z-10 bg-gradient-to-t from-indigo-deep via-indigo-deep/40 to-transparent" />
                    <span className="absolute top-6 left-6 font-display text-sm text-raffia sm:top-8 sm:left-8">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-display text-display-sm font-light">{l10n(c.label, locale)}</span>
                    {c.description && <span className="mt-2 text-sm text-ivory/75">{l10n(c.description, locale)}</span>}
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          </Container>
        </Section>
      )
    },
  })

  switch (path) {
    case 'sejourner':
      return hub('stay', t('hubStay'), t('hubStayText'), '/images/sg/villa-terrace.webp')
    case 'soutenir':
      return hub('support', t('hubSupport'), t('hubSupportText'), '/images/sg/school-donation.webp')
    case 'ressources':
      return hub('resources', t('hubResources'), t('hubResourcesText'), '/images/sg/ndop-textile.webp')
    case 'contact':
      return {
        title: t('contactTitle'),
        eyebrow: tn('contact'),
        intro: t('contactText'),
        image: '/images/sg/site-aerial.webp',
        body: async () => {
          const settings = await getSettings(locale)
          const tf = await getTranslations('forms')
          return (
            <>
              <CmsForm slug="contact" title={tf('contactTitle')} intro={tf('contactIntro')} tone="ivory" id="ecrire" />
              <ContactsSection settings={settings} />
              <Section tone="ivory" spacing="none">
                <div className="relative aspect-[16/9] w-full sm:aspect-[21/8]">
                  <iframe
                    title="Carte — Fondation Jean-Félicien Gacha, Bangoulap"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=10.47%2C5.08%2C10.59%2C5.16&layer=mapnik&marker=5.12%2C10.53"
                    loading="lazy"
                    className="absolute inset-0 h-full w-full border-0 grayscale-[0.3]"
                  />
                </div>
              </Section>
            </>
          )
        },
      }
    case 'soutenir/benevolat':
      return {
        title: t('volunteerTitle'),
        eyebrow: tn('support'),
        intro: t('volunteerText'),
        image: '/images/sg/atelier-perlage.webp',
        body: async () => {
          const tf = await getTranslations('forms')
          return (
            <>
              <CmsForm slug="benevolat" title={tf('volunteerTitle')} intro={tf('volunteerIntro')} tone="ivory" />
              <ContactsSection settings={await getSettings(locale)} />
            </>
          )
        },
      }
    case 'ressources/publications':
      return {
        title: t('publicationsTitle'),
        eyebrow: tn('resources'),
        intro: t('publicationsText'),
        body: async () => {
          const posts = await getPosts(locale, { theme: 'litterature', limit: 9 })
          return (
            <Section tone="ivory" spacing="md">
              <Container>
                <Stagger className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.docs.map((p) => (
                    <StaggerItem key={p.id}>
                      <PostCard post={p} locale={locale} />
                    </StaggerItem>
                  ))}
                </Stagger>
              </Container>
            </Section>
          )
        },
      }
    case 'mentions-legales':
      return {
        title: t('legalTitle'),
        body: async () => (
          <Section tone="ivory" spacing="md">
            <Container className="prose-gacha max-w-3xl">
              <h2>{t('legalPublisher')}</h2>
              <p>{t('legalPublisherText')}</p>
              <h2>{t('legalHosting')}</h2>
              <p>{t('legalHostingText')}</p>
              <h2>{t('legalData')}</h2>
              <p>{t('legalDataText')}</p>
              <h2>{t('legalCredits')}</h2>
              <p>{t('legalCreditsText')}</p>
            </Container>
          </Section>
        ),
      }
    default:
      return null
  }
}

// ── Sections appended to CMS pages, by path ─────────────────────────────────
type LexNode = { type?: string; text?: string; value?: unknown; children?: LexNode[] }

/** Lead paragraph and photos of a migrated page (used where the old body is replaced by structured sections). */
function pageHighlights(page: Page | null, exclude: RegExp) {
  const root = (page?.content as { root?: LexNode } | null)?.root
  const text = (n: LexNode): string => n.text ?? (n.children ?? []).map(text).join('')
  const firstParagraph = (root?.children ?? []).find((n) => n.type === 'paragraph' && text(n).trim().length > 60)
  const images: GalleryImage[] = []
  const walk = (n: LexNode) => {
    if (n.type === 'upload') {
      const media = asMedia(n.value as never)
      if (media?.mimeType?.startsWith('image/') && !exclude.test(media.filename ?? '')) {
        images.push({ src: mediaSrc(media) ?? '', alt: media.alt ?? '', width: media.width ?? 1600, height: media.height ?? 1000 })
      }
    }
    ;(n.children ?? []).forEach(walk)
  }
  if (root) walk(root)
  return { text: firstParagraph ? text(firstParagraph).trim() : undefined, images }
}

async function extraSections(path: string, locale: Locale, page: Page | null = null): Promise<ReactNode> {
  const tf = await getTranslations('forms')
  switch (path) {
    case 'fondation/equipe':
      return <TeamGrid team={(await getTeam(locale)).docs} />
    case 'sejourner/villa-boutanga':
    {
      // The old page body repeated the room list and an image of the price poster: show its photos as a gallery instead.
      const { text, images } = pageHighlights(page, /tarif|^23\./i)
      const settings = await getSettings(locale)
      return (
        <>
          <VillaIntro text={text} images={images} />
          <RoomsSection rooms={(await getRooms(locale)).docs} settings={settings} />
          <RestaurantSection settings={settings} />
          <CmsForm slug="reservation-villa" title={tf('bookingTitle')} intro={tf('bookingIntro')} tone="paper" id="reserver" />
        </>
      )
    }
    case 'sejourner/visites': {
      const settings = await getSettings(locale)
      return (
        <>
          <VisitPrices settings={settings} />
          <ContactsSection settings={settings} />
        </>
      )
    }
    case 'soutenir/don':
      return (
        <>
          <DonationSection settings={await getSettings(locale)} />
          <CmsForm slug="recu-don" title={tf('receiptTitle')} intro={tf('receiptIntro')} tone="paper" id="recu" />
        </>
      )
    case 'soutenir/adhesion':
      return (
        <>
          <MembershipSection settings={await getSettings(locale)} />
          <CmsForm slug="adhesion" title={tf('membershipTitle')} intro={tf('membershipIntro')} tone="paper" id="adherer" />
        </>
      )
    case 'soutenir/partenaires':
      return <PartnersGrid partners={(await getPartners(locale)).docs} />
    case 'ressources/bilans':
      return <ReportsList reports={(await getReports(locale)).docs} />
    case 'ressources/presse':
      return <PressList items={(await getPress(locale)).docs} />
    default:
      return null
  }
}

/** Pages whose CMS body is fully replaced by structured sections (avoid showing the old text twice). */
const HIDE_BODY = new Set(['fondation/equipe', 'ressources/bilans', 'soutenir/adhesion', 'sejourner/visites', 'sejourner/villa-boutanga'])

/** Pages where the structured section is the main content and goes before the CMS text. */
const EXTRA_FIRST = new Set(['soutenir/don'])

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const locale = await pageLocale(params)
  const path = joinPath((await params).path)
  const page = await getPage(locale, path)
  if (page) {
    return buildMetadata({ seo: page.meta, title: page.title, description: page.hero?.intro, image: page.hero?.image, path, locale })
  }
  const v = await virtualPage(path, locale)
  return v ? buildMetadata({ title: v.title, description: v.intro, path, locale }) : {}
}

export default async function CatchAllPage({ params }: { params: Params }) {
  const locale = await pageLocale(params)
  const path = joinPath((await params).path)

  if (path === 'sejourner/restaurant') permanentRedirect('/sejourner/villa-boutanga#restaurant')

  const page: Page | null = await getPage(locale, path)
  const crumbs = await crumbsFor(path)

  if (!page) {
    const v = await virtualPage(path, locale)
    if (v) {
      return (
        <>
          <PageHero eyebrow={v.eyebrow} title={v.title} intro={v.intro} imageSrc={v.image} crumbs={crumbs} />
          {await v.body()}
        </>
      )
    }
    // Old WordPress URL? Send it to its new home.
    const to = await findRedirect(path)
    if (to) permanentRedirect(locale === 'en' && to.startsWith('/') ? `/en${to}` : to)
    notFound()
  }

  const extra = await extraSections(path, locale, page)
  const prefix = locale === 'en' ? '/en' : ''
  const ld: object[] = [
    breadcrumbLd([
      ...crumbs.map((c) => ({ name: c.label, path: `${prefix}${c.href}` })),
      { name: page.title, path: `${prefix}/${path}` },
    ]),
  ]
  if (path === 'sejourner/villa-boutanga') {
    ld.push(lodgingLd((await getRooms(locale)).docs, await getSettings(locale)))
  }
  const showBody = !HIDE_BODY.has(path)
  const portrait = path === 'fondation' ? page.hero?.image : null

  return (
    <>
      <JsonLd data={ld} />
      <PageHero
        eyebrow={page.hero?.eyebrow ?? undefined}
        title={page.title}
        intro={page.hero?.intro ?? undefined}
        image={portrait ? undefined : page.hero?.image}
        imageSrc={portrait ? '/images/sg/site-aerial.webp' : undefined}
        crumbs={crumbs}
      />
      {EXTRA_FIRST.has(path) && extra}
      {showBody && (
        <Section tone="ivory" spacing="md">
          <ReadingLayout
            aside={
              <>
                <SectionNav locale={locale} current={`/${path}`} />
                <HelpCard locale={locale} />
              </>
            }
          >
            <RichText data={page.content as never} locale={locale} />
            {path === 'maison-gacha' && (
              <div className="mt-12">
                <Button href="https://maisongacha.fr/" external arrow>
                  maisongacha.fr
                </Button>
              </div>
            )}
          </ReadingLayout>
        </Section>
      )}
      {!EXTRA_FIRST.has(path) && extra}
      {path === 'maison-gacha' && (
        <Section tone="sand" spacing="sm">
          <Container className="flex items-center gap-2 text-sm text-muted">
            <ArrowUpRight className="size-4" />
            <a href="https://espaceculturelgacha.org/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              espaceculturelgacha.org
            </a>
          </Container>
        </Section>
      )}
    </>
  )
}
