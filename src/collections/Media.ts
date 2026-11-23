import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '@/access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Média', plural: 'Médiathèque' },
  admin: { group: 'Contenu' },
  access: {
    read: anyone,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  fields: [
    {
      name: 'alt',
      label: 'Texte alternatif',
      type: 'text',
      required: true,
      localized: true,
    },
    { name: 'caption', label: 'Légende', type: 'text', localized: true },
    { name: 'credit', label: 'Crédit photo', type: 'text' },
    {
      // Original WordPress file URL, used to de-duplicate imports.
      name: 'legacyUrl',
      type: 'text',
      index: true,
      admin: { hidden: true },
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'application/pdf', 'video/mp4'],
    focalPoint: true,
    // Originals are re-encoded so a 6 MB camera JPG never reaches visitors.
    formatOptions: { format: 'webp', options: { quality: 82 } },
    resizeOptions: { width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true },
    imageSizes: [
      { name: 'thumb', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 800, height: 600, position: 'centre' },
      { name: 'wide', width: 1600 },
      { name: 'hero', width: 2400 },
    ],
    adminThumbnail: 'thumb',
  },
}
