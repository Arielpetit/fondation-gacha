'use client'

import { motion } from 'motion/react'

import { useSafeReducedMotion } from '@/components/motion/useSafeReducedMotion'
import { cn } from '@/lib/cn'

/**
 * Large Ndop "moon and spider" emblem that draws itself when scrolled into view.
 * Used as a section transition / ornament.
 */
export function NdopDraw({ className, duration = 2.2 }: { className?: string; duration?: number }) {
  const reduce = useSafeReducedMotion()

  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: reduce
        ? { duration: 0 }
        : {
            pathLength: { delay: i * 0.18, duration, ease: [0.65, 0, 0.35, 1] as const },
            opacity: { delay: i * 0.18, duration: 0.2 },
          },
    }),
  }

  const legs = [0, 45, 90, 135, 180, 225, 270, 315]

  return (
    <motion.svg
      viewBox="0 0 200 200"
      className={cn('block', className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      aria-hidden
    >
      <motion.circle cx="100" cy="100" r="92" strokeWidth="1.5" variants={draw} custom={0} />
      <motion.circle cx="100" cy="100" r="74" strokeWidth="1" strokeDasharray="2 6" variants={draw} custom={1} />
      <motion.circle cx="100" cy="100" r="56" strokeWidth="1.5" variants={draw} custom={2} />
      {legs.map((deg, i) => {
        const r1 = 18
        const r2 = 50
        const a = (deg * Math.PI) / 180
        return (
          <motion.path
            key={deg}
            d={`M${100 + r1 * Math.cos(a)} ${100 + r1 * Math.sin(a)} L${100 + r2 * Math.cos(a)} ${100 + r2 * Math.sin(a)}`}
            strokeWidth="2"
            variants={draw}
            custom={3 + i * 0.3}
          />
        )
      })}
      <motion.circle cx="100" cy="100" r="12" strokeWidth="2" variants={draw} custom={5} />
    </motion.svg>
  )
}
