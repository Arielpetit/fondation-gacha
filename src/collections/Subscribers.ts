import type { CollectionConfig } from 'payload'

import { isAdmin, isStaff } from '@/access/roles'

/** Newsletter sign-ups from the site footer. Optionally mirrored to Mailchimp (see /api/newsletter). */
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Abonné', plural: 'Abonnés newsletter' },
  admin: { group: 'Formulaires', useAsTitle: 'email', defaultColumns: ['email', 'locale', 'mailchimp', 'createdAt'] },
  defaultSort: '-createdAt',
  access: {
    // Created only through the /api/newsletter route (server-side, with validation and rate limiting).
    create: isStaff,
    read: isStaff,
    update: isStaff,
    delete: isAdmin,
  },
  fields: [
    { name: 'email', label: 'E-mail', type: 'email', required: true, unique: true, index: true },
    {
      name: 'locale',
      label: 'Langue',
      type: 'select',
      defaultValue: 'fr',
      options: [
        { label: 'Français', value: 'fr' },
        { label: 'English', value: 'en' },
      ],
    },
    {
      name: 'mailchimp',
      label: 'Synchronisé avec Mailchimp',
      type: 'checkbox',
      admin: { readOnly: true },
    },
  ],
}
