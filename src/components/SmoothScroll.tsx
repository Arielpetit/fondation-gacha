'use client'

import Lenis from 'lenis'
import { useEffect } from 'react'

let instance: Lenis | null = null

/** Lock / unlock page scroll (menus, dialogs). Works with or without Lenis. */
export function setScrollLocked(locked: boolean) {
  document.documentElement.style.overflow = locked ? 'hidden' : ''
  if (locked) instance?.stop()
  else instance?.start()
}

/** Site-wide smooth scroll. Disabled when the user prefers reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })
    instance = lenis
    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      instance = null
    }
  }, [])

  return null
}
