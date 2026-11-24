'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { NAV } from '@/admin/resources'
import { FoundationMark } from '@/components/ui/Logo'
import { cn } from '@/lib/cn'

import { Icon } from './Icon'

export function Sidebar({
  counts,
  open,
  onClose,
}: {
  counts: Record<string, number>
  open: boolean
  onClose: () => void
}) {
  const path = usePathname()
  const active = (href: string) =>
    href === '/admin' ? path === '/admin' : path === href || path.startsWith(href + '/')
  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden',
          open ? 'block' : 'hidden',
        )}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-indigo-deep text-ivory transition-transform duration-500 ease-out-expo lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Link href="/admin" onClick={onClose} className="flex items-center gap-3 px-5 pt-6 pb-4">
          <FoundationMark className="w-11 text-raffia" />
          <span className="leading-tight">
            <span className="block font-display text-[1.05rem]">Fondation Gacha</span>
            <span className="eyebrow block pt-1 text-[0.58rem] text-raffia">Espace équipe</span>
          </span>
        </Link>
        <nav
          className="flex-1 space-y-5 overflow-y-auto px-3 pt-2 pb-4"
          aria-label="Administration"
        >
          {NAV.map((g) => (
            <div key={g.title || 'main'}>
              {g.title && (
                <p className="eyebrow px-3 pb-2 text-[0.6rem] text-ivory/45">{g.title}</p>
              )}
              <ul className="space-y-0.5">
                {g.items.map((it) => {
                  const on = active(it.href)
                  const n = it.slug ? counts[it.slug] : undefined
                  return (
                    <li key={it.href}>
                      <Link
                        href={it.href}
                        onClick={onClose}
                        aria-current={on ? 'page' : undefined}
                        className={cn(
                          'group flex items-center gap-3 rounded-xl px-3 py-2 text-[0.9rem] transition-colors duration-300',
                          on
                            ? 'bg-raffia/15 font-medium text-white shadow-[inset_3px_0_0_var(--color-raffia)]'
                            : 'text-ivory/75 hover:bg-ivory/8 hover:text-white',
                        )}
                      >
                        <Icon
                          name={it.icon}
                          className={cn(
                            'size-[1.15rem] shrink-0',
                            on ? 'text-raffia' : 'text-ivory/60 group-hover:text-raffia',
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate">{it.label}</span>
                        {n !== undefined && n > 0 && (
                          <span className="rounded-full bg-ivory/10 px-2 py-0.5 text-[0.68rem] text-ivory/70">
                            {n}
                          </span>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-ivory/10 p-3">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- leaves the admin for the public site */}
          <a
            href="/"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ivory/75 transition-colors hover:bg-ivory/8 hover:text-white"
          >
            <Icon name="ext" className="size-[1.1rem]" /> Voir le site
          </a>
        </div>
      </aside>
    </>
  )
}
