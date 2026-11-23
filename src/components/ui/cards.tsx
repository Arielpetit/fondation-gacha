import Image from 'next/image'
import type { ComponentProps, ReactNode } from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

import { ArrowRight, ArrowUpRight, MapPin, Users } from './icons'
import { Tag } from './Tag'

type Href = ComponentProps<typeof Link>['href']

const imageHover =
  'object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.06]'

/** Activity / domain card. Tall image with title overlay; number in Ndop style. */
export function ActivityCard({
  href,
  index,
  title,
  summary,
  image,
  className,
}: {
  href: Href
  index: number
  title: string
  summary: string
  image: { src: string; alt: string }
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative isolate flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-sm bg-indigo-deep p-6 text-ivory sm:p-8',
        className,
      )}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
        className={cn(imageHover, '-z-10 opacity-80')}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-indigo-deep via-indigo-deep/40 to-transparent" />
      <span className="absolute top-6 left-6 font-display text-sm text-raffia sm:top-8 sm:left-8">
        {String(index).padStart(2, '0')}
      </span>
      <h3 className="font-display text-display-sm font-light">{title}</h3>
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-700 ease-out-expo group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]">
        <p className="overflow-hidden text-sm leading-relaxed text-ivory/80">
          <span className="block pt-3">{summary}</span>
        </p>
      </div>
      <span className="mt-5 inline-flex size-11 items-center justify-center rounded-full border border-ivory/40 transition-colors duration-500 group-hover:border-ivory group-hover:bg-ivory group-hover:text-indigo-ndop">
        <ArrowUpRight className="size-5" />
      </span>
    </Link>
  )
}

/** News / post card. */
export function NewsCard({
  href,
  title,
  excerpt,
  date,
  category,
  image,
  locale = 'fr',
  featured = false,
  className,
}: {
  href: Href
  title: string
  excerpt?: string
  date: string
  category?: string
  image: { src: string; alt: string }
  locale?: string
  featured?: boolean
  className?: string
}) {
  const formatted = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(date),
  )

  return (
    <article className={cn('group relative flex flex-col', className)}>
      <div className={cn('relative overflow-hidden rounded-sm bg-sand', featured ? 'aspect-[16/10]' : 'aspect-[4/3]')}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={featured ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw'}
          className={imageHover}
        />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted">
        {category && <Tag tone="terracotta">{category}</Tag>}
        <time dateTime={date}>{formatted}</time>
      </div>
      <h3 className={cn('mt-3 font-display font-light text-balance', featured ? 'text-display-md' : 'text-2xl leading-snug')}>
        <Link href={href} className="after:absolute after:inset-0">
          <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-700 ease-out-expo group-hover:bg-[length:100%_1px]">
            {title}
          </span>
        </Link>
      </h3>
      {excerpt && <p className="mt-3 line-clamp-3 leading-relaxed text-muted">{excerpt}</p>}
    </article>
  )
}

/** Agenda / event row with a calendar date block. */
export function EventCard({
  href,
  title,
  start,
  end,
  place,
  category,
  label,
  locale = 'fr',
  className,
}: {
  href: Href
  title: string
  start: string
  end?: string
  /** Pre-formatted date text; computed from start/end when omitted. */
  label?: string
  place?: string
  category?: string
  locale?: string
  className?: string
}) {
  const s = new Date(start)
  const day = new Intl.DateTimeFormat(locale, { day: '2-digit', timeZone: 'UTC' }).format(s)
  const month = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(s).replace('.', '')
  const range = label
    ? label
    : end
    ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).formatRange(s, new Date(end))
    : new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(s)

  return (
    <article
      className={cn(
        'group relative grid grid-cols-[auto_1fr_auto] items-center gap-5 border-t border-line py-6 transition-colors duration-500 hover:bg-sand/50 sm:gap-8 sm:px-4',
        className,
      )}
    >
      <div className="flex w-16 flex-col items-center rounded-sm bg-indigo-ndop py-3 text-ivory sm:w-20 dark:bg-indigo-soft">
        <span className="font-display text-3xl leading-none sm:text-4xl">{day}</span>
        <span className="eyebrow mt-1.5 text-[0.65rem] text-raffia">{month}</span>
      </div>
      <div className="min-w-0">
        {category && <p className="eyebrow mb-2 text-[0.65rem] text-accent">{category}</p>}
        <h3 className="font-display text-xl leading-snug font-light text-balance sm:text-2xl">
          <Link href={href} className="after:absolute after:inset-0">
            {title}
          </Link>
        </h3>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span className="first-letter:uppercase">{range}</span>
          {place && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" />
              {place}
            </span>
          )}
        </p>
      </div>
      <ArrowRight className="hidden size-6 text-ink/40 transition-all duration-500 ease-out-expo group-hover:translate-x-1 group-hover:text-accent sm:block" />
    </article>
  )
}

