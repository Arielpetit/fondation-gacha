'use client'

import { m, useScroll, useSpring } from 'motion/react'

/** Thin bar under the header showing how far the reader is through the article. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 })
  return (
    <m.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[55] h-[3px] origin-left bg-accent motion-reduce:hidden"
      style={{ scaleX }}
    />
  )
}
