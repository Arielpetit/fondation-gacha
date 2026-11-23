import type { CollectionConfig } from 'payload'

import { isStaff } from '@/access/roles'
import { publishedOrStaff } from '@/access/published'
import { legacyFields } from '@/fields/legacy'
import { contentField } from '@/fields/richText'
import { slugField } from '@/fields/slug'

/**
 * Editorial pages (Présentation, Infrastructures, Villa Boutanga…).
 * `path` is the full public path, e.g. "fondation/infrastructures".
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },
  admin: {
    group: 'Contenu',
    useAsTitle: 'title',
    defaultColumns: ['title', 'path', '_status', 'updatedAt'],
    preview: (doc) => `/${doc.path ?? ''}`,
  },
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 25 },
  access: { read: publishedOrStaff, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true, localized: true },
    {
      name: 'path',
      label: 'Chemin',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { position: 'sidebar', description: 'Ex. fondation/infrastructures (sans / au début).' },
    },
    slugField(),
    {
      type: 'group',
      name: 'hero',
      label: 'En-tête',
      fields: [
        { name: 'eyebrow', label: 'Surtitre', type: 'text', localized: true },
        { name: 'intro', label: 'Introduction', type: 'textarea', localized: true },
        { name: 'image', label: 'Image', type: 'upload', relationTo: 'media' },
      ],
    },
    contentField(),
    legacyFields,
  ],
}
