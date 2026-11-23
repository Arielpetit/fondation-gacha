import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '@/access/roles'
import { slugField } from '@/fields/slug'

/** Curated themes used to filter news (Culture, Éducation…). */
export const Themes: CollectionConfig = {
  slug: 'themes',
  labels: { singular: 'Thème', plural: 'Thèmes' },
  admin: { group: 'Classement', useAsTitle: 'title', defaultColumns: ['title', 'slug'] },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: 'title', label: 'Nom', type: 'text', required: true, localized: true },
    slugField(),
    {
      name: 'tone',
      label: 'Couleur',
      type: 'select',
      defaultValue: 'terracotta',
      options: [
        { label: 'Terracotta', value: 'terracotta' },
        { label: 'Indigo', value: 'indigo' },
        { label: 'Forêt', value: 'forest' },
      ],
    },
  ],
}

/** Free keywords, imported from the old site's WordPress tags. */
export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: { singular: 'Mot-clé', plural: 'Mots-clés' },
  admin: { group: 'Classement', useAsTitle: 'title' },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  fields: [
    { name: 'title', label: 'Nom', type: 'text', required: true },
    slugField(),
    { name: 'wpId', type: 'number', index: true, admin: { hidden: true } },
  ],
}
