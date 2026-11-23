'use client'

import { domAnimation, LazyMotion } from 'motion/react'
import type { ReactNode } from 'react'

/**
 * Loads only the animation features the site uses (animations, variants, exit, hover/tap/in-view)
 * instead of the full Motion bundle. `strict` makes any accidental full `motion.*` import fail loudly.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  )
}
