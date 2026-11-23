import { cn } from '@/lib/cn'

/**
 * Wordmark: Ndop "moon" emblem + foundation name.
 * Placeholder until the foundation supplies a vector logo.
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <svg viewBox="0 0 40 40" className="size-9 shrink-0" fill="none" stroke="currentColor" aria-hidden>
        <circle cx="20" cy="20" r="18.5" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="12" strokeWidth="1" strokeDasharray="1.5 3" />
        <path
          d="M20 20 11 11M20 20l9-9M20 20l-9 9M20 20l9 9M20 20H8M20 20h12"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <circle cx="20" cy="20" r="3.5" fill="currentColor" stroke="none" />
      </svg>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="eyebrow text-[0.6rem] opacity-70">Fondation</span>
          <span className="mt-1 font-display text-[1.15rem] tracking-[-0.01em]">Jean-Félicien Gacha</span>
        </span>
      )}
      <span className="sr-only">Fondation Jean-Félicien Gacha</span>
    </span>
  )
}
