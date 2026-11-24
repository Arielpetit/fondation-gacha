import Link from 'next/link'

import { requireAdmin } from '@/admin/server'
import { Icon } from '@/components/manage/Icon'
import { Badge, btn, Card } from '@/components/manage/ui'

const fmt = (iso?: string | null) => (iso ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)) : '')

export const metadata = { title: 'Tableau de bord' }

export default async function Dashboard() {
  const { payload, user } = await requireAdmin()
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString() // eslint-disable-line react-hooks/purity
  const [posts, drafts, subs, week, media] = await Promise.all([
    payload.find({ collection: 'posts', sort: '-updatedAt', limit: 6, depth: 1, draft: true, select: { title: true, updatedAt: true, _status: true, cover: true } }),
    payload.count({ collection: 'posts', where: { _status: { equals: 'draft' } } }),
    payload.count({ collection: 'subscribers' }),
    payload.count({ collection: 'form-submissions', where: { createdAt: { greater_than: weekAgo } } }),
    payload.count({ collection: 'media' }),
  ])
  const messages = await payload.find({ collection: 'form-submissions', sort: '-createdAt', limit: 5, depth: 1 })
  const hour = Number(new Intl.DateTimeFormat('fr-FR', { hour: 'numeric', hour12: false, timeZone: 'Africa/Douala' }).format(new Date()))
  const today = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Douala' }).format(new Date())
  const first = (user as { name?: string | null }).name?.split(' ')[0]

  const stats = [
    { label: 'Messages cette semaine', v: week.totalDocs, href: '/admin/form-submissions', icon: 'inbox', tone: 'text-terracotta bg-terracotta/10 dark:text-accent' },
    { label: 'Actualités en brouillon', v: drafts.totalDocs, href: '/admin/posts?status=draft', icon: 'news', tone: 'text-indigo-ndop bg-indigo-ndop/10 dark:text-[#9aa7e0]' },
    { label: 'Abonnés à la lettre', v: subs.totalDocs, href: '/admin/subscribers', icon: 'mail', tone: 'text-forest bg-forest/10 dark:text-[#8fc0a5]' },
    { label: 'Photos en ligne', v: media.totalDocs, href: '/admin/media', icon: 'media', tone: 'text-[#8a6a2f] bg-raffia/30 dark:text-raffia' },
  ] as const

  return (
    <>
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-ndop to-indigo-deep p-5 text-ivory sm:rounded-3xl sm:p-10">
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-terracotta/30 blur-[90px]" />
        <p className="eyebrow relative text-[0.65rem] text-raffia">{today}</p>
        <h1 className="relative mt-2 font-display text-[1.9rem] leading-none font-light tracking-tight sm:mt-3 sm:text-[2.6rem]">
          {hour >= 18 || hour < 5 ? 'Bonsoir' : 'Bonjour'}
          {first ? `, ${first}` : ''}
        </h1>
        <p className="relative mt-2 max-w-lg text-sm text-ivory/70 sm:mt-3 sm:text-base">Voici l’essentiel pour faire vivre le site de la Fondation.</p>
        <div className="relative mt-5 flex flex-wrap gap-2 sm:mt-7 sm:gap-3">
          <Link href="/admin/posts/new" className={btn('ghost', 'border-ivory bg-ivory text-indigo-ndop hover:bg-white')}>
            <Icon name="plus" className="size-4" /> Nouvelle actualité
          </Link>
          <Link href="/admin/media" className={btn('ghost', 'border-ivory/40 text-ivory hover:border-ivory')}>
            <Icon name="upload" className="size-4" /> Ajouter des photos
          </Link>
        </div>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:gap-4 lg:grid-cols-4" aria-label="Chiffres clés">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="group rounded-2xl border border-line bg-paper p-4 transition sm:rounded-3xl sm:p-6-[transform,box-shadow] duration-500 ease-out-expo hover:-translate-y-1 hover:shadow-[0_24px_40px_-30px_rgb(0_0_0/0.5)]">
            <span className={`grid size-9 place-items-center rounded-xl sm:size-11 sm:rounded-2xl ${s.tone}`}>
              <Icon name={s.icon} className="size-5" />
            </span>
            <p className="mt-3 font-display text-[1.9rem] leading-none font-light sm:mt-5 sm:text-[2.6rem]">{s.v}</p>
            <p className="mt-1.5 text-xs text-muted sm:mt-2 sm:text-sm">{s.label}</p>
          </Link>
        ))}
      </section>

      <div className="mt-3 grid gap-3 sm:mt-5 sm:gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-light sm:text-2xl">Dernières actualités</h2>
            <Link href="/admin/posts" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
              Tout voir <Icon name="arrow" className="size-4" />
            </Link>
          </div>
          <ul className="-mx-2">
            {posts.docs.map((p) => {
              const c = typeof p.cover === 'object' && p.cover ? (p.cover as { url?: string | null; sizes?: { thumb?: { url?: string | null } } }) : null
              const img = c?.sizes?.thumb?.url ?? c?.url
              return (
                <li key={p.id}>
                  <Link href={`/admin/posts/${p.id}`} className="grid grid-cols-[3rem_1fr_auto] items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-sand">
                    <span className="size-12 rounded-xl bg-sand bg-cover bg-center" style={img ? { backgroundImage: `url(${img})` } : undefined} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{p.title}</span>
                      <span className="text-xs text-muted">{fmt(p.updatedAt)}</span>
                    </span>
                    <Badge tone={p._status === 'draft' ? 'draft' : 'ok'}>{p._status === 'draft' ? 'Brouillon' : 'Publié'}</Badge>
                  </Link>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-light sm:text-2xl">Derniers messages</h2>
            <Link href="/admin/form-submissions" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
              Tout voir <Icon name="arrow" className="size-4" />
            </Link>
          </div>
          {messages.docs.length === 0 ? (
            <p className="rounded-2xl bg-sand px-5 py-8 text-center text-sm text-muted">Aucun message pour le moment. Ils apparaîtront ici dès qu’un visiteur écrit via le site.</p>
          ) : (
            <ul className="-mx-2">
              {messages.docs.map((m) => {
                const form = typeof m.form === 'object' ? m.form : null
                const who = m.submissionData?.find((d) => d.field === 'nom')?.value
                return (
                  <li key={m.id}>
                    <Link href={`/admin/form-submissions/${m.id}`} className="grid grid-cols-[2.5rem_1fr] items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-sand">
                      <span className="grid size-10 place-items-center rounded-xl bg-sand text-muted">
                        <Icon name="inbox" className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{form?.title ?? 'Formulaire'}</span>
                        <span className="text-xs text-muted">{who ? `${who} · ` : ''}{fmt(m.createdAt)}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="mt-5 flex gap-5 border-t border-line pt-4 text-sm text-muted">
            <span><b className="font-display text-lg font-light text-ink">{media.totalDocs}</b> fichiers</span>
          </p>
        </Card>
      </div>
    </>
  )
}
