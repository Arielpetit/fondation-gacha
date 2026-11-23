import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/lib/cn'

/**
 * Infinite horizontal marquee (pure CSS, no JS). Content is duplicated once for a seamless loop.
 * Pauses on hover and stops entirely under prefers-reduced-motion.
 */
export function Marquee({
  children,
  duration = 40,
  reverse = false,
  className,
}: {
  children: ReactNode
  /** Seconds for one full loop. */
  duration?: number
  reverse?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'group relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]',
        className,
      )}
    >
      <div
        className={cn(
          'flex w-max shrink-0 animate-marquee group-hover:[animation-play-state:paused] motion-reduce:animate-none',
          reverse && '[animation-direction:reverse]',
        )}
        style={{ '--marquee-duration': `${duration}s` } as CSSProperties}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
