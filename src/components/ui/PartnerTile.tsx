import { CmsImage } from '@/components/media/CmsImage'
import { cn } from '@/lib/cn'
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

export function PartnerTile({ partner }: { partner: Partner }) {
  const logo = asMedia(partner.logo)
  const body = (
    <span
      className={cn(
        'flex h-28 w-60 shrink-0 items-center gap-4 rounded-2xl border px-5 transition-[border-color,box-shadow] duration-300 group-hover/tile:border-accent group-hover/tile:shadow-[0_18px_36px_-24px_rgb(0_0_0/0.45)] sm:w-64',
        // Logos always sit on white so their own colours stay true in the dark theme too.
        logo ? 'border-line bg-white' : 'border-line bg-paper',
      )}
    >
      {logo ? (
        <span className="relative h-[4.5rem] w-full">
          <CmsImage
            media={logo}
            fill
            sizes="240px"
            className="object-contain transition-transform duration-500 ease-out-expo group-hover/tile:scale-105"
          />
        </span>
      ) : (
        <>
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-indigo-ndop font-display text-sm tracking-wide text-raffia dark:bg-indigo-soft">
            {initials(partner.name)}
          </span>
          <span className="line-clamp-3 font-display text-[1.05rem] leading-snug text-ink">
            {partner.name}
          </span>
        </>
      )}
      {logo && <span className="sr-only">{partner.name}</span>}
    </span>
  )
  return partner.url ? (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group/tile mx-2.5 block"
    >
      {body}
    </a>
  ) : (
    <span className="group/tile mx-2.5 block">{body}</span>
  )
}
