import type { Block } from 'payload'

/** Video / map embed (YouTube, Vimeo, Google Maps…), usable inside rich text. */
export const EmbedBlock: Block = {
  slug: 'embed',
  labels: { singular: 'Vidéo / intégration', plural: 'Vidéos / intégrations' },
  interfaceName: 'EmbedBlock',
  fields: [
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      required: true,
      admin: { description: 'Lien YouTube, Vimeo, Google Maps ou autre URL intégrable.' },
    },
    { name: 'caption', label: 'Légende', type: 'text', localized: true },
  ],
}
