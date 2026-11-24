import type { Payload } from 'payload'

import { lexicalMediaIds, lexicalToEditor, type MediaInfo } from '@/admin/richtext'
import type { FieldDef } from '@/admin/schema'
import { normalize, schemaFor } from '@/admin/server'

export type FormProps = {
  slug: string
  id: string | null
  locale: 'fr' | 'en'
  fields: FieldDef[]
  values: Record<string, any>
  drafts: boolean
  isGlobal: boolean
  status: 'draft' | 'published' | null
  media: Record<number, MediaInfo & { filename?: string }>
  options: Record<string, { value: number | string; label: string }[]>
  title: string
}

const rels = (fields: FieldDef[], out = new Set<string>()) => {
  for (const f of fields) {
    if (f.type === 'relationship' && f.relationTo) out.add(f.relationTo)
    if (f.fields) rels(f.fields, out)
  }
  return out
}
const richNames = (fields: FieldDef[]) => fields.filter((f) => f.type === 'richtext').map((f) => f.name)

export async function loadFormProps(payload: Payload, user: any, slug: string, id: string | 'global' | 'new', locale: 'fr' | 'en'): Promise<FormProps> {
  const sc = schemaFor(payload, slug)
  const isGlobal = id === 'global'
  const common = { locale, fallbackLocale: false as const, depth: 1, user, overrideAccess: false }
  let doc: any = null
  if (isGlobal) doc = await payload.findGlobal({ slug: slug as 'settings', ...common })
  else if (id !== 'new') doc = await payload.findByID({ collection: slug as 'posts', id, draft: sc.drafts, ...common })

  const media = new Map<number, MediaInfo & { filename?: string }>()
  const values = normalize(sc.fields, doc, media)
  // Rich text: Lexical → editor document (needs the URLs of the images it contains).
  const ids = new Set<number>()
  for (const n of richNames(sc.fields)) lexicalMediaIds(values[n]).forEach((i) => ids.add(i))
  const missing = [...ids].filter((i) => !media.has(i))
  if (missing.length) {
    const r = await payload.find({ collection: 'media', where: { id: { in: missing } }, limit: 200, depth: 0, user, overrideAccess: false })
    for (const m of r.docs) media.set(m.id, { id: m.id, url: (m.sizes?.card?.url ?? m.url) as string, alt: m.alt ?? '', filename: m.filename ?? '' })
  }
  for (const n of richNames(sc.fields)) values[n] = lexicalToEditor(values[n] && typeof values[n] === 'object' ? values[n] : null, media)

  const options: FormProps['options'] = {}
  for (const rel of rels(sc.fields)) {
    if (rel === 'media') continue
    const c = payload.collections[rel as keyof typeof payload.collections]?.config
    if (!c) continue
    const t = c.admin.useAsTitle ?? 'id'
    const r = await payload.find({ collection: rel as 'themes', limit: 300, depth: 0, sort: t, user, overrideAccess: false, locale })
    options[rel] = r.docs.map((d: any) => ({ value: d.id, label: String(d[t] ?? d.id) }))
  }

  return {
    slug,
    id: isGlobal || id === 'new' ? null : String(id),
    locale,
    fields: sc.fields,
    values,
    drafts: sc.drafts,
    isGlobal,
    status: sc.drafts ? (doc?._status === 'published' ? 'published' : doc ? 'draft' : null) : null,
    media: Object.fromEntries(media),
    options,
    title: doc ? String(doc[sc.titleField] ?? '') : '',
  }
}
