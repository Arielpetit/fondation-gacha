import type { ReactNode } from 'react'

/**
 * Re-mounted on every navigation: gives each page a short CSS fade-up.
 * Pure CSS (no JavaScript wait), disabled with prefers-reduced-motion.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>
}
