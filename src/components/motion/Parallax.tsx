'use client'

import { m, useScroll, useTransform } from 'motion/react'
import { useRef, type ReactNode } from 'react'

import { useSafeReducedMotion } from './useSafeReducedMotion'

/** Moves children vertically at a different speed than the scroll. speed > 0 = slower, < 0 = faster. */
export function Parallax({
  children,
  className,
  speed = 0.2,
}: {
  children: ReactNode
  className?: string
  speed?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useSafeReducedMotion()
  const px = reduce ? 0 : speed * 100
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`${px}px`, `${-px}px`])

  return (
    <m.div ref={ref} className={className} style={{ y }}>
      {children}
    </m.div>
  )
}
