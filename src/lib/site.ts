/**
 * Static site structure and contact details.
 * Navigation will move to a Payload global in Phase 4; contacts come from the old site (infos pratiques, Feb 2024).
 */
import type { Locale } from '@/i18n/routing'

export type L10n = Record<Locale, string>

export type NavChild = { href: string; label: L10n; description?: L10n }
export type NavItem = {
  key: 'foundation' | 'actions' | 'news' | 'stay' | 'support'
  href: string
  children?: NavChild[]
  feature?: { image: string; alt: L10n; title: L10n; text: L10n; href: string }
}

export const navigation: NavItem[] = [
  {
    key: 'foundation',
    href: '/fondation',
    children: [
      { href: '/fondation', label: { fr: 'Présentation', en: 'About us' }, description: { fr: 'Le mot de la présidente, valeurs et missions', en: "The president's word, values and mission" } },
      { href: '/fondation/infrastructures', label: { fr: 'Infrastructures', en: 'Facilities' }, description: { fr: 'Centre des Cultures JLD, auditorium, bibliothèque', en: 'JLD Culture Centre, auditorium, library' } },
      { href: '/fondation/equipe', label: { fr: 'Équipe & bénévoles', en: 'Team & volunteers' }, description: { fr: 'Celles et ceux qui font vivre la Fondation', en: 'The people behind the Foundation' } },
      { href: '/maison-gacha', label: { fr: 'Maison Gacha', en: 'Maison Gacha' }, description: { fr: 'Le Cameroun créatif à Paris', en: 'Creative Cameroon in Paris' } },
      { href: '/ressources/presse', label: { fr: 'Presse', en: 'Press' }, description: { fr: 'Articles et reportages', en: 'Articles and reports' } },
      { href: '/ressources/bilans', label: { fr: 'Bilans d’activités', en: 'Activity reports' }, description: { fr: 'Rapports annuels à télécharger', en: 'Annual reports to download' } },
      { href: '/ressources/publications', label: { fr: 'Publications', en: 'Publications' }, description: { fr: 'Livres et catalogues', en: 'Books and catalogues' } },
    ],
    feature: {
      image: '/images/sg/site-aerial.webp',
      alt: { fr: 'Vue aérienne du site de la Fondation à Bangoulap', en: 'Aerial view of the Foundation site in Bangoulap' },
      title: { fr: '1 500 m d’altitude', en: '1,500 m above sea level' },
      text: { fr: 'Sur les hauteurs de Bangoulap, près de Bangangté.', en: 'On the heights of Bangoulap, near Bangangté.' },
      href: '/fondation',
    },
  },
  {
    key: 'actions',
    href: '/actions',
    children: [
      { href: '/actions/education', label: { fr: 'Soutien à l’éducation', en: 'Education' } },
      { href: '/actions/formation-professionnelle', label: { fr: 'Formation professionnelle', en: 'Vocational training' } },
      { href: '/actions/artisanat', label: { fr: 'Ateliers d’artisanat', en: 'Craft workshops' } },
      { href: '/actions/culture', label: { fr: 'Culture & Vacances Utiles', en: 'Culture & summer programme' } },
      { href: '/actions/residences', label: { fr: 'Résidences d’artistes', en: 'Artist residencies' } },
      { href: '/actions/environnement', label: { fr: 'Environnement & agriculture', en: 'Environment & farming' } },
      { href: '/actions/sante-social', label: { fr: 'Santé & social', en: 'Health & social' } },
      { href: '/actions/tourisme-solidaire', label: { fr: 'Tourisme solidaire', en: 'Community tourism' } },
    ],
    feature: {
      image: '/images/sg/atelier-perlage.webp',
      alt: { fr: 'Atelier de perlage à la Fondation', en: 'Beadwork workshop at the Foundation' },
      title: { fr: 'Formations agréées MINEFOP', en: 'State-approved training' },
      text: { fr: 'Couture, perlage, menuiserie, maçonnerie, agriculture…', en: 'Sewing, beadwork, carpentry, masonry, farming…' },
      href: '/actions/formation-professionnelle',
    },
  },
  { key: 'news', href: '/actualites' },
  {
    key: 'stay',
    href: '/sejourner',
    children: [
      { href: '/sejourner/villa-boutanga', label: { fr: 'Villa Boutanga', en: 'Villa Boutanga' }, description: { fr: '26 chambres et suites au cœur des collines', en: '26 rooms and suites in the hills' } },
      { href: '/sejourner/restaurant', label: { fr: 'Restaurant Le Jacaranda', en: 'Le Jacaranda restaurant' } },
      { href: '/sejourner/boutique', label: { fr: 'Boutique', en: 'Shop' } },
      { href: '/sejourner/visites', label: { fr: 'Visites & infos pratiques', en: 'Visits & practical info' } },
    ],
    feature: {
      image: '/images/sg/villa-terrace.webp',
      alt: { fr: 'Terrasse de la Villa Boutanga', en: 'Villa Boutanga terrace' },
      title: { fr: 'Villa Boutanga', en: 'Villa Boutanga' },
      text: { fr: 'Séjournez au cœur de l’Ouest-Cameroun.', en: 'Stay in the heart of West Cameroon.' },
      href: '/sejourner/villa-boutanga',
    },
  },
  {
    key: 'support',
    href: '/soutenir',
    children: [
      { href: '/soutenir/don', label: { fr: 'Faire un don', en: 'Donate' } },
      { href: '/soutenir/adhesion', label: { fr: 'Devenir membre', en: 'Become a member' } },
      { href: '/soutenir/partenaires', label: { fr: 'Partenaires', en: 'Partners' } },
      { href: '/soutenir/benevolat', label: { fr: 'Bénévolat', en: 'Volunteering' } },
    ],
  },
]

export const contact = {
  address: { fr: 'Bangoulap, département du Ndé, Ouest-Cameroun', en: 'Bangoulap, Ndé division, West Cameroon' },
  hours: { fr: 'Tous les jours, 9h – 17h', en: 'Every day, 9am – 5pm' },
  email: 'contact@fondationgacha.org',
  villaEmail: 'villa@fondationgacha.org',
  phone: '+237 243 10 82 30',
  villaPhone: '+237 695 85 60 95',
  facebook: 'https://www.facebook.com/FondationJFG/',
  maisonGacha: 'https://maisongacha.fr/',
}

export const t = (value: L10n, locale: string) => value[(locale as Locale) in value ? (locale as Locale) : 'fr']
