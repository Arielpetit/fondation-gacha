import type { ElementType, ReactNode } from 'react'

import { cn } from '@/lib/cn'

export type Tone = 'ivory' | 'paper' | 'sand' | 'indigo' | 'deep' | 'forest' | 'terracotta'

const tones: Record<Tone, string> = {
  ivory: 'bg-ivory text-ink',
  paper: 'bg-paper text-ink',
  sand: 'bg-sand text-ink',
  indigo: 'bg-indigo-ndop text-ivory grain',
  deep: 'bg-indigo-deep text-ivory grain',
  forest: 'bg-forest text-ivory grain',
  terracotta: 'bg-terracotta text-ivory grain',
}

export const isDarkTone = (tone: Tone) => !['ivory', 'paper', 'sand'].includes(tone)

export function Container({
  children,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  as?: ElementType
}) {
  return <Tag className={cn('container-site', className)}>{children}</Tag>
}

/** Page section with a colour tone and consistent vertical rhythm. */
export function Section({
  children,
  tone = 'ivory',
  spacing = 'lg',
  className,
  id,
  labelledBy,
}: {
  children: ReactNode
  tone?: Tone
  spacing?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
  id?: string
  labelledBy?: string
}) {
  const pad = {
    none: '',
    sm: 'py-12 sm:py-16',
    md: 'py-16 sm:py-24',
    lg: 'py-20 sm:py-28 lg:py-36',
  }[spacing]

  return (
    <section id={id} aria-labelledby={labelledBy} className={cn(tones[tone], pad, className)}>
      {children}
    </section>
  )
}

export function Eyebrow({
  children,
  className,
  dark,
}: {
  children: ReactNode
  className?: string
  dark?: boolean
}) {
  return (
    <p className={cn('eyebrow flex items-center gap-3', dark ? 'text-raffia' : 'text-terracotta', className)}>
      <span className="inline-block h-px w-8 bg-current" aria-hidden />
      {children}
    </p>
  )
}

/** Eyebrow + display heading + optional intro, used at the top of most sections. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  id,
  dark,
  align = 'left',
  size = 'md',
  className,
  action,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  intro?: ReactNode
  id?: string
  dark?: boolean
  align?: 'left' | 'center'
  size?: 'lg' | 'md' | 'sm'
  className?: string
  action?: ReactNode
}) {
  const titleSize = { lg: 'text-display-lg', md: 'text-display-md', sm: 'text-display-sm' }[size]

  return (
    <header
      className={cn(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'items-center text-center md:flex-col md:items-center',
        className,
      )}
    >
      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <Eyebrow dark={dark} className={cn('mb-5', align === 'center' && 'justify-center')}>
            {eyebrow}
          </Eyebrow>
        )}
        <h2 id={id} className={cn('font-display font-light text-balance', titleSize)}>
          {title}
        </h2>
        {intro && (
          <p className={cn('mt-6 max-w-2xl text-lead text-pretty', dark ? 'text-ivory/75' : 'text-muted', align === 'center' && 'mx-auto')}>
            {intro}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}
