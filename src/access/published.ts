import type { Access } from 'payload'

/** Staff see everything; the public only sees published documents. */
export const publishedOrStaff: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}
