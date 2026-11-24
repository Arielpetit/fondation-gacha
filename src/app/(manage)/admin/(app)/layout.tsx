import type { ReactNode } from 'react'

import { requireAdmin } from '@/admin/server'
import { Shell } from '@/components/manage/Shell'

export const dynamic = 'force-dynamic'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { payload, user } = await requireAdmin()
  const slugs = ['posts', 'media', 'themes', 'team', 'partners', 'residents', 'rooms', 'press', 'reports', 'form-submissions', 'subscribers', 'users'] as const
  const entries = await Promise.all(slugs.map(async (s) => [s, (await payload.count({ collection: s })).totalDocs] as const))
  const roles = (user.roles ?? []) as string[]
  return (
    <Shell counts={Object.fromEntries(entries)} user={{ name: user.name ?? '', email: user.email, role: roles.includes('admin') ? 'Administrateur' : 'Éditeur' }}>
      {children}
    </Shell>
  )
}
