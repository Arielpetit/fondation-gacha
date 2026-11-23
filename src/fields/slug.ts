import type { Field, FieldHook } from 'payload'

export const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[’'`]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)

const formatSlug =
  (source: string): FieldHook =>
  ({ value, data, originalDoc }) => {
    if (typeof value === 'string' && value.trim()) return slugify(value)
    const from = data?.[source] ?? originalDoc?.[source]
    if (typeof from === 'string' && from.trim()) return slugify(from)
    if (from && typeof from === 'object') {
      // Localized source field: use the French value.
      const fr = (from as Record<string, unknown>).fr
      if (typeof fr === 'string') return slugify(fr)
    }
    return value
  }

/** URL slug, generated from `source` when left empty. Shared across locales. */
export const slugField = (source = 'title'): Field => ({
  name: 'slug',
  label: 'Slug (URL)',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'Généré automatiquement depuis le titre si laissé vide.',
  },
  hooks: { beforeValidate: [formatSlug(source)] },
})
