'use client'

import { useRouter } from 'next/navigation'
import { useState, useSyncExternalStore, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { Icon } from './Icon'
import { Sidebar } from './Sidebar'

export function Shell({ children, counts, user }: { children: ReactNode; counts: Record<string, number>; user: { name: string; email: string; role: string } }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const dark = useSyncExternalStore(
    (cb) => {
      const o = new MutationObserver(cb)
      o.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
      return () => o.disconnect()
    },
    () => document.documentElement.classList.contains('dark'),
    () => false,
  )

  const toggleTheme = () => {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    document.documentElement.style.colorScheme = next ? 'dark' : 'light'
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {}
  }
  const logout = async () => {
    await fetch('/api/users/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }
  const initials = (user.name || user.email).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

  return (
    <div className="min-h-screen lg:pl-64">
      <Sidebar counts={counts} open={open} onClose={() => setOpen(false)} />
      <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur-md sm:px-8">
        <button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl border border-line lg:hidden" aria-label="Ouvrir le menu">
          <Icon name="burger" />
        </button>
        <div className="flex-1" />
        <button type="button" onClick={toggleTheme} className="grid size-10 place-items-center rounded-full border border-line text-ink/80 transition-colors hover:bg-sand" aria-label={dark ? 'Thème clair' : 'Thème sombre'}>
          <Icon name={dark ? 'sun' : 'moon'} />
        </button>
        <div className="flex items-center gap-3 rounded-full border border-line py-1 pr-1 pl-4">
          <span className="hidden text-right leading-tight sm:block">
            <span className="block text-sm font-medium">{user.name || user.email}</span>
            <span className="block text-[0.7rem] text-muted">{user.role}</span>
          </span>
          <span className="grid size-8 place-items-center rounded-full bg-indigo-ndop text-xs font-medium text-raffia dark:bg-indigo-soft">{initials}</span>
          <button type="button" onClick={logout} className={cn('grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-sand hover:text-ink')} aria-label="Se déconnecter" title="Se déconnecter">
            <Icon name="out" className="size-4" />
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-8">{children}</main>
    </div>
  )
}
