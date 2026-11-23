import type { ComponentProps, ReactNode } from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

import { ArrowRight, ArrowUpRight } from './icons'

type Variant = 'primary' | 'secondary' | 'outline' | 'light' | 'outline-light' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-terracotta text-ivory hover:bg-terracotta-dark',
  secondary: 'bg-indigo-ndop text-ivory hover:bg-indigo-deep',
  outline: 'border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-ivory',
  light: 'bg-ivory text-indigo-ndop hover:bg-white',
  'outline-light': 'border border-ivory/40 text-ivory hover:border-ivory hover:bg-ivory hover:text-indigo-ndop',
  ghost: 'text-ink hover:text-terracotta px-0!',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm gap-2',
  md: 'h-12 px-6 text-[0.95rem] gap-3',
  lg: 'h-14 px-8 text-base gap-3',
}

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(
    'group/btn relative inline-flex shrink-0 items-center justify-center rounded-full font-medium tracking-[-0.005em]',
    'transition-[background-color,color,border-color,transform] duration-300 ease-out-expo active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  )
}

function Arrow({ external }: { external?: boolean }) {
  const Icon = external ? ArrowUpRight : ArrowRight
  return (
    <span className="relative -mr-1 inline-flex size-5 overflow-hidden" aria-hidden>
      <Icon className="absolute inset-0 size-5 transition-transform duration-500 ease-out-expo group-hover/btn:translate-x-6" />
      <Icon className="absolute inset-0 size-5 -translate-x-6 transition-transform duration-500 ease-out-expo group-hover/btn:translate-x-0" />
    </span>
  )
}

type CommonProps = {
  variant?: Variant
  size?: Size
  arrow?: boolean
  className?: string
  children: ReactNode
}

/** Internal link (locale-aware), external link, or <button>. */
export function Button(
  props: CommonProps &
    (
      | ({ href: ComponentProps<typeof Link>['href']; external?: false } & Omit<ComponentProps<typeof Link>, 'href' | 'className' | 'children'>)
      | ({ href: string; external: true } & Omit<ComponentProps<'a'>, 'href' | 'className' | 'children'>)
      | ({ href?: undefined } & Omit<ComponentProps<'button'>, 'className' | 'children'>)
    ),
) {
  const { variant = 'primary', size = 'md', arrow = false, className, children, ...rest } = props
  const classes = buttonClasses(variant, size, className)

  if ('href' in rest && rest.href !== undefined) {
    if ('external' in rest && rest.external) {
      const { external: _external, ...a } = rest
      return (
        <a {...a} className={classes} target="_blank" rel="noopener noreferrer">
          {children}
          {arrow && <Arrow external />}
        </a>
      )
    }
    const { external: _external, ...link } = rest as ComponentProps<typeof Link> & { external?: false }
    return (
      <Link {...link} className={classes}>
        {children}
        {arrow && <Arrow />}
      </Link>
    )
  }

  return (
    <button type="button" {...(rest as ComponentProps<'button'>)} className={classes}>
      {children}
      {arrow && <Arrow />}
    </button>
  )
}

/** Text link with an animated underline and arrow, for "Lire la suite"-style CTAs. */
export function ArrowLink({
  href,
  children,
  className,
}: {
  href: ComponentProps<typeof Link>['href']
  children: ReactNode
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn('group/al inline-flex items-center gap-2 font-medium', className)}
    >
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out-expo group-hover/al:bg-[length:100%_1px]">
        {children}
      </span>
      <ArrowRight className="size-4 transition-transform duration-500 ease-out-expo group-hover/al:translate-x-1" />
    </Link>
  )
}
