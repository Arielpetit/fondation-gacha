import { CmsImage } from '@/components/media/CmsImage'
import { asMedia } from '@/lib/payload'
import type { Partner } from '@/payload-types'

/** Initials used as a monogram until the partner's logo is uploaded in the admin. */
const initials = (name: string) => {
  const words = name.replace(/[–—(].*$/, '').split(/[\s-]+/).filter(Boolean)
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase()
  const caps = words.filter((w) => w.length > 2 && /^[A-ZÀ-Ý]/.test(w))
  return (caps.length >= 2 ? caps : words).slice(0, 3).map((w) => w[0].toUpperCase()).join('')
}

/**
 * One partner in the marquee: just the logo (no card). Logos sit on a white pill so their colours stay true in the
 * dark theme; partners without a logo show a monogram and their name.
 */
export function PartnerTile({ partner }: { partner: Partner }) {
  const logo = asMedia(partner.logo)
  const body = logo ? (
    <span className="relative block h-16 w-40 sm:h-[4.5rem] sm:w-48 dark:rounded-xl dark:bg-white dark:p-2">
      <CmsImage media={logo} fill sizes="200px" className="object-contain transition-transform duration-500 ease-out-expo group-hover/tile:scale-110" />
      <span className="sr-only">{partner.name}</span>
    </span>
  ) : (
    <span className="flex h-16 items-center gap-3 sm:h-[4.5rem]">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-indigo-ndop font-display text-sm tracking-wide text-raffia dark:bg-indigo-soft">
        {initials(partner.name)}
      </span>
      <span className="line-clamp-2 max-w-[11rem] font-display text-base leading-snug text-ink">{partner.name}</span>
    </span>
  )
  const cls = 'group/tile mx-6 block shrink-0 sm:mx-9'
  return partner.url ? (
    <a href={partner.url} target="_blank" rel="noopener noreferrer" className={cls}>
      {body}
    </a>
  ) : (
    <span className={cls}>{body}</span>
  )
}
