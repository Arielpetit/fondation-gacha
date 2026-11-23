'use client'

import { motion } from 'motion/react'
import { createElement, type ElementType } from 'react'

import { cn } from '@/lib/cn'

import { useSafeReducedMotion } from './useSafeReducedMotion'

/**
 * Word-by-word masked reveal for headings.
 * Each word slides up from behind an overflow mask. Screen readers get the plain text.
 */
export function SplitText({
  text,
  as = 'h2',
  className,
  delay = 0,
  stagger = 0.06,
  duration = 1,
  animateOnMount = false,
}: {
  text: string
  as?: ElementType
  className?: string
  delay?: number
  stagger?: number
  duration?: number
  /** true for above-the-fold headings (hero), false to trigger on scroll. */
  animateOnMount?: boolean
}) {
  const reduce = useSafeReducedMotion()
  const words = text.split(' ')

  const trigger = animateOnMount
    ? { animate: 'visible' }
    : { whileInView: 'visible', viewport: { once: true, amount: 0.5 } }

  return createElement(
    as,
    { className: cn(className), 'aria-label': text },
    <motion.span
      aria-hidden
      className="inline"
      initial="hidden"
      {...trigger}
      transition={{ staggerChildren: reduce ? 0 : stagger, delayChildren: reduce ? 0 : delay }}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden pb-[0.12em] align-top">
          <motion.span
            className="inline-block will-change-transform"
            variants={{
              hidden: { y: '110%', rotate: 4 },
              visible: {
                y: '0%',
                rotate: 0,
                transition: reduce ? { duration: 0 } : { duration, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            {word}
            {i < words.length - 1 ? ' ' : ''}
          </motion.span>
        </span>
      ))}
    </motion.span>,
  )
}
