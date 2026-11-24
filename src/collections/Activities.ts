import type { CollectionConfig } from 'payload'

import { isStaff } from '@/access/roles'
import { publishedOrStaff } from '@/access/published'
import { legacyFields } from '@/fields/legacy'
import { contentField } from '@/fields/richText'
import { slugField } from '@/fields/slug'
import { previewUrl } from '@/lib/previewPath'

/** The Foundation's fields of action ("Nos actions"). */
export const Activities: CollectionConfig = {
  slug: 'activities',
  labels: { singular: 'Action', plural: 'Nos actions' },
  admin: {
    group: 'Contenu',
    hidden: true, // fixed structure of the site: not edited by the team
    useAsTitle: 'title',
    defaultColumns: ['title', 'order', '_status'],
    preview: (doc, { locale }) => previewUrl('activities', doc as { slug?: string; path?: string }, locale),
  },
  defaultSort: 'order',
  versions: { drafts: true, maxPerDoc: 20 },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true, localized: true },
    {
      name: 'summary',
      label: 'Résumé',
      type: 'textarea',
      required: true,
      localized: true,
      admin: { description: 'Une à deux phrases, affichées sur la carte.' },
    },
    { name: 'cover', label: 'Image', type: 'upload', relationTo: 'media' },
    contentField(),
    {
      name: 'highlights',
      label: 'Points clés',
      type: 'array',
      labels: { singular: 'Point clé', plural: 'Points clés' },
      fields: [{ name: 'text', label: 'Texte', type: 'text', required: true, localized: true }],
    },
    slugField(),
    { name: 'order', label: 'Ordre', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    {
      name: 'motif',
      label: 'Motif Ndop',
      type: 'select',
      defaultValue: 'dots',
      admin: { position: 'sidebar' },
      options: ['dots', 'zigzag', 'diamonds', 'checker', 'moon', 'spider', 'ladder'].map((v) => ({ label: v, value: v })),
    },
    legacyFields,
  ],
}
