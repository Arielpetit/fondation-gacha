import { cn } from '@/lib/cn'

/**
 * The Foundation's own logos, drawn through a CSS mask so they take the current text colour
 * (ivory over the dark header, indigo once it turns light, cream in dark mode).
 */
export function BrandImage({ src, ratio, className }: { src: string; ratio: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('block shrink-0 bg-current', className)}
      style={{
        aspectRatio: ratio,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  )
}

/** House mark from the Foundation's logo. */
export const FoundationMark = ({ className }: { className?: string }) => (
  <BrandImage src="/images/brand/fondation-mark-ivory.png" ratio="408 / 192" className={className} />
)

/** Full Foundation logo ("Fondation" / house / "Jean-Felicien Gacha"). */
export const FoundationLogo = ({ className }: { className?: string }) => (
  <BrandImage src="/images/brand/fondation-ivory.png" ratio="414 / 314" className={className} />
)

/** Villa Boutanga logo. */
export const VillaLogo = ({ className }: { className?: string }) => (
  <BrandImage src="/images/brand/villa-boutanga-ivory.png" ratio="701 / 654" className={className} />
)

/** Header wordmark: the Foundation's house mark + its name. */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <FoundationMark className="w-11" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="eyebrow text-[0.6rem] opacity-70">Fondation</span>
          <span className="mt-1 font-display text-[1.05rem] tracking-[-0.01em]">Jean-Félicien Gacha</span>
        </span>
      )}
      <span className="sr-only">Fondation Jean-Félicien Gacha</span>
    </span>
  )
}
