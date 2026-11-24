import Link from 'next/link'
import { notFound } from 'next/navigation'

import { RESOURCES } from '@/admin/resources'
import { requireAdmin } from '@/admin/server'
import { btn, Card, PageHeader } from '@/components/manage/ui'
import { loadFormProps } from '@/components/manage/loadForm'
import { ResourceForm } from '@/components/manage/ResourceForm'

export const dynamic = 'force-dynamic'

export default async function EditPage({ params, searchParams }: { params: Promise<{ resource: string; id: string }>; searchParams: Promise<{ lang?: string }> }) {
  const { resource, id } = await params
  const { lang } = await searchParams
  const r = RESOURCES[resource]
  if (!r || r.kind === 'global') notFound()
  const { payload, user } = await requireAdmin()

  // Messages are read-only: show what the visitor wrote.
  if (resource === 'form-submissions') {
    const d: any = await payload.findByID({ collection: 'form-submissions', id, depth: 1, user, overrideAccess: false }).catch(() => null)
    if (!d) notFound()
    const form = typeof d.form === 'object' ? d.form : null
    return (
      <>
        <PageHeader title={form?.title ?? 'Message'} description={new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short' }).format(new Date(d.createdAt))} back={{ href: '/admin/form-submissions', label: 'Messages reçus' }} />
        <Card className="max-w-3xl">
          <dl className="divide-y divide-line">
            {(d.submissionData ?? []).map((x: any) => (
              <div key={x.id ?? x.field} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <dt className="text-sm text-muted">{x.field}</dt>
                <dd className="text-sm break-words whitespace-pre-wrap">{String(x.value)}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <div className="mt-6">
          <Link href="/admin/form-submissions" className={btn('ghost')}>← Retour à la liste</Link>
        </div>
      </>
    )
  }

  const locale = lang === 'en' ? 'en' : 'fr'
  let props
  try {
    props = await loadFormProps(payload, user, resource, id, locale)
  } catch {
    notFound()
  }
  return (
    <>
      <PageHeader title={id === 'new' ? `Nouvelle ${r.singular}` : props.title || r.singular} description={id === 'new' ? undefined : r.description} back={{ href: `/admin/${resource}`, label: r.label }} />
      <ResourceForm {...props} />
    </>
  )
}
