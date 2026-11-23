import type { GlobalConfig } from 'payload'

import { anyone, isStaff } from '@/access/roles'

const linkFields = [
  { name: 'label', label: 'Libellé', type: 'text' as const, required: true, localized: true },
  {
    name: 'href',
    label: 'Lien',
    type: 'text' as const,
    required: true,
    admin: { description: 'Chemin du site (ex. /actions/education) ou URL complète.' },
  },
]

/** Main menu (header mega menu, mobile menu) and footer columns. */
export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Menu du site',
  admin: { group: 'Administration' },
  access: { read: anyone, update: isStaff },
  fields: [
    {
      name: 'items',
      label: 'Rubriques',
      type: 'array',
      labels: { singular: 'Rubrique', plural: 'Rubriques' },
      admin: { initCollapsed: true, components: { RowLabel: '@/components/admin/NavRowLabel#NavRowLabel' } },
      fields: [
        ...linkFields,
        { name: 'inFooter', label: 'Afficher dans le pied de page', type: 'checkbox', defaultValue: true },
        {
          name: 'children',
          label: 'Sous-rubriques',
          type: 'array',
          admin: { initCollapsed: true },
          fields: [...linkFields, { name: 'description', label: 'Description', type: 'text', localized: true }],
        },
        {
          name: 'feature',
          label: 'Carte mise en avant (menu déroulant)',
          type: 'group',
          fields: [
            { name: 'image', label: 'Image', type: 'upload', relationTo: 'media' },
            { name: 'title', label: 'Titre', type: 'text', localized: true },
            { name: 'text', label: 'Texte', type: 'text', localized: true },
            { name: 'href', label: 'Lien', type: 'text' },
          ],
        },
      ],
    },
  ],
}
