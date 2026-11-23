'use client'

import { useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { useSafeReducedMotion } from './useSafeReducedMotion'

/** Counts from 0 to `value` when scrolled into view. Uses locale-aware number formatting. */
export function Counter({
  value,
  locale = 'fr',
  duration = 2,
  prefix = '',
  suffix = '',
  className,
}: {
  value: number
  locale?: string
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useSafeReducedMotion()
  const [count, setCount] = useState(0)
  // Reduced motion: jump straight to the final value once visible.
  const display = reduce && inView ? value : count

  useEffect(() => {
    if (!inView || reduce) return
    // Small native loop (ease-out expo) instead of pulling in the full animation engine.
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setCount(Math.round(value * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, reduce, value, duration])

  const fmt = new Intl.NumberFormat(locale)

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">
        {prefix}
        {fmt.format(value)}
        {suffix}
      </span>
      <span aria-hidden className="tabular-nums">
        {prefix}
        {fmt.format(display)}
        {suffix}
      </span>
    </span>
  )
}
