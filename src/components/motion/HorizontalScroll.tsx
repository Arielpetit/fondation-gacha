'use client'

import { motion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/cn'

import { useSafeReducedMotion } from './useSafeReducedMotion'

/**
 * Pins a section and translates its track horizontally as the page scrolls (desktop only).
 * On small screens or with reduced motion, the track becomes a normal native horizontal scroller.
 */
export function HorizontalScroll({
  header,
  children,
  className,
}: {
  header?: ReactNode
  children: ReactNode
  className?: string
}) {
  const section = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const reduce = useSafeReducedMotion()
  const [distance, setDistance] = useState(0)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const measure = () => {
      const on = mq.matches && !reduce
      setEnabled(on)
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth))
    }
    measure()
    window.addEventListener('resize', measure)
    mq.addEventListener('change', measure)
    return () => {
      window.removeEventListener('resize', measure)
      mq.removeEventListener('change', measure)
    }
  }, [reduce])

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance])

  return (
    <div
      ref={section}
      className={cn('relative', !enabled && 'py-20 sm:py-28', className)}
      style={enabled ? { height: `calc(100vh + ${distance}px)` } : undefined}
    >
      <div className={cn(enabled && 'sticky top-0 flex h-screen flex-col justify-center overflow-hidden')}>
        {header}
        <motion.div
          ref={track}
          style={enabled ? { x } : undefined}
          className={cn(
            'flex gap-4 px-[var(--gutter)]',
            !enabled && 'snap-x snap-mandatory overflow-x-auto pb-4 [scrollbar-width:thin]',
          )}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
