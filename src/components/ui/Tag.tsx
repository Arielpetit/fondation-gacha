import type { ReactNode } from 'react'

import { cn } from '@/lib/cn'

export function Tag({
  children,
  tone = 'default',
  className,
}: {
  children: ReactNode
  tone?: 'default' | 'indigo' | 'terracotta' | 'forest' | 'light'
  className?: string
}) {
  const tones = {
    default: 'border-ink/15 text-ink/75',
    indigo: 'border-transparent bg-indigo-ndop/8 text-indigo-ndop',
    terracotta: 'border-transparent bg-terracotta/10 text-terracotta-dark',
    forest: 'border-transparent bg-forest/10 text-forest',
    light: 'border-ivory/30 text-ivory/85',
  }
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-full border px-3 text-xs font-medium tracking-wide',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
