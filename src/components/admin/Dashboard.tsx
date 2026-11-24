import Link from 'next/link'
import type { Payload } from 'payload'

import './dashboard.scss'

const fmt = (iso?: string | null) =>
  iso ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)) : ''

async function loadDashboard(payload: Payload) {
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  return Promise.all([
    payload.find({ collection: 'posts', sort: '-updatedAt', limit: 5, depth: 0, draft: true, select: { title: true, updatedAt: true, _status: true } }),
    payload.count({ collection: 'posts', where: { _status: { equals: 'draft' } } }),
    payload.find({ collection: 'form-submissions', sort: '-createdAt', limit: 5, depth: 1 }),
    payload.count({ collection: 'form-submissions', where: { createdAt: { greater_than: weekAgo } } }),
    payload.count({ collection: 'subscribers' }),
  ])
}

/**
 * Shown above the admin dashboard: quick actions, counters and the latest activity,
 * so editors land on what needs their attention.
 */
export async function Dashboard({ payload, user }: { payload: Payload; user?: { name?: string | null; email?: string } | null }) {
  const [posts, drafts, submissions, newSubmissions, subscribers] = await loadDashboard(payload)

  const hour = Number(new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', hour12: false, timeZone: 'Africa/Douala' }).format(new Date()))
  const greeting = hour >= 18 || hour < 5 ? 'Bonsoir' : 'Bonjour'
  const firstName = user?.name?.split(' ')[0]

  const shortcuts = [
    { label: 'Actualités', href: '/admin/collections/posts' },
    { label: 'Pages', href: '/admin/collections/pages' },
    { label: 'Médiathèque', href: '/admin/collections/media' },
    { label: 'Menu du site', href: '/admin/globals/navigation' },
    { label: 'Paramètres', href: '/admin/globals/settings' },
  ]

  const stats = [
    { label: 'Messages reçus (7 jours)', value: newSubmissions.totalDocs, href: '/admin/collections/form-submissions' },
    { label: 'Actualités en brouillon', value: drafts.totalDocs, href: '/admin/collections/posts?where[_status][equals]=draft' },
    { label: 'Abonnés newsletter', value: subscribers.totalDocs, href: '/admin/collections/subscribers' },
  ]

  return (
    <div className="gacha-dash">
      <div className="gacha-dash__head">
        <div>
          <p className="gacha-dash__eyebrow">Fondation Jean-Félicien Gacha</p>
          <h2 className="gacha-dash__title">
            {greeting}
            {firstName ? `, ${firstName}` : ''}
          </h2>
        </div>
        <div className="gacha-dash__actions">
          <Link className="btn btn--style-primary btn--size-medium" href="/admin/collections/posts/create">
            + Nouvelle actualité
          </Link>
          <a className="btn btn--style-secondary btn--size-medium" href="/" target="_blank" rel="noopener">
            Voir le site ↗
          </a>
        </div>
      </div>

      <nav className="gacha-dash__shortcuts" aria-label="Accès rapides">
        {shortcuts.map((x) => (
          <Link key={x.href} href={x.href}>
            {x.label}
          </Link>
        ))}
      </nav>

      <div className="gacha-dash__stats">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="gacha-dash__stat">
            <span className="gacha-dash__stat-value">{s.value}</span>
            <span className="gacha-dash__stat-label">{s.label}</span>
          </Link>
        ))}
      </div>

      <div className="gacha-dash__lists">
        <section>
          <h3>Dernières actualités modifiées</h3>
          <ul>
            {posts.docs.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/collections/posts/${p.id}`}>{p.title}</Link>
                <span>
                  {p._status === 'draft' ? 'Brouillon · ' : ''}
                  {fmt(p.updatedAt)}
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3>Derniers messages</h3>
          {submissions.docs.length === 0 ? (
            <p className="gacha-dash__empty">Aucun message pour le moment.</p>
          ) : (
            <ul>
              {submissions.docs.map((s) => {
                const form = typeof s.form === 'object' ? s.form : null
                const who = s.submissionData?.find((d) => d.field === 'nom')?.value
                return (
                  <li key={s.id}>
                    <Link href={`/admin/collections/form-submissions/${s.id}`}>
                      {form?.title ?? 'Formulaire'}
                      {who ? ` — ${who}` : ''}
                    </Link>
                    <span>{fmt(s.createdAt)}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
