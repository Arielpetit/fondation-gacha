'use client'

import { m, AnimatePresence } from 'motion/react'
import { useSyncExternalStore } from 'react'

import { cn } from '@/lib/cn'

const subscribe = (cb: () => void) => {
  const obs = new MutationObserver(cb)
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', cb)
  return () => {
    obs.disconnect()
    mq.removeEventListener('change', cb)
  }
}
const isDark = () => document.documentElement.classList.contains('dark')

/** Follows the system theme until the visitor chooses; the choice is remembered on this device. */
export function ThemeToggle({ labels, className }: { labels: { toDark: string; toLight: string }; className?: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false)

  const toggle = () => {
    const next = !isDark()
    const root = document.documentElement
    root.classList.toggle('dark', next)
    root.style.colorScheme = next ? 'dark' : 'light'
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      // Private mode: the choice simply isn't remembered.
    }
  }

  const label = dark ? labels.toLight : labels.toDark

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex size-9 items-center justify-center overflow-hidden rounded-full transition-colors hover:bg-current/10',
        className,
      )}
    >
      <AnimatePresence initial={false} mode="wait">
        <m.svg
          key={dark ? 'moon' : 'sun'}
          viewBox="0 0 24 24"
          className="size-[1.1rem]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          aria-hidden
          initial={{ y: 14, opacity: 0, rotate: -40 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 40 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {dark ? (
            <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
          )}
        </m.svg>
      </AnimatePresence>
    </button>
  )
}
