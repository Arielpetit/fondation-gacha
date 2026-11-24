import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@payload-config'

import { RESOURCES } from './resources'
import { toFieldDefs, type FieldDef } from './schema'

export async function getAdmin() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return { payload, user }
}

/** For pages and actions: the signed-in staff user, or a redirect to the login page. */
export async function requireAdmin() {
  const { payload, user } = await getAdmin()
  const roles = ((user as { roles?: string[] } | null)?.roles ?? []) as string[]
  if (!user || !(roles.includes('admin') || roles.includes('editor'))) redirect('/admin/login')
  return { payload, user: user as NonNullable<typeof user> & { roles?: string[]; name?: string | null; email: string } }
}

export function resourceOrThrow(slug: string) {
  const r = RESOURCES[slug]
  if (!r) throw new Error(`Unknown resource: ${slug}`)
  return r
}

export function schemaFor(payload: Awaited<ReturnType<typeof getAdmin>>['payload'], slug: string): { fields: FieldDef[]; drafts: boolean; titleField: string; localized: boolean } {
  const r = resourceOrThrow(slug)
  if (r.kind === 'global') {
    const g = payload.globals.config.find((x) => x.slug === slug)!
    return { fields: toFieldDefs(g.fields), drafts: false, titleField: 'id', localized: true }
  }
  const c = payload.collections[slug as keyof typeof payload.collections].config
  const fields = toFieldDefs(c.fields)
  if (slug === 'users') {
    fields.unshift(
      { name: 'email', type: 'email', label: 'E-mail', required: true },
      { name: 'password', type: 'text', label: 'Mot de passe', description: 'Laissez vide pour ne pas le changer (8 caractères minimum).' },
    )
  }
  return {
    fields,
    drafts: Boolean(c.versions && (c.versions as { drafts?: unknown }).drafts),
    titleField: c.admin.useAsTitle ?? 'id',
    localized: Boolean(payload.config.localization),
  }
}

/** Populated relations → ids, so the form holds plain values. */
export function normalize(fields: FieldDef[], doc: Record<string, any> | null | undefined, media: Map<number, { id: number; url: string; alt?: string; filename?: string }>): Record<string, any> {
  const out: Record<string, any> = {}
  const d = doc ?? {}
  for (const f of fields) {
    const v = d[f.name]
    if (f.type === 'upload' || f.type === 'relationship') {
      const toId = (x: any) => {
        if (x && typeof x === 'object') {
          if (f.type === 'upload' && x.id) media.set(Number(x.id), { id: x.id, url: x.sizes?.card?.url ?? x.url, alt: x.alt, filename: x.filename })
          return x.id
        }
        return x
      }
      out[f.name] = f.hasMany ? (Array.isArray(v) ? v.map(toId) : []) : v == null ? null : toId(v)
    } else if (f.type === 'array') {
      out[f.name] = (Array.isArray(v) ? v : []).map((row: any) => ({ id: row.id, ...normalize(f.fields ?? [], row, media) }))
    } else if (f.type === 'group') {
      out[f.name] = normalize(f.fields ?? [], v, media)
    } else if (f.type === 'checkbox') out[f.name] = Boolean(v ?? f.defaultValue ?? false)
    else out[f.name] = v ?? (f.hasMany ? [] : f.defaultValue ?? (f.type === 'number' || f.type === 'date' ? null : ''))
  }
  return out
}
