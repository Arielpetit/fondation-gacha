import type { CollectionConfig } from 'payload'

import { isAdmin, isAdminField, isAdminOrSelf, isStaff } from '@/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Utilisateur', plural: 'Utilisateurs' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'roles'],
    group: 'Administration',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
  },
  access: {
    admin: isStaff,
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  hooks: {
    beforeChange: [
      // The very first account created through /admin becomes an administrator.
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', overrideAccess: true })
        if (totalDocs === 0) data.roles = ['admin']
        return data
      },
    ],
  },
  fields: [
    { name: 'name', label: 'Nom', type: 'text' },
    {
      name: 'roles',
      label: 'Rôles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      saveToJWT: true,
      access: { update: isAdminField, create: isAdminField },
      options: [
        { label: 'Administrateur', value: 'admin' },
        { label: 'Éditeur', value: 'editor' },
      ],
    },
  ],
}
