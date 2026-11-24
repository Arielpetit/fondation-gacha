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
 * Compact dark header at the top of every inner page (the site header sits over it in its light state).
 * Title on the left; when there is a photo, it sits on the right in a rounded frame that reveals on load.
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
    <section className="grain relative isolate overflow-hidden bg-indigo-deep text-ivory">
      <div className="pointer-events-none absolute inset-0 -z-10 text-ivory/[0.04]" aria-hidden>
        <NdopPattern motif={motif} scale={2.2} />
      </div>
      <div
        className="pointer-events-none absolute -top-48 right-[-12%] -z-10 size-[36rem] rounded-full bg-terracotta/20 blur-[120px]"
        aria-hidden
      />

      <div
        className={cn(
          'container-site relative grid items-center gap-10 pt-[calc(var(--header-h)+2.5rem)] pb-12 sm:pb-14 lg:grid-cols-12 lg:gap-12',
          size === 'lg' && 'lg:min-h-[70svh]',
        )}
      >
        <div className={hasImage ? 'lg:col-span-7' : 'lg:col-span-9'}>
          {crumbs.length > 0 && (
            <Reveal immediate delay={0.05}>
              <nav aria-label={t('breadcrumb')} className="mb-6 text-sm text-ivory/60">
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
            className={cn('mt-4 font-display font-[360] text-balance', size === 'lg' ? 'text-display-lg' : 'text-display-md')}
          />
          {intro && (
            <Reveal immediate delay={0.35} className="mt-5 max-w-2xl text-base leading-relaxed text-pretty text-ivory/75 sm:text-lg">
              {intro}
            </Reveal>
          )}
          {children && (
            <Reveal immediate delay={0.45} className="mt-6">
              {children}
            </Reveal>
          )}
        </div>

        {hasImage && (
          <div className="lg:col-span-5">
            <div className="hero-frame relative aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-ivory/10">
              {image ? (
                <CmsImage media={image} priority sizes="(min-width: 1024px) 40vw, 100vw" className="hero-frame-img" />
              ) : (
                <Image src={imageSrc!} alt="" fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="hero-frame-img object-cover" />
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