/** Villa Boutanga room card. */
export function RoomCard({
  name,
  description,
  capacity,
  price,
  image,
  locale = 'fr',
  perNight,
  guestsLabel,
  className,
}: {
  name: string
  description: string
  capacity: number
  /** Price in FCFA. */
  price: number
  image: { src: string; alt: string }
  locale?: string
  perNight: string
  guestsLabel: string
  className?: string
}) {
  return (
    <article className={cn('group flex flex-col overflow-hidden rounded-sm bg-paper', className)}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className={imageHover} />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl font-light">{name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-6 flex items-end justify-between border-t border-line pt-4">
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            <Users className="size-4" />
            {capacity} {guestsLabel}
          </span>
          <span className="text-right">
            <span className="font-display text-2xl">{new Intl.NumberFormat(locale).format(price)}</span>
            <span className="ml-1 text-sm text-muted">FCFA</span>
            <span className="block text-xs text-muted">{perNight}</span>
          </span>
        </div>
      </div>
    </article>
  )
}

/** Big pull quote, e.g. the president's word. */
export function Quote({
  children,
  author,
  role,
  dark,
  className,
}: {
  children: ReactNode
  author: string
  role?: string
  dark?: boolean
  className?: string
}) {
  return (
    <figure className={cn('relative', className)}>
      <span
        aria-hidden
        className={cn('absolute -top-10 -left-2 font-display text-[8rem] leading-none select-none', dark ? 'text-ivory/15' : 'text-accent/20')}
      >
        “
      </span>
      <blockquote className="relative font-display text-display-sm font-light text-balance italic">{children}</blockquote>
      <figcaption className="mt-8 flex items-center gap-4">
        <span className={cn('h-px w-10', dark ? 'bg-raffia' : 'bg-terracotta')} aria-hidden />
        <span>
          <span className="block font-medium">{author}</span>
          {role && <span className={cn('block text-sm', dark ? 'text-ivory/60' : 'text-muted')}>{role}</span>}
        </span>
      </figcaption>
    </figure>
  )
}

/** Membership tier card. */
export function TierCard({
  name,
  price,
  note,
  perks,
  highlighted,
  cta,
  locale = 'fr',
  className,
}: {
  name: string
  price: number
  note?: string
  perks: string[]
  highlighted?: boolean
  cta: ReactNode
  locale?: string
  className?: string
}) {
  return (
    <article
      className={cn(
        'flex flex-col rounded-sm border p-8 transition-transform duration-500 ease-out-expo hover:-translate-y-1',
        highlighted ? 'grain border-transparent bg-indigo-ndop text-ivory' : 'border-line bg-paper',
        className,
      )}
    >
      <p className={cn('eyebrow', highlighted ? 'text-raffia' : 'text-accent')}>{name}</p>
      <p className="mt-6 font-display text-display-md font-light">
        {new Intl.NumberFormat(locale).format(price)}
        <span className={cn('ml-2 font-sans text-base', highlighted ? 'text-ivory/60' : 'text-muted')}>FCFA</span>
      </p>
      {note && <p className={cn('mt-1 text-sm', highlighted ? 'text-ivory/60' : 'text-muted')}>{note}</p>}
      <ul className={cn('mt-8 flex-1 space-y-3 border-t pt-6 text-sm', highlighted ? 'border-ivory/20' : 'border-line')}>
        {perks.map((p) => (
          <li key={p} className="flex gap-3">
            <span className={cn('mt-2 size-1.5 shrink-0 rounded-full', highlighted ? 'bg-raffia' : 'bg-terracotta')} />
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-8">{cta}</div>
    </article>
  )
}
