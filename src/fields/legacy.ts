import type { Field } from 'payload'

/** Read-only trace of where a document came from on the old WordPress site. */
export const legacyFields: Field = {
  name: 'legacy',
  label: 'Ancien site (WordPress)',
  type: 'group',
  admin: {
    position: 'sidebar',
    readOnly: true,
    condition: (data) => Boolean(data?.legacy?.wpId),
  },
  fields: [
    { name: 'wpId', label: 'ID WordPress', type: 'number', index: true },
    { name: 'url', label: 'Ancienne URL', type: 'text' },
  ],
}
