import Link from 'next/link'
import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { Icon, type AnyIcon } from './Icon'

export function PageHeader({ title, description, children, back }: { title: string; description?: string; children?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back && (
          <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink">
            <Icon name="back" className="size-4" /> {back.label}
          </Link>
        )}
        <h1 className="font-display text-[2.1rem] leading-tight font-light tracking-tight">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  )
}

export const btn = (kind: 'primary' | 'ghost' | 'danger' = 'ghost', extra = '') =>
  cn(
    'inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium whitespace-nowrap transition-[background-color,transform,border-color,opacity] duration-300 ease-out-expo disabled:opacity-50 disabled:pointer-events-none',
    kind === 'primary' && 'bg-indigo-ndop text-ivory hover:-translate-y-0.5 hover:bg-indigo-deep dark:bg-raffia dark:text-indigo-deep dark:hover:bg-ivory',
    kind === 'ghost' && 'border border-line text-ink hover:border-ink',
    kind === 'danger' && 'border border-terracotta/40 text-terracotta hover:bg-terracotta hover:text-ivory dark:text-accent dark:hover:text-indigo-deep',
    extra,
  )

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-3xl border border-line bg-paper p-6', className)}>{children}</div>
}

export function Badge({ tone = 'neutral', children }: { tone?: 'ok' | 'draft' | 'neutral'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium',
        tone === 'ok' && 'bg-forest/15 text-forest dark:bg-[#8fc0a5]/15 dark:text-[#a9d3bb]',
        tone === 'draft' && 'bg-raffia/40 text-[#7a5a22] dark:text-raffia',
        tone === 'neutral' && 'bg-sand text-muted',
      )}
    >
      {tone !== 'neutral' && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export function Empty({ icon, title, text, children }: { icon: AnyIcon; title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-line py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-sand text-accent">
        <Icon name={icon} className="size-6" />
      </span>
      <p className="mt-4 font-display text-xl">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}
