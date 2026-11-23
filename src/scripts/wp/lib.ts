/** Shared helpers for the WordPress → Payload migration. */
import fs from 'node:fs'
import path from 'node:path'

export const EXPORT_DIR = path.resolve('data/wp-export')
export const OLD_HOST = /^https?:\/\/(www\.)?fondationgacha\.org/i

export type WPRendered = { rendered: string }
export type WPPost = {
  id: number
  date: string
  modified: string
  slug: string
  link: string
  title: WPRendered
  content: WPRendered
  excerpt: WPRendered
  featured_media: number
  tags: number[]
  parent?: number
}
export type WPMedia = {
  id: number
  slug: string
  source_url: string
  mime_type: string
  alt_text: string
  title: WPRendered
  caption: WPRendered
  link: string
}
export type WPTag = { id: number; name: string; slug: string; count: number }
export type PostExtra = { dateLabel: string | null; summary: string | null }

export const readExport = <T>(name: string): T =>
  JSON.parse(fs.readFileSync(path.join(EXPORT_DIR, `${name}.json`), 'utf8')) as T

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&quot;': '"',
  '&#039;': "'",
  '&#39;': "'",
  '&rsquo;': '’',
  '&lsquo;': '‘',
  '&rdquo;': '”',
  '&ldquo;': '“',
  '&laquo;': '«',
  '&raquo;': '»',
  '&ndash;': '–',
  '&mdash;': '—',
  '&hellip;': '…',
  '&eacute;': 'é',
  '&egrave;': 'è',
  '&agrave;': 'à',
  '&ccedil;': 'ç',
}

