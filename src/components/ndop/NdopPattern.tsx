import { useId } from 'react'

import { cn } from '@/lib/cn'

/**
 * Ndop-inspired motifs, redrawn as tileable SVG.
 * Ndop is the indigo-and-white resist-dyed cloth of the Grassfields (West Cameroon).
 * Each motif uses `currentColor`, so colour comes from the parent's text colour.
 */
export type NdopMotif = 'dots' | 'zigzag' | 'diamonds' | 'checker' | 'moon' | 'spider' | 'ladder'

const TILE = 40

function Motif({ motif }: { motif: NdopMotif }) {
  switch (motif) {
    case 'dots':
      return (
        <>
          <circle cx="10" cy="10" r="2.4" />
          <circle cx="30" cy="30" r="2.4" />
        </>
      )
    case 'zigzag':
      return (
        <polyline
          points="0,28 10,12 20,28 30,12 40,28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )
    case 'diamonds':
      return (
        <>
          <path d="M20 4 L36 20 L20 36 L4 20 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="20" cy="20" r="3" />
        </>
      )
    case 'checker':
      return (
        <>
          <rect x="0" y="0" width="20" height="20" />
          <rect x="20" y="20" width="20" height="20" />
        </>
      )
    case 'moon':
      return (
        <g fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="20" cy="20" r="14" />
          <circle cx="20" cy="20" r="8" />
          <circle cx="20" cy="20" r="2" fill="currentColor" />
        </g>
      )
    case 'spider':
      // Ngaame, the earth spider — a Grassfields symbol of wisdom.
      return (
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="20" cy="20" r="4.5" fill="currentColor" stroke="none" />
          <path d="M20 20 L8 8 M20 20 L32 8 M20 20 L8 32 M20 20 L32 32 M20 20 L4 20 M20 20 L36 20" />
        </g>
      )
    case 'ladder':
      return (
        <g stroke="currentColor" strokeWidth="2">
          <path d="M6 0 V40 M34 0 V40" />
          <path d="M6 10 H34 M6 30 H34" />
        </g>
      )
  }
}

export function NdopPattern({
  motif = 'dots',
  scale = 1,
  className,
  title,
}: {
  motif?: NdopMotif
  /** Tile size multiplier. 1 = 40px tile. */
  scale?: number
  className?: string
  /** Pass a title only when the pattern carries meaning; otherwise it is decorative. */
  title?: string
}) {
  const id = useId().replace(/:/g, '')
  const size = TILE * scale

  return (
    <svg
      className={cn('pointer-events-none block h-full w-full', className)}
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <pattern
          id={`ndop-${motif}-${id}`}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          viewBox={`0 0 ${TILE} ${TILE}`}
        >
          <g fill="currentColor">
            <Motif motif={motif} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#ndop-${motif}-${id})`} />
    </svg>
  )
}

/** Horizontal decorative band: two rules framing a repeating motif, like a Ndop border. */
export function NdopBand({
  motif = 'zigzag',
  className,
}: {
  motif?: NdopMotif
  className?: string
}) {
  return (
    <div className={cn('flex h-10 flex-col justify-between', className)} aria-hidden>
      <span className="block h-px w-full bg-current opacity-60" />
      <div className="h-6">
        <NdopPattern motif={motif} scale={0.6} />
      </div>
      <span className="block h-px w-full bg-current opacity-60" />
    </div>
  )
}
