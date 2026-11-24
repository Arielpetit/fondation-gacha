import { FoundationMark } from '@/components/ui/Logo'

/** Round seal with the emblem and a slowly turning ring of text (decorative). */
export function HeroSeal({ label }: { label: string }) {
  return (
    <div
      className="hero-float hero-float-3 absolute -right-2 -bottom-10 grid size-28 place-items-center rounded-full bg-terracotta text-ivory shadow-[0_24px_48px_-18px_rgb(0_0_0/0.6)] sm:-right-6 sm:size-32"
      aria-hidden
    >
      <svg viewBox="0 0 100 100" className="seal-spin absolute inset-0 size-full">
        <defs>
          <path id="seal-ring" d="M50 50m-38 0a38 38 0 1 1 76 0a38 38 0 1 1-76 0" />
        </defs>
        <text className="fill-current text-[8px] tracking-[0.12em] uppercase">
          <textPath href="#seal-ring" textLength="236" lengthAdjust="spacing">
            {label}
          </textPath>
        </text>
      </svg>
      <FoundationMark className="w-12" />
    </div>
  )
}
