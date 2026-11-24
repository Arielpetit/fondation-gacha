/** schema.org structured data helpers (rendered as <script type="application/ld+json">). */
import type { Room, Setting } from '@/payload-types'

export const siteUrl = () => (process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fondationgacha.org').replace(/\/$/, '')

const address = {
  '@type': 'PostalAddress',
  addressLocality: 'Bangoulap',
  addressRegion: 'Ouest',
  addressCountry: 'CM',
}

/** The Foundation as an NGO, on every page. */
export function organizationLd(settings: Setting | null, locale: string) {
  const base = siteUrl()
  const phones = (settings?.contacts ?? []).flatMap((c) => (c.phones ?? '').split('/').map((p) => p.trim())).filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    '@id': `${base}/#organization`,
    name: 'Fondation Jean-Félicien Gacha',
    alternateName: locale === 'en' ? 'Jean-Félicien Gacha Foundation' : 'ONG Fondation Jean-Félicien Gacha',
    url: base,
    logo: `${base}/images/brand/fondation-indigo.png`,
    foundingDate: '2002',
    founder: { '@type': 'Person', name: 'Ly Dumas' },
    slogan: 'La reconnaissance de l’autre et de ses valeurs',
    email: 'contact@fondationgacha.org',
    telephone: phones[0],
    address,
    geo: { '@type': 'GeoCoordinates', latitude: 5.12, longitude: 10.53 },
    sameAs: [settings?.social?.facebook, 'https://maisongacha.fr/'].filter(Boolean),
  }
}

export function websiteLd(locale: string) {
  const base = siteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    url: base,
    name: 'Fondation Jean-Félicien Gacha',
    inLanguage: locale === 'en' ? 'en' : 'fr',
    publisher: { '@id': `${base}/#organization` },
  }
}

/** Villa Boutanga as a lodging business with its room offers. */
export function lodgingLd(rooms: Room[], settings: Setting | null) {
  const villa = settings?.contacts?.find((c) => /villa/i.test(c.service))
  const prices = rooms.map((r) => r.price).filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: 'Villa Boutanga',
    parentOrganization: { '@id': `${siteUrl()}/#organization` },
    url: `${siteUrl()}/sejourner/villa-boutanga`,
    email: villa?.email ?? undefined,
    telephone: villa?.phones?.split('/')[0]?.trim(),
    address,
    numberOfRooms: 26,
    priceRange: prices.length ? `${Math.min(...prices)}–${Math.max(...prices)} XAF` : undefined,
    amenityFeature: [{ '@type': 'LocationFeatureSpecification', name: 'Restaurant Le Jacaranda', value: true }],
    makesOffer: rooms.map((r) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'HotelRoom', name: r.name, occupancy: { '@type': 'QuantitativeValue', maxValue: r.capacity } },
      price: r.price,
      priceCurrency: 'XAF',
    })),
  }
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${siteUrl()}${it.path}`,
    })),
  }
}

export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; "<" is escaped to avoid closing the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
