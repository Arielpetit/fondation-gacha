import type { Access, FieldAccess } from 'payload'

export type Role = 'admin' | 'editor'

type WithRoles = { roles?: Role[] | null } | null | undefined

export const hasRole = (user: WithRoles, role: Role) => Boolean(user?.roles?.includes(role))

/** Any logged-in staff member (admin or editor). Boolean-only so it also fits `access.admin`. */
export const isStaff = ({ req: { user } }: { req: { user?: unknown } }): boolean => Boolean(user)

export const isAdmin: Access = ({ req: { user } }) => hasRole(user as WithRoles, 'admin')

export const isAdminField: FieldAccess = ({ req: { user } }) => hasRole(user as WithRoles, 'admin')

/** Admins manage every user; editors can only read/update themselves. */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (hasRole(user as WithRoles, 'admin')) return true
  return { id: { equals: user.id } }
}

export const anyone: Access = () => true
