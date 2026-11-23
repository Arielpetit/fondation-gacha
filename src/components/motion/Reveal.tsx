'use client'

import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

import { useSafeReducedMotion } from './useSafeReducedMotion'

const EASE = [0.16, 1, 0.3, 1] as const

type Direction = 'up' | 'down' | 'left' | 'right' | 'none'

const offset = (d: Direction, distance: number) =>
  ({
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
    none: {},
  })[d]

/** Fade + slide in once the element enters the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = 'up',
  distance = 32,
  duration = 0.9,
  amount = 0.25,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  direction?: Direction
  distance?: number
  duration?: number
  amount?: number
  as?: 'div' | 'section' | 'li' | 'article' | 'span' | 'p'
}) {
  const reduce = useSafeReducedMotion()
  const Tag = motion[as]

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, ...offset(direction, distance) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount }}
      transition={reduce ? { duration: 0 } : { duration, delay, ease: EASE }}
    >
      {children}
    </Tag>
  )
}

const containerVariants = (stagger: number, delay: number): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

const itemVariants = (reduce: boolean): Variants => ({
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: reduce ? { duration: 0 } : { duration: 0.8, ease: EASE } },
})

/** Parent that staggers its <StaggerItem> children into view. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  amount = 0.15,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  stagger?: number
  delay?: number
  amount?: number
  as?: 'div' | 'ul' | 'ol' | 'section'
}) {
  const reduce = useSafeReducedMotion()
  const Tag = motion[as]

  return (
    <Tag
      className={className}
      variants={containerVariants(reduce ? 0 : stagger, reduce ? 0 : delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
    >
      {children}
    </Tag>
  )
}

export function StaggerItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'li' | 'article'
}) {
  const reduce = useSafeReducedMotion()
  const Tag = motion[as]
  return (
    <Tag className={className} variants={itemVariants(reduce)}>
      {children}
    </Tag>
  )
}
