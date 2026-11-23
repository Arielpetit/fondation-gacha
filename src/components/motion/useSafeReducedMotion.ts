'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}

/**
 * Hydration-safe reduced-motion flag.
 * Returns false on the server and during hydration (so markup always matches),
 * then the real user preference right after. Use it to change *transitions*, never initial markup.
 */
export function useSafeReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
