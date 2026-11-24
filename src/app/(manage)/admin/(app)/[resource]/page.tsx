import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RESOURCES } from '@/admin/resources'
import { requireAdmin, schemaFor } from '@/admin/server'
import type { FieldDef } from '@/admin/schema'
import { Icon } from '@/components/manage/Icon'
import { Badge, btn, Empty, PageHeader } from '@/components/manage/ui'
import { loadFormProps } from '@/components/manage/loadForm'
import { ResourceForm } from '@/components/manage/ResourceForm'

export const dynamic = 'force-dynamic'
const PER = 20
const fmt = (iso?: string | null) => (iso ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)) : '—')

function cell(f: FieldDef | undefined, name: string, v: any) {
  if (v == null || v === '') return <span className="text-muted">—</span>
  if (name === 'createdAt' || name === 'updatedAt' || f?.type === 'date') return fmt(v)
  if (f?.type === 'select') {
    const label = (x: string) => f.options?.find((o) => o.value === x)?.label ?? x
    return Array.isArray(v) ? v.map(label).join(', ') : label(v)
  }
  if (f?.type === 'relationship' || name === 'form') {
    const t = (x: any) => (typeof x === 'object' ? (x.title ?? x.name ?? x.email ?? x.id) : x)
    return Array.isArray(v) ? v.map(t).join(', ') : String(t(v))
  }
  if (f?.type === 'checkbox') return v ? 'Oui' : 'Non'
  if (typeof v === 'object') return '—'
  return <span className="line-clamp-2">{String(v)}</span>
}

export default async function ResourcePage({ params, searchParams }: { params: Promise<{ resource: string }>; searchParams: Promise<{ q?: string; page?: string; status?: string }> }) {
  const { resource } = await params
  const r = RESOURCES[resource]
  if (!r) notFound()
  const { payload, user } = await requireAdmin()

  // Globals open straight on their form.
  if (r.kind === 'global') {
    const props = await loadFormProps(payload, user, resource, 'global', 'fr')
    return (
      <>
        <PageHeader title={r.label} description={r.description} />
        <ResourceForm {...props} />
      </>
    )
  }

  const { q = '', page = '1', status = '' } = await searchParams
  const sc = schemaFor(payload, resource)
  const cols = r.columns ?? [sc.titleField]
  const where: any = { and: [] }
  if (q) where.and.push({ [sc.titleField]: { like: q } })
  if (status && sc.drafts) where.and.push({ _status: { equals: status } })
  const res = await payload.find({ collection: resource as 'posts', where, sort: r.sort, limit: PER, page: Number(page) || 1, depth: 1, draft: sc.drafts, user, overrideAccess: false })
  const img = (d: any) => {
    const m = d.cover ?? d.photo ?? d.logo ?? d.image
    return typeof m === 'object' && m ? (m.sizes?.thumb?.url ?? m.url) : null
  }
  const defs = new Map(sc.fields.map((f) => [f.name, f]))
  const qs = (p: number) => `?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), page: String(p) })}`
  const chips = [{ v: '', l: 'Tout' }, { v: 'published', l: 'Publiés' }, { v: 'draft', l: 'Brouillons' }]

  return (
    <>
      <PageHeader title={r.label} description={r.description}>
        {!r.readOnly && (
          <Link href={`/admin/${resource}/new`} className={btn('primary')}>
            <Icon name="plus" className="size-4" /> Nouveau
          </Link>
        )}
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <form className="relative min-w-60 flex-1 sm:max-w-sm">
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Rechercher…" className="h-11 w-full rounded-full border border-line bg-paper pr-4 pl-11 text-sm outline-none focus:border-accent" />
          {status && <input type="hidden" name="status" value={status} />}
        </form>
        {sc.drafts && (
          <div className="flex rounded-full border border-line bg-paper p-1 text-sm">
            {chips.map((c) => (
              <Link key={c.v} href={`?${new URLSearchParams({ ...(q ? { q } : {}), ...(c.v ? { status: c.v } : {}) })}`} className={`rounded-full px-4 py-1.5 transition-colors ${status === c.v ? 'bg-ink text-canvas' : 'text-muted hover:text-ink'}`}>
                {c.l}
              </Link>
            ))}
          </div>
        )}
        <span className="ml-auto text-sm text-muted">{res.totalDocs} résultat{res.totalDocs > 1 ? 's' : ''}</span>
      </div>

      {res.docs.length === 0 ? (
        <Empty icon={r.icon} title="Rien à afficher" text={q ? `Aucun résultat pour « ${q} ».` : 'Cette liste est vide pour le moment.'}>
          {!r.readOnly && !q && (
            <Link href={`/admin/${resource}/new`} className={btn('primary')}>
              <Icon name="plus" className="size-4" /> Ajouter
            </Link>
          )}
        </Empty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-paper sm:rounded-3xl">
          <table className="w-full text-left text-[0.8rem] sm:text-sm">
            <thead className="border-b border-line text-[0.7rem] tracking-widest text-muted uppercase">
              <tr>
                {cols.map((c) => (
                  <th key={c} className="px-3 py-3 font-medium sm:px-5 sm:py-3.5">{defs.get(c)?.label ?? (c === 'createdAt' ? 'Date' : c === 'form' ? 'Formulaire' : c)}</th>
                ))}
                {sc.drafts && <th className="px-3 py-3 font-medium sm:px-5 sm:py-3.5">Statut</th>}
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {res.docs.map((d: any) => (
                <tr key={d.id} className="group border-b border-line/70 transition-colors last:border-0 hover:bg-sand/60">
                  {cols.map((c, i) => (
                    <td key={c} className="px-3 py-2.5 align-middle sm:px-5 sm:py-3">
                      {i === 0 ? (
                        <Link href={`/admin/${resource}/${d.id}`} className="flex items-center gap-3 font-medium">
                          {img(d) && <Image src={img(d)} alt="" width={40} height={40} className="size-8 shrink-0 rounded-lg object-cover sm:size-10" unoptimized />}
                          <span className="min-w-0 group-hover:underline">{cell(defs.get(c), c, d[c])}</span>
                        </Link>
                      ) : (
                        <span className="text-ink/80">{cell(defs.get(c), c, d[c])}</span>
                      )}
                    </td>
                  ))}
                  {sc.drafts && <td className="px-3 py-2.5 sm:px-5 sm:py-3"><Badge tone={d._status === 'draft' ? 'draft' : 'ok'}>{d._status === 'draft' ? 'Brouillon' : 'Publié'}</Badge></td>}
                  <td className="pr-4 text-right">
                    <Link href={`/admin/${resource}/${d.id}`} aria-label="Ouvrir" className="text-muted opacity-0 transition-opacity group-hover:opacity-100">
                      <Icon name="arrow" className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {res.totalPages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-2 text-sm" aria-label="Pagination">
          {res.hasPrevPage && <Link href={qs(res.page! - 1)} className={btn('ghost', 'h-9 px-4')}>← Précédent</Link>}
          <span className="px-3 text-muted">Page {res.page} sur {res.totalPages}</span>
          {res.hasNextPage && <Link href={qs(res.page! + 1)} className={btn('ghost', 'h-9 px-4')}>Suivant →</Link>}
        </nav>
      )}
    </>
  )
}
