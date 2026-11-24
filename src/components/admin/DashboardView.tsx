import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'
import type { ReactNode } from 'react'

import './dashboard.scss'

const I = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {d}
  </svg>
)
const ICON = {
  news: I(<><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" /><path d="M9 8h6M9 12h6M9 16h3" /></>),
  page: I(<><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4" /></>),
  action: I(<><circle cx="12" cy="12" r="8" /><path d="m12 8 1.6 3.4L17 12l-3.4 1.6L12 17l-1.6-3.4L7 12l3.4-1.6z" /></>),
  media: I(<><rect x="3.5" y="5" width="17" height="14" rx="3" /><circle cx="9" cy="10" r="1.6" /><path d="m5 17 5-4 3 2.5 3-3 3 3" /></>),
  tag: I(<><path d="M4 12V5h7l9 9-7 7z" /><circle cx="8.5" cy="8.5" r="1" /></>),
  team: I(<><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" /><path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.2c1.6.6 2.7 2.2 3 4.8" /></>),
  handshake: I(<><path d="M3 12l4-4 4 2 3-2 4 3 3-1" /><path d="m7 8 5 8 3-2 4 3" /></>),
  bed: I(<><path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" /><circle cx="7" cy="11" r="1.8" /></>),
  book: I(<><path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" /><path d="M5 18a2 2 0 0 1 2-2h12" /></>),
  mail: I(<><rect x="3.5" y="5.5" width="17" height="13" rx="3" /><path d="m4.5 8 7.5 5.5L19.5 8" /></>),
  inbox: I(<><path d="M4 13l2-7h12l2 7" /><path d="M4 13v5h16v-5h-5l-1 2h-4l-1-2z" /></>),
  form: I(<><rect x="5" y="3.5" width="14" height="17" rx="2.5" /><path d="M9 8h6M9 12h6M9 16h3" /></>),
  users: I(<><circle cx="12" cy="8" r="3.4" /><path d="M5 20c.7-3.7 3.4-5.5 7-5.5s6.3 1.8 7 5.5" /></>),
  redirect: I(<><path d="M5 12h12M13 6l6 6-6 6" /></>),
  cog: I(<><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>),
  menu: I(<><path d="M4 7h16M4 12h16M4 17h10" /></>),
  plus: I(<><path d="M12 5v14M5 12h14" /></>),
  arrow: I(<><path d="M4 12h16M14 6l6 6-6 6" /></>),
}

type Shortcut = { label: string; hint: string; href: string; icon: ReactNode }
const GROUPS: { title: string; items: Shortcut[] }[] = [
  {
    title: 'Contenu du site',
    items: [
      { label: 'Actualités', hint: 'Articles et agenda', href: '/admin/collections/posts', icon: ICON.news },
      { label: 'Pages', hint: 'Textes des pages', href: '/admin/collections/pages', icon: ICON.page },
      { label: 'Nos actions', hint: 'Les 8 domaines', href: '/admin/collections/activities', icon: ICON.action },
      { label: 'Médiathèque', hint: 'Photos et fichiers', href: '/admin/collections/media', icon: ICON.media },
      { label: 'Thèmes et mots-clés', hint: 'Classement', href: '/admin/collections/themes', icon: ICON.tag },
    ],
  },
  {
    title: 'La Fondation et la Villa',
    items: [
      { label: 'Équipe et bénévoles', hint: 'Portraits et rôles', href: '/admin/collections/team', icon: ICON.team },
      { label: 'Partenaires', hint: 'Logos et sites web', href: '/admin/collections/partners', icon: ICON.handshake },
      { label: 'Chambres de la Villa', hint: 'Tarifs et capacité', href: '/admin/collections/rooms', icon: ICON.bed },
      { label: 'Presse et bilans', hint: 'Documents à télécharger', href: '/admin/collections/press', icon: ICON.book },
    ],
  },
  {
    title: 'Échanges',
    items: [
      { label: 'Messages reçus', hint: 'Contact, dons, réservations', href: '/admin/collections/form-submissions', icon: ICON.inbox },
      { label: 'Formulaires', hint: 'Champs et e-mails', href: '/admin/collections/forms', icon: ICON.form },
      { label: 'Abonnés', hint: 'Lettre d’information', href: '/admin/collections/subscribers', icon: ICON.mail },
    ],
  },
  {
    title: 'Réglages',
    items: [
      { label: 'Menu du site', hint: 'Navigation principale', href: '/admin/globals/navigation', icon: ICON.menu },
      { label: 'Réglages du site', hint: 'Contacts, horaires, dons', href: '/admin/globals/settings', icon: ICON.cog },
      { label: 'Utilisateurs', hint: 'Accès à cet espace', href: '/admin/collections/users', icon: ICON.users },
      { label: 'Redirections', hint: 'Anciennes adresses', href: '/admin/collections/redirects', icon: ICON.redirect },
    ],
  },
]

const fmt = (iso?: string | null) =>
  iso ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)) : ''

export async function DashboardView({ initPageResult }: AdminViewServerProps) {
  const { payload, user } = initPageResult.req
  // eslint-disable-next-line react-hooks/purity -- server component, runs once per request
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  const [posts, drafts, subs, weekMsgs, pages, media, team] = await Promise.all([
    payload.find({ collection: 'posts', sort: '-updatedAt', limit: 6, depth: 1, draft: true, select: { title: true, updatedAt: true, _status: true, cover: true } }),
    payload.count({ collection: 'posts', where: { _status: { equals: 'draft' } } }),
    payload.count({ collection: 'subscribers' }),
    payload.count({ collection: 'form-submissions', where: { createdAt: { greater_than: weekAgo } } }),
    payload.count({ collection: 'pages' }),
    payload.count({ collection: 'media' }),
    payload.count({ collection: 'team' }),
  ])
  const messages = await payload.find({ collection: 'form-submissions', sort: '-createdAt', limit: 5, depth: 1 })

  const hour = Number(new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', hour12: false, timeZone: 'Africa/Douala' }).format(new Date()))
  const greeting = hour >= 18 || hour < 5 ? 'Bonsoir' : 'Bonjour'
  const first = (user as { name?: string | null } | null)?.name?.split(' ')[0]
  const today = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Douala' }).format(new Date())

  const stats = [
    { label: 'Messages cette semaine', value: weekMsgs.totalDocs, href: '/admin/collections/form-submissions', icon: ICON.inbox, tone: 'terracotta' },
    { label: 'Actualités en brouillon', value: drafts.totalDocs, href: '/admin/collections/posts?where[_status][equals]=draft', icon: ICON.news, tone: 'indigo' },
    { label: 'Abonnés à la lettre', value: subs.totalDocs, href: '/admin/collections/subscribers', icon: ICON.mail, tone: 'forest' },
    { label: 'Photos en ligne', value: media.totalDocs, href: '/admin/collections/media', icon: ICON.media, tone: 'raffia' },
  ]

  return (
    <div className="gdash">
      <header className="gdash__hero">
        <div>
          <p className="gdash__date">{today}</p>
          <h1>
            {greeting}
            {first ? `, ${first}` : ''}
          </h1>
          <p className="gdash__lead">Voici l’essentiel pour faire vivre le site de la Fondation.</p>
        </div>
        <div className="gdash__cta">
          <Link className="gdash__btn gdash__btn--primary" href="/admin/collections/posts/create">
            {ICON.plus} Nouvelle actualité
          </Link>
          <a className="gdash__btn" href="/" target="_blank" rel="noopener">
            Voir le site ↗
          </a>
        </div>
      </header>

      <section className="gdash__stats" aria-label="Chiffres clés">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className={`gdash__stat gdash__stat--${s.tone}`}>
            <span className="gdash__stat-ic">{s.icon}</span>
            <span className="gdash__stat-v">{s.value}</span>
            <span className="gdash__stat-l">{s.label}</span>
          </Link>
        ))}
      </section>

      <div className="gdash__cols">
        <section className="gdash__panel">
          <div className="gdash__panel-h">
            <h2>Dernières actualités</h2>
            <Link href="/admin/collections/posts">Tout voir {ICON.arrow}</Link>
          </div>
          <ul className="gdash__list">
            {posts.docs.map((p) => {
              const cover = typeof p.cover === 'object' && p.cover ? (p.cover as { url?: string | null; sizes?: { thumb?: { url?: string | null } } }) : null
              const img = cover?.sizes?.thumb?.url ?? cover?.url
              return (
                <li key={p.id}>
                  <Link href={`/admin/collections/posts/${p.id}`}>
                    <span className="gdash__thumb" style={img ? { backgroundImage: `url(${img})` } : undefined} />
                    <span className="gdash__li-t">
                      <strong>{p.title}</strong>
                      <small>{fmt(p.updatedAt)}</small>
                    </span>
                    <span className={`gdash__badge${p._status === 'draft' ? ' gdash__badge--draft' : ''}`}>{p._status === 'draft' ? 'Brouillon' : 'Publié'}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="gdash__panel">
          <div className="gdash__panel-h">
            <h2>Derniers messages</h2>
            <Link href="/admin/collections/form-submissions">Tout voir {ICON.arrow}</Link>
          </div>
          {messages.docs.length === 0 ? (
            <p className="gdash__empty">Aucun message pour le moment. Ils apparaîtront ici dès qu’un visiteur écrit via le site.</p>
          ) : (
            <ul className="gdash__list">
              {messages.docs.map((m) => {
                const form = typeof m.form === 'object' ? m.form : null
                const who = m.submissionData?.find((d) => d.field === 'nom')?.value
                return (
                  <li key={m.id}>
                    <Link href={`/admin/collections/form-submissions/${m.id}`}>
                      <span className="gdash__thumb gdash__thumb--icon">{ICON.inbox}</span>
                      <span className="gdash__li-t">
                        <strong>{form?.title ?? 'Formulaire'}</strong>
                        <small>
                          {who ? `${who} · ` : ''}
                          {fmt(m.createdAt)}
                        </small>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="gdash__mini">
            <span><b>{pages.totalDocs}</b> pages</span>
            <span><b>{team.totalDocs}</b> personnes</span>
            <span><b>{media.totalDocs}</b> fichiers</span>
          </div>
        </section>
      </div>

      {GROUPS.map((g) => (
        <section key={g.title} className="gdash__group">
          <h2>{g.title}</h2>
          <div className="gdash__grid">
            {g.items.map((it) => (
              <Link key={it.href} href={it.href} className="gdash__card">
                <span className="gdash__card-ic">{it.icon}</span>
                <span className="gdash__card-t">
                  <strong>{it.label}</strong>
                  <small>{it.hint}</small>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
