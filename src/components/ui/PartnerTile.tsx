import { CmsImage } from '@/components/media/CmsImage'
import { asMedia } from '@/lib/payload'
import type { Partner } from '@/payload-types'

/** Initials used as a monogram until the partner's logo is uploaded in the admin. */
const initials = (name: string) => {
  const words = name
    .replace(/[–—(].*$/, '')
    .split(/[\s-]+/)
    .filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase()
  const caps = words.filter((w) => w.length > 2 && /^[A-ZÀ-Ý]/.test(w))
  return (caps.length >= 2 ? caps : words)
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join('')
}

/**
 * One partner in the marquee: just the logo (no card). Logos sit on a white pill so their colours stay true in the
 * dark theme; partners without a logo show a monogram and their name.
 */
export function PartnerTile({ partner }: { partner: Partner }) {
  const logo = asMedia(partner.logo)
  const body = logo ? (
    <span
      className="relative block h-12 sm:h-14 dark:rounded-xl dark:bg-white dark:p-2"
      // Box as wide as the logo itself, so spacing between logos is even.
      style={{
        width: `min(9rem, calc(3.5rem * ${((logo.width ?? 1) / (logo.height ?? 1)).toFixed(3)}))`,
      }}
    >
      <CmsImage
        media={logo}
        fill
        sizes="160px"
        className="object-contain transition-transform duration-500 ease-out-expo group-hover/tile:scale-110"
      />
      <span className="sr-only">{partner.name}</span>
    </span>
  ) : (
    <span className="flex h-12 items-center gap-2.5 sm:h-14">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-indigo-ndop font-display text-sm tracking-wide text-raffia dark:bg-indigo-soft">
        {initials(partner.name)}
      </span>
      <span className="line-clamp-2 max-w-[9rem] font-display text-sm leading-snug text-ink">
        {partner.name}
      </span>
    </span>
  )
  const cls = 'group/tile mx-7 block shrink-0 sm:mx-10'
  return partner.url ? (
    <a href={partner.url} target="_blank" rel="noopener noreferrer" className={cls}>
      {body}
    </a>
  ) : (
    <span className={cls}>{body}</span>
  )
}
