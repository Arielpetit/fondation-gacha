import type { Field } from 'payload'

/** Serializable description of a form field, built from a Payload field config. */
export type FieldDef = {
  name: string
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'date' | 'email' | 'relationship' | 'upload' | 'richtext' | 'array' | 'group' | 'json'
  label: string
  required?: boolean
  localized?: boolean
  description?: string
  readOnly?: boolean
  options?: { label: string; value: string }[]
  hasMany?: boolean
  relationTo?: string
  fields?: FieldDef[]
  /** Shown in the right-hand column. */
  sidebar?: boolean
  /** Section title (from a Payload tab). */
  section?: string
  defaultValue?: unknown
  rowLabel?: string
}

const str = (v: unknown, fallback = ''): string => {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object') {
    const o = v as Record<string, string>
    return o.fr ?? o.en ?? Object.values(o)[0] ?? fallback
  }
  return fallback
}

const HIDDEN = new Set(['id', 'createdAt', 'updatedAt', 'sessions', 'hash', 'salt', 'loginAttempts', 'lockUntil', 'resetPasswordToken', 'resetPasswordExpiration', 'legacyId', 'legacyUrl', 'legacy', 'folder', 'url', 'thumbnailURL', 'filename', 'mimeType', 'filesize', 'width', 'height', 'focalX', 'focalY', 'sizes', 'enableAPIKey', 'apiKey', 'apiKeyIndex', '_verified', '_verificationToken'])

export function toFieldDefs(fields: Field[], section?: string): FieldDef[] {
  const out: FieldDef[] = []
  for (const f of fields as any[]) {
    const admin = f.admin ?? {}
    if (admin.hidden || admin.disabled) continue
    if (f.type === 'row' || f.type === 'collapsible') {
      out.push(...toFieldDefs(f.fields, section))
      continue
    }
    if (f.type === 'tabs') {
      for (const t of f.tabs) {
        const title = str(t.label, t.name ?? '')
        if (t.name) out.push({ name: t.name, type: 'group', label: title, localized: t.localized, fields: toFieldDefs(t.fields), section: title })
        else out.push(...toFieldDefs(t.fields, title))
      }
      continue
    }
    if (!f.name || HIDDEN.has(f.name) || f.type === 'ui' || f.type === 'blocks') continue
    const base = {
      name: f.name as string,
      label: str(f.label, f.name),
      required: Boolean(f.required),
      localized: Boolean(f.localized),
      description: str(admin.description) || undefined,
      readOnly: Boolean(admin.readOnly),
      sidebar: admin.position === 'sidebar',
      section: f.name === 'meta' ? 'Référencement (SEO)' : section,
      defaultValue: typeof f.defaultValue === 'function' ? undefined : f.defaultValue,
    }
    switch (f.type) {
      case 'text':
        out.push({ ...base, type: 'text', hasMany: f.hasMany })
        break
      case 'email':
        out.push({ ...base, type: 'email' })
        break
      case 'textarea':
        out.push({ ...base, type: 'textarea' })
        break
      case 'number':
        out.push({ ...base, type: 'number' })
        break
      case 'checkbox':
        out.push({ ...base, type: 'checkbox' })
        break
      case 'date':
        out.push({ ...base, type: 'date' })
        break
      case 'select':
      case 'radio':
        out.push({ ...base, type: 'select', hasMany: f.hasMany, options: f.options.map((o: any) => (typeof o === 'string' ? { label: o, value: o } : { label: str(o.label), value: String(o.value) })) })
        break
      case 'relationship':
        if (typeof f.relationTo === 'string') out.push({ ...base, type: 'relationship', relationTo: f.relationTo, hasMany: f.hasMany })
        break
      case 'upload':
        out.push({ ...base, type: 'upload', relationTo: f.relationTo })
        break
      case 'richText':
        out.push({ ...base, type: 'richtext' })
        break
      case 'array':
        out.push({ ...base, type: 'array', fields: toFieldDefs(f.fields), rowLabel: f.labels ? str(f.labels.singular) : undefined })
        break
      case 'group':
        out.push({ ...base, type: 'group', fields: toFieldDefs(f.fields) })
        break
      case 'json':
        out.push({ ...base, type: 'json' })
        break
    }
  }
  return out
}