/** Decode HTML entities and strip tags (for titles and plain-text fields). */
export function plain(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&[a-z]+;|&#0?39;/gi, (m) => ENTITIES[m] ?? m)
    .replace(/​/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Normalise a WP upload URL to https + original size (drops "-722x1024"). */
export function originalUploadUrl(url: string): string {
  let u = url.trim().replace(/^\/\//, 'https://').replace(/^http:\/\//, 'https://')
  u = u.replace(/-\d{2,5}x\d{2,5}(\.[a-z0-9]+)$/i, '$1')
  return u
}

const MONTHS: Record<string, number> = {
  janvier: 0, january: 0,
  fevrier: 1, février: 1, february: 1,
  mars: 2, march: 2,
  avril: 3, april: 3,
  mai: 4, may: 4,
  juin: 5, june: 5,
  juillet: 6, july: 6,
  aout: 7, août: 7, august: 7,
  septembre: 8, september: 8,
  octobre: 9, october: 9,
  novembre: 10, november: 10,
  decembre: 11, décembre: 11, december: 11,
}

const iso = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d, 12)).toISOString()
const month = (s: string) => MONTHS[s.toLowerCase().normalize('NFC')]

/**
 * Parse the old theme's date line:
 *   "Le 19 Février 2020" · "Du 13 au 20 Janvier 2025" ·
 *   "Du 16 Novembre au 21 December 2023" · "Du 28 Décembre 2023 au 05 Janvier 2024"
 */
export function parseDateLabel(label: string | null | undefined): { start?: string; end?: string } {
  if (!label) return {}
  const s = label.replace(/\s+/g, ' ').trim()
  let m = s.match(/^Le (\d{1,2}) (\p{L}+) (\d{4})$/iu)
  if (m && month(m[2]) !== undefined) return { start: iso(+m[3], month(m[2]), +m[1]) }

  m = s.match(/^Du (\d{1,2}) au (\d{1,2}) (\p{L}+) (\d{4})$/iu)
  if (m && month(m[3]) !== undefined) {
    return { start: iso(+m[4], month(m[3]), +m[1]), end: iso(+m[4], month(m[3]), +m[2]) }
  }

  m = s.match(/^Du (\d{1,2}) (\p{L}+) au (\d{1,2}) (\p{L}+) (\d{4})$/iu)
  if (m && month(m[2]) !== undefined && month(m[4]) !== undefined) {
    const y = +m[5]
    const startYear = month(m[2]) > month(m[4]) ? y - 1 : y
    return { start: iso(startYear, month(m[2]), +m[1]), end: iso(y, month(m[4]), +m[3]) }
  }

  m = s.match(/^Du (\d{1,2}) (\p{L}+) (\d{4}) au (\d{1,2}) (\p{L}+) (\d{4})$/iu)
  if (m && month(m[2]) !== undefined && month(m[5]) !== undefined) {
    return { start: iso(+m[3], month(m[2]), +m[1]), end: iso(+m[6], month(m[5]), +m[4]) }
  }
  return {}
}

/** Fix English month names the old theme leaked into French labels ("December"). */
export function cleanDateLabel(label: string | null | undefined): string | undefined {
  if (!label || /^Le$/i.test(label.trim())) return undefined
  return label
    .replace(/\bDecember\b/g, 'décembre')
    .replace(/\b(Janvier|Février|Fevrier|Mars|Avril|Mai|Juin|Juillet|Août|Aout|Septembre|Octobre|Novembre|Décembre)\b/g, (w) =>
      w.toLowerCase(),
    )
}

/** Old WordPress page path → new site path (and target collection). */
export const PAGE_MAP: Record<string, { to: string; kind: 'page' | 'activity' | 'section' }> = {
  'fondation/presentation': { to: 'fondation', kind: 'page' },
  'fondation/infrastructures': { to: 'fondation/infrastructures', kind: 'page' },
  'fondation/equipe': { to: 'fondation/equipe', kind: 'page' },
  'activites/soutien-a-leducation': { to: 'education', kind: 'activity' },
  'activites/formation-professionnelle': { to: 'formation-professionnelle', kind: 'activity' },
  'activites/ateliers-darisanat': { to: 'artisanat', kind: 'activity' },
  'activites/equipements-culturels': { to: 'culture', kind: 'activity' },
  'activites/residences-decrivain': { to: 'residences', kind: 'activity' },
  'activites/environnement': { to: 'environnement', kind: 'activity' },
  'activites/sante-et-social': { to: 'sante-social', kind: 'activity' },
  'activites/tourisme-solidaire': { to: 'tourisme-solidaire', kind: 'activity' },
  'visiter/boutique': { to: 'sejourner/boutique', kind: 'page' },
  'visiter/villa-boutanga': { to: 'sejourner/villa-boutanga', kind: 'page' },
  'visiter/informations-pratiques': { to: 'sejourner/visites', kind: 'page' },
  'participer-soutenir': { to: 'soutenir/don', kind: 'page' },
  'participer-soutenir/partenaires': { to: 'soutenir/partenaires', kind: 'page' },
  'publications/presse': { to: 'ressources/presse', kind: 'page' },
  'publications/bilans-dactivites': { to: 'ressources/bilans', kind: 'page' },
  'publications/membre': { to: 'soutenir/adhesion', kind: 'page' },
  'espace-culturel-gacha': { to: 'maison-gacha', kind: 'page' },
  // Empty parent pages, old gallery and duplicates: redirect only.
  galerie: { to: 'actualites', kind: 'section' },
  fondation: { to: 'fondation', kind: 'section' },
  activites: { to: 'actions', kind: 'section' },
  visiter: { to: 'sejourner', kind: 'section' },
  publications: { to: 'ressources', kind: 'section' },
  'participer-soutenir/participer-soutenir': { to: 'soutenir/don', kind: 'section' },
}

/** Public path of an activity on the new site. */
export const activityPath = (slug: string) => `actions/${slug}`

/** Theme rules: first matching keywords win, several themes allowed. */
export const THEMES: { slug: string; fr: string; en: string; tone: string; match: RegExp }[] = [
  { slug: 'agenda', fr: 'Agenda culturel', en: 'Cultural agenda', tone: 'indigo', match: /agenda|programmation|calendrier culturel/i },
  { slug: 'cinema', fr: 'Cinéma', en: 'Cinema', tone: 'indigo', match: /cin[ée]|film|projection|documentaire/i },
  { slug: 'litterature', fr: 'Littérature & contes', en: 'Literature & tales', tone: 'terracotta', match: /livre|lecture|écrivain|littérat|conte|poésie|slam|bande dessinée|éloquence|art oratoire|blogging/i },
  { slug: 'jeunesse', fr: 'Jeunesse', en: 'Youth', tone: 'terracotta', match: /vacances utiles|jeunesse|jeunes|enfants|élèves|lycée|orphelin|stress/i },
  { slug: 'education', fr: 'Éducation & langues', en: 'Education & languages', tone: 'indigo', match: /éducation|école|scolaire|alphabétisation|cours de|medumba|fufuld|philosoph/i },
  { slug: 'artisanat', fr: 'Artisanat & textile', en: 'Crafts & textiles', tone: 'terracotta', match: /perl|artisan|couture|mode|textile|ndop|tissu|design|foire/i },
  { slug: 'patrimoine', fr: 'Patrimoine & musées', en: 'Heritage & museums', tone: 'indigo', match: /musée|patrimoine|icom|exposition|collection|chants|madrigal|pinacoth/i },
  { slug: 'residences', fr: 'Résidences d’artistes', en: 'Artist residencies', tone: 'terracotta', match: /résidence/i },
  { slug: 'sante-social', fr: 'Santé & social', en: 'Health & social', tone: 'forest', match: /covid|santé|social|femme|stupéfiant|eau|dexeus/i },
  { slug: 'nature', fr: 'Nature & tourisme', en: 'Nature & tourism', tone: 'forest', match: /randonnée|environnement|tourisme|nature|mont |grotte|vin de palme|football|sport/i },
  { slug: 'fondation', fr: 'Vie de la Fondation', en: 'Foundation news', tone: 'indigo', match: /assemblée|personnel|prix|médaille|maison gacha|retour sur|investissement humain|membre de l/i },
]
