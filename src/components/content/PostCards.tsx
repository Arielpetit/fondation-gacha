import Image from 'next/image'

import { EventCard, NewsCard } from '@/components/ui/cards'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { eventLabel, formatDate } from '@/lib/format'
import { mediaSrc } from '@/lib/payload'
import type { Post, Theme } from '@/payload-types'

type PostLike = Pick<Post, 'slug' | 'title' | 'summary' | 'cover' | 'publishedAt' | 'themes' | 'eventStart' | 'eventEnd' | 'eventLabel' | 'place'>

const firstTheme = (post: PostLike) => {
  const t = post.themes?.find((x): x is Theme => typeof x === 'object')
  return t?.title
}

const FALLBACK = '/images/sg/case-sunset.webp'

export function PostCard({
  post,
  locale,
  featured,
  compact,
  className,
}: {
  post: PostLike
  locale: string
  featured?: boolean
  /** Small horizontal card (thumbnail left, text right). */
  compact?: boolean
  className?: string
}) {
  const cover = typeof post.cover === 'object' ? post.cover : null
  if (compact) {
    return (
      <article className={cn('group relative grid grid-cols-[7rem_1fr] gap-5 sm:grid-cols-[10rem_1fr]', className)}>
        <div className="relative aspect-square overflow-hidden rounded-sm bg-sand">
          <Image
            src={mediaSrc(cover, 'thumb') ?? FALLBACK}
            alt={cover?.alt ?? ''}
            fill
            sizes="160px"
            className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105"
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted">
            {firstTheme(post) && <span className="eyebrow mr-2 text-[0.65rem] text-accent">{firstTheme(post)}</span>}
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
          </p>
          <h3 className="mt-2 font-display text-xl leading-snug font-light text-balance">
            <Link href={`/actualites/${post.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
              {post.title}
            </Link>
          </h3>
        </div>
      </article>
    )
  }
  return (
    <NewsCard
      className={className}
      featured={featured}
      locale={locale}
      href={`/actualites/${post.slug}`}
      title={post.title}
      excerpt={post.summary ?? undefined}
      date={post.publishedAt}
      category={firstTheme(post)}
      image={{ src: mediaSrc(cover, featured ? 'wide' : 'card') ?? FALLBACK, alt: cover?.alt ?? '' }}
    />
  )
}

export function EventRow({ post, locale }: { post: PostLike; locale: string }) {
  if (!post.eventStart) return null
  return (
    <EventCard
      locale={locale}
      href={`/actualites/${post.slug}`}
      title={post.title}
      start={post.eventStart}
      end={post.eventEnd ?? undefined}
      label={eventLabel(post, locale)}
      place={post.place ?? undefined}
      category={firstTheme(post)}
    />
  )
}
