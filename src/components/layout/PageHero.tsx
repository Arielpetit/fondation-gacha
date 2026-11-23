import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

import { CmsImage } from '@/components/media/CmsImage'
import { Reveal, SplitText } from '@/components/motion'
import { NdopPattern, type NdopMotif } from '@/components/ndop/NdopPattern'
import { Eyebrow } from '@/components/ui/Section'
import { Link } from '@/i18n/navigation'
import type { ImageLike } from '@/lib/payload'
import { cn } from '@/lib/cn'

export type Crumb = { href: string; label: string }

/**
 * Dark hero at the top of every inner page (the header sits over it in its light state).
 * With an image: full-bleed photo behind the title. Without: indigo with a Ndop motif.
 */
export async function PageHero({
  eyebrow,
  title,
  intro,
  image,
  imageSrc,
  crumbs = [],
  motif = 'spider',
  size = 'md',
  children,
}: {
  eyebrow?: ReactNode
  title: string
  intro?: ReactNode
  image?: ImageLike
  /** Static image path when there is no CMS media. */
  imageSrc?: string
  crumbs?: Crumb[]
  motif?: NdopMotif
  size?: 'md' | 'lg'
  children?: ReactNode
}) {
  const t = await getTranslations('nav')
  const hasImage = Boolean(image || imageSrc)

  return (
    <section
      className={cn(
        'grain relative isolate flex items-end overflow-hidden bg-indigo-deep text-ivory',
        size === 'lg' ? 'min-h-[88svh]' : hasImage ? 'min-h-[68svh]' : 'min-h-[52svh]',
      )}
    >
      {hasImage ? (
        <>
          {image ? (
            <CmsImage media={image} priority sizes="100vw" className="-z-20 opacity-75" />
          ) : (
            <Image src={imageSrc!} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-75" />
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-indigo-deep via-indigo-deep/70 to-indigo-deep/40" />
        </>
      ) : (
        <div className="absolute inset-0 -z-10 text-ivory/[0.05]">
          <NdopPattern motif={motif} scale={2.2} />
        </div>
      )}

      <div className="container-site relative pt-[calc(var(--header-h)+4rem)] pb-14 sm:pb-20">
        {crumbs.length > 0 && (
          <Reveal immediate delay={0.05}>
            <nav aria-label={t('breadcrumb')} className="mb-8 text-sm text-ivory/60">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-ivory">
                    {t('home')}
                  </Link>
                </li>
                {crumbs.map((c) => (
                  <li key={c.href} className="flex items-center gap-2">
                    <span aria-hidden>/</span>
                    <Link href={c.href} className="hover:text-ivory">
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </Reveal>
        )}
        {eyebrow && (
          <Reveal immediate delay={0.1}>
            <Eyebrow dark>{eyebrow}</Eyebrow>
          </Reveal>
        )}
        <SplitText
          as="h1"
          animateOnMount
          delay={0.1}
          stagger={0.04}
          duration={0.8}
          text={title}
          className={cn(
            'mt-5 max-w-5xl font-display font-light text-balance',
            size === 'lg' ? 'text-display-xl' : 'text-display-lg',
          )}
        />
        {intro && (
          <Reveal immediate delay={0.35} className="mt-7 max-w-2xl text-lead text-pretty text-ivory/80">
            {intro}
          </Reveal>
        )}
        {children && (
          <Reveal immediate delay={0.45} className="mt-8">
            {children}
          </Reveal>
        )}
      </div>
    </section>
  )
}
