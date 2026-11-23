import type { GlobalConfig } from 'payload'

import { anyone, isAdminField, isStaff } from '@/access/roles'

/** Contacts, opening hours, prices and donation details shown across the site. */
export const SiteSettings: GlobalConfig = {
  slug: 'settings',
  label: 'Réglages du site',
  admin: { group: 'Administration' },
  access: { read: anyone, update: isStaff },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contacts',
          fields: [
            { name: 'address', label: 'Adresse', type: 'text', localized: true },
            { name: 'hours', label: 'Horaires', type: 'text', localized: true },
            {
              name: 'contacts',
              label: 'Contacts',
              type: 'array',
              labels: { singular: 'Contact', plural: 'Contacts' },
              fields: [
                { name: 'service', label: 'Service', type: 'text', required: true, localized: true },
                { name: 'person', label: 'Personne', type: 'text' },
                { name: 'phones', label: 'Téléphones', type: 'text', admin: { description: 'Séparés par « / »' } },
                { name: 'email', label: 'E-mail', type: 'email' },
              ],
            },
            {
              name: 'social',
              label: 'Réseaux sociaux',
              type: 'group',
              fields: [
                { name: 'facebook', type: 'text' },
                { name: 'instagram', type: 'text' },
                { name: 'youtube', type: 'text' },
                { name: 'newsletter', label: 'Inscription newsletter (URL)', type: 'text' },
              ],
            },
          ],
        },
        {
          label: 'Visites',
          fields: [
            {
              name: 'visitPrices',
              label: 'Tarifs des visites guidées',
              type: 'array',
              fields: [
                { name: 'label', label: 'Public', type: 'text', required: true, localized: true },
                { name: 'price', label: 'Prix (FCFA)', type: 'number', required: true },
              ],
            },
            { name: 'visitNotes', label: 'Informations', type: 'textarea', localized: true },
            {
              name: 'restaurantHours',
              label: 'Horaires du restaurant Le Jacaranda',
              type: 'array',
              fields: [
                { name: 'label', label: 'Service', type: 'text', required: true, localized: true },
                { name: 'hours', label: 'Horaires', type: 'text', required: true, localized: true },
              ],
            },
          ],
        },
        {
          label: 'Adhésion',
          fields: [
            {
              name: 'membershipTiers',
              label: 'Cartes de membre',
              type: 'array',
              fields: [
                { name: 'name', label: 'Nom', type: 'text', required: true, localized: true },
                { name: 'price', label: 'Prix (FCFA)', type: 'number', required: true },
                { name: 'note', label: 'Précision', type: 'text', localized: true },
                { name: 'highlighted', label: 'Mettre en avant', type: 'checkbox' },
              ],
            },
            {
              name: 'membershipPerks',
              label: 'Avantages',
              type: 'array',
              fields: [{ name: 'text', label: 'Texte', type: 'text', required: true, localized: true }],
            },
          ],
        },
        {
          label: 'Dons',
          fields: [
            { name: 'donationIntro', label: 'Texte d’introduction', type: 'textarea', localized: true },
            {
              name: 'bank',
              label: 'Virement bancaire',
              type: 'group',
              access: { update: isAdminField },
              admin: { description: 'Modifiable par les administrateurs uniquement.' },
              fields: [
                { name: 'holder', label: 'Titulaire', type: 'text' },
                { name: 'iban', label: 'IBAN', type: 'text' },
                { name: 'bic', label: 'BIC', type: 'text' },
              ],
            },
            { name: 'paypalUrl', label: 'Lien PayPal', type: 'text', access: { update: isAdminField } },
          ],
        },
      ],
    },
  ],
}
