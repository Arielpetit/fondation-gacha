import type { CollectionConfig } from 'payload'

import { isStaff } from '@/access/roles'
import { publishedOrStaff } from '@/access/published'
import { legacyFields } from '@/fields/legacy'
import { contentField } from '@/fields/richText'
import { slugField } from '@/fields/slug'
import { previewUrl } from '@/lib/previewPath'

/** News & agenda. An item with event dates also appears in the agenda. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Actualité', plural: 'Actualités' },
  admin: {
    group: 'Contenu',
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'themes', '_status'],
    listSearchableFields: ['title', 'slug'],
    preview: (doc, { locale }) => previewUrl('posts', doc as { slug?: string; path?: string }, locale),
  },
  defaultSort: '-publishedAt',
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 25 },
  access: {
    read: publishedOrStaff,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true, localized: true },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenu',
          fields: [
            {
              name: 'summary',
              label: 'Chapeau',
              type: 'textarea',
              localized: true,
              admin: { description: 'Résumé affiché sur les cartes et en tête d’article (2–3 phrases).' },
            },
            { name: 'cover', label: 'Image de couverture', type: 'upload', relationTo: 'media' },
            contentField(),
          ],
        },
        {
          label: 'Agenda',
          description: 'Renseignez les dates pour faire apparaître l’actualité dans l’agenda.',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'eventStart', label: 'Début', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
                { name: 'eventEnd', label: 'Fin', type: 'date', admin: { date: { pickerAppearance: 'dayOnly' } } },
              ],
            },
            {
              name: 'eventLabel',
              label: 'Libellé des dates',
              type: 'text',
              localized: true,
              admin: { description: 'Ex. « Du 13 au 20 janvier 2025 ». Laissé vide, il est calculé depuis les dates.' },
            },
            { name: 'place', label: 'Lieu', type: 'text', localized: true },
          ],
        },
      ],
    },
    slugField(),
    {
      name: 'publishedAt',
      label: 'Date de publication',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      index: true,
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'themes',
      label: 'Thèmes',
      type: 'relationship',
      relationTo: 'themes',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'tags',
      label: 'Mots-clés',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: { position: 'sidebar' },
    },
    { name: 'featured', label: 'Mettre en avant', type: 'checkbox', admin: { position: 'sidebar' } },
    legacyFields,
  ],
}
