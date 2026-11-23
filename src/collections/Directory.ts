import type { CollectionConfig } from 'payload'

import { anyone, isStaff } from '@/access/roles'

const staffWrite = { read: anyone, create: isStaff, update: isStaff, delete: isStaff }

/** People: staff and volunteers. */
export const TeamMembers: CollectionConfig = {
  slug: 'team',
  labels: { singular: 'Membre de l’équipe', plural: 'Équipe & bénévoles' },
  admin: { group: 'Fondation', useAsTitle: 'name', defaultColumns: ['name', 'group', 'role', 'order'] },
  defaultSort: 'order',
  access: staffWrite,
  fields: [
    { name: 'name', label: 'Nom', type: 'text', required: true },
    { name: 'role', label: 'Fonction', type: 'text', localized: true },
    {
      name: 'group',
      label: 'Groupe',
      type: 'select',
      required: true,
      defaultValue: 'staff',
      options: [
        { label: 'Direction', value: 'board' },
        { label: 'Équipe', value: 'staff' },
        { label: 'Bénévole', value: 'volunteer' },
      ],
    },
    { name: 'photo', label: 'Photo', type: 'upload', relationTo: 'media' },
    { name: 'order', label: 'Ordre', type: 'number', defaultValue: 0 },
  ],
}

/** Writers and artists hosted in residence. */
export const Residents: CollectionConfig = {
  slug: 'residents',
  labels: { singular: 'Résident', plural: 'Résidents' },
  admin: { group: 'Fondation', useAsTitle: 'name', defaultColumns: ['name', 'year', 'discipline'] },
  defaultSort: '-year',
  access: staffWrite,
  fields: [
    { name: 'name', label: 'Nom', type: 'text', required: true },
    { name: 'year', label: 'Année', type: 'number', required: true },
    { name: 'discipline', label: 'Discipline', type: 'text', localized: true },
    { name: 'photo', label: 'Photo', type: 'upload', relationTo: 'media' },
    { name: 'post', label: 'Article associé', type: 'relationship', relationTo: 'posts' },
  ],
}

/** Partner institutions. */
export const Partners: CollectionConfig = {
  slug: 'partners',
  labels: { singular: 'Partenaire', plural: 'Partenaires' },
  admin: { group: 'Fondation', useAsTitle: 'name', defaultColumns: ['name', 'kind', 'order'] },
  defaultSort: 'order',
  access: staffWrite,
  fields: [
    { name: 'name', label: 'Nom', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'textarea', localized: true },
    {
      name: 'kind',
      label: 'Type',
      type: 'select',
      defaultValue: 'institutional',
      options: [
        { label: 'Institutionnel', value: 'institutional' },
        { label: 'Culturel', value: 'cultural' },
        { label: 'Académique', value: 'academic' },
        { label: 'Associatif', value: 'association' },
        { label: 'Mécène / entreprise', value: 'sponsor' },
      ],
    },
    { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'media' },
    { name: 'url', label: 'Site web', type: 'text' },
    { name: 'order', label: 'Ordre', type: 'number', defaultValue: 0 },
  ],
}

/** Villa Boutanga rooms and suites. */
export const Rooms: CollectionConfig = {
  slug: 'rooms',
  labels: { singular: 'Chambre', plural: 'Chambres (Villa Boutanga)' },
  admin: { group: 'Séjourner', useAsTitle: 'name', defaultColumns: ['name', 'capacity', 'price', 'order'] },
  defaultSort: 'order',
  access: staffWrite,
  fields: [
    { name: 'name', label: 'Nom', type: 'text', required: true, localized: true },
    { name: 'description', label: 'Description', type: 'textarea', localized: true },
    {
      type: 'row',
      fields: [
        { name: 'capacity', label: 'Capacité (pers.)', type: 'number', required: true },
        { name: 'price', label: 'Prix / nuit (FCFA)', type: 'number', required: true },
      ],
    },
    {
      name: 'priceVariants',
      label: 'Autres tarifs',
      type: 'array',
      fields: [
        { name: 'label', label: 'Libellé', type: 'text', localized: true },
        { name: 'price', label: 'Prix (FCFA)', type: 'number' },
      ],
    },
    { name: 'images', label: 'Photos', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'order', label: 'Ordre', type: 'number', defaultValue: 0 },
  ],
}

/** Press coverage. */
export const PressItems: CollectionConfig = {
  slug: 'press',
  labels: { singular: 'Article de presse', plural: 'Presse' },
  admin: { group: 'Ressources', useAsTitle: 'title', defaultColumns: ['title', 'outlet', 'date'] },
  defaultSort: '-date',
  access: staffWrite,
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true },
    { name: 'outlet', label: 'Média', type: 'text' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'url', label: 'Lien', type: 'text' },
    { name: 'file', label: 'Fichier (PDF / image)', type: 'upload', relationTo: 'media' },
  ],
}

/** Annual activity reports. */
export const Reports: CollectionConfig = {
  slug: 'reports',
  labels: { singular: 'Bilan d’activités', plural: 'Bilans d’activités' },
  admin: { group: 'Ressources', useAsTitle: 'title', defaultColumns: ['title', 'year'] },
  defaultSort: '-year',
  access: staffWrite,
  fields: [
    { name: 'title', label: 'Titre', type: 'text', required: true, localized: true },
    { name: 'year', label: 'Année', type: 'number', required: true },
    { name: 'file', label: 'Fichier PDF', type: 'upload', relationTo: 'media' },
    { name: 'url', label: 'Lien externe', type: 'text' },
  ],
}
