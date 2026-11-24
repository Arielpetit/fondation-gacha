/** The admin's navigation and per-resource settings. Fields come automatically from the Payload collection configs. */
export type IconName =
  | 'home' | 'news' | 'page' | 'action' | 'media' | 'tag' | 'team' | 'handshake' | 'bed' | 'book' | 'mail' | 'inbox'
  | 'users' | 'menu' | 'cog' | 'palette' | 'award' | 'file'

export type Resource = {
  slug: string
  kind: 'collection' | 'global'
  label: string
  singular: string
  icon: IconName
  description: string
  /** Columns shown in the list (field names). */
  columns?: string[]
  titleField?: string
  /** Order of the list (Payload sort string). */
  sort?: string
  /** Hide the “new” button (read-only data such as messages). */
  readOnly?: boolean
}

export const NAV: { title: string; items: { href: string; label: string; icon: IconName; slug?: string }[] }[] = [
  { title: '', items: [{ href: '/admin', label: 'Tableau de bord', icon: 'home' }] },
  {
    title: 'Publier',
    items: [
      { href: '/admin/posts', label: 'Actualités', icon: 'news', slug: 'posts' },
      { href: '/admin/pages', label: 'Pages', icon: 'page', slug: 'pages' },
      { href: '/admin/activities', label: 'Nos actions', icon: 'action', slug: 'activities' },
      { href: '/admin/media', label: 'Médiathèque', icon: 'media', slug: 'media' },
      { href: '/admin/themes', label: 'Thèmes', icon: 'tag', slug: 'themes' },
    ],
  },
  {
    title: 'La Fondation',
    items: [
      { href: '/admin/team', label: 'Équipe et bénévoles', icon: 'team', slug: 'team' },
      { href: '/admin/partners', label: 'Partenaires', icon: 'handshake', slug: 'partners' },
      { href: '/admin/residents', label: 'Artistes en résidence', icon: 'palette', slug: 'residents' },
      { href: '/admin/rooms', label: 'Chambres de la Villa', icon: 'bed', slug: 'rooms' },
      { href: '/admin/press', label: 'Presse', icon: 'file', slug: 'press' },
      { href: '/admin/reports', label: 'Bilans d’activités', icon: 'book', slug: 'reports' },
    ],
  },
  {
    title: 'Échanges',
    items: [
      { href: '/admin/form-submissions', label: 'Messages reçus', icon: 'inbox', slug: 'form-submissions' },
      { href: '/admin/subscribers', label: 'Abonnés', icon: 'mail', slug: 'subscribers' },
    ],
  },
  {
    title: 'Réglages',
    items: [
      { href: '/admin/navigation', label: 'Menu du site', icon: 'menu', slug: 'navigation' },
      { href: '/admin/settings', label: 'Réglages du site', icon: 'cog', slug: 'settings' },
      { href: '/admin/users', label: 'Utilisateurs', icon: 'users', slug: 'users' },
    ],
  },
]

export const RESOURCES: Record<string, Resource> = {
  posts: { slug: 'posts', kind: 'collection', label: 'Actualités', singular: 'actualité', icon: 'news', description: 'Articles, événements et agenda.', columns: ['title', 'publishedAt', 'themes'], sort: '-publishedAt' },
  pages: { slug: 'pages', kind: 'collection', label: 'Pages', singular: 'page', icon: 'page', description: 'Textes des pages du site.', columns: ['title', 'path'], sort: 'path' },
  activities: { slug: 'activities', kind: 'collection', label: 'Nos actions', singular: 'action', icon: 'action', description: 'Les huit domaines d’action.', columns: ['title', 'order'], sort: 'order' },
  themes: { slug: 'themes', kind: 'collection', label: 'Thèmes', singular: 'thème', icon: 'tag', description: 'Catégories des actualités.', columns: ['title', 'slug'], sort: 'title' },
  team: { slug: 'team', kind: 'collection', label: 'Équipe et bénévoles', singular: 'personne', icon: 'team', description: 'Portraits, rôles et groupes.', columns: ['name', 'role', 'group'], sort: 'order' },
  partners: { slug: 'partners', kind: 'collection', label: 'Partenaires', singular: 'partenaire', icon: 'handshake', description: 'Logos et sites web.', columns: ['name', 'kind', 'url'], sort: 'order' },
  residents: { slug: 'residents', kind: 'collection', label: 'Artistes en résidence', singular: 'artiste', icon: 'palette', description: 'Écrivains et artistes accueillis.', columns: ['name', 'year', 'discipline'], sort: '-year' },
  rooms: { slug: 'rooms', kind: 'collection', label: 'Chambres de la Villa', singular: 'chambre', icon: 'bed', description: 'Tarifs et capacité.', columns: ['name', 'capacity', 'price'], sort: 'order' },
  press: { slug: 'press', kind: 'collection', label: 'Presse', singular: 'article de presse', icon: 'file', description: 'Revue de presse.', columns: ['title', 'outlet', 'date'], sort: '-date' },
  reports: { slug: 'reports', kind: 'collection', label: 'Bilans d’activités', singular: 'bilan', icon: 'book', description: 'Rapports annuels à télécharger.', columns: ['title', 'year'], sort: '-year' },
  subscribers: { slug: 'subscribers', kind: 'collection', label: 'Abonnés', singular: 'abonné', icon: 'mail', description: 'Lettre d’information.', columns: ['email', 'locale', 'createdAt'], sort: '-createdAt' },
  'form-submissions': { slug: 'form-submissions', kind: 'collection', label: 'Messages reçus', singular: 'message', icon: 'inbox', description: 'Contact, dons, réservations, adhésions.', columns: ['form', 'createdAt'], sort: '-createdAt', readOnly: true },
  users: { slug: 'users', kind: 'collection', label: 'Utilisateurs', singular: 'utilisateur', icon: 'users', description: 'Accès à cet espace.', columns: ['name', 'email', 'roles'], sort: 'email' },
  navigation: { slug: 'navigation', kind: 'global', label: 'Menu du site', singular: 'menu', icon: 'menu', description: 'Navigation principale et ses sous-menus.' },
  settings: { slug: 'settings', kind: 'global', label: 'Réglages du site', singular: 'réglages', icon: 'cog', description: 'Contacts, horaires, dons, adhésions.' },
}
