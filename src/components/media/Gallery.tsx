'use client'

import { AnimatePresence, m } from 'motion/react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

import { setScrollLocked } from '@/components/SmoothScroll'
import { cn } from '@/lib/cn'

export type GalleryImage = { src: string; alt: string; width: number; height: number; caption?: string | null }

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Image grid (or a single image) that opens a full-screen lightbox.
 * Keyboard: ←/→ to browse, Esc to close. Touch: swipe left/right.
 */
/** Large landscape photos fill the text column; portrait or small ones keep their size (never upscaled). */
const fillsColumn = (img: GalleryImage) => img.width >= img.height && img.width >= 800

export function Gallery({ images, labels }: { images: GalleryImage[]; labels: { open: string; close: string; prev: string; next: string } }) {
  const [index, setIndex] = useState<number | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const touchX = useRef<number | null>(null)

  const open = (i: number, el: HTMLElement) => {
    returnFocus.current = el
    setIndex(i)
  }
  const close = useCallback(() => {
    setIndex(null)
    returnFocus.current?.focus()
  }, [])
  const go = useCallback((delta: number) => setIndex((i) => (i === null ? i : (i + delta + images.length) % images.length)), [images.length])

  useEffect(() => {
    if (index === null) return
    setScrollLocked(true)
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      setScrollLocked(false)
    }
  }, [index, close, go])

  const single = images.length === 1
  const cols = images.length === 2 || images.length === 4 ? 'sm:grid-cols-2' : 'sm:grid-cols-3'
  const current = index === null ? null : images[index]

  return (
    <>
      {single ? (
        <figure className="rt-figure">
          <button
            type="button"
            onClick={(e) => open(0, e.currentTarget)}
            className={cn('group block max-w-full cursor-zoom-in overflow-hidden rounded-2xl', fillsColumn(images[0]) ? 'w-full' : 'w-fit')}
            aria-label={`${labels.open}${images[0].alt ? ` : ${images[0].alt}` : ''}`}
          >
            <Image
              src={images[0].src}
              alt={images[0].alt}
              width={images[0].width}
              height={images[0].height}
              sizes="(min-width: 1024px) 900px, 100vw"
              className={cn(
                'block h-auto max-w-full transition-transform duration-700 ease-out-expo group-hover:scale-[1.02]',
                fillsColumn(images[0]) ? 'w-full' : 'max-h-[75vh] w-auto',
              )}
            />
          </button>
          {images[0].caption && <figcaption>{images[0].caption}</figcaption>}
        </figure>
      ) : (
        <div className={cn('rt-figure grid grid-cols-2 gap-2 sm:gap-3', cols)}>
          {images.map((img, i) => (
            <button
              key={img.src + i}
              type="button"
              onClick={(e) => open(i, e.currentTarget)}
              className="group relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-2xl bg-sand"
              aria-label={`${labels.open}${img.alt ? ` : ${img.alt}` : ''} (${i + 1}/${images.length})`}
            >
              <Image
                src={img.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 440px, 50vw"
                className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {current && (
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={current.alt || labels.open}
            className="fixed inset-0 z-[95] flex flex-col bg-indigo-deep/95 text-ivory backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.target === e.currentTarget && close()}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return
              const dx = e.changedTouches[0].clientX - touchX.current
              if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
              touchX.current = null
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 text-sm text-ivory/70">
              <span aria-live="polite">
                {index! + 1} / {images.length}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="inline-flex size-11 items-center justify-center rounded-full border border-ivory/25 hover:bg-ivory hover:text-indigo-deep"
              >
                <span className="sr-only">{labels.close}</span>
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-20" onClick={(e) => e.target === e.currentTarget && close()}>
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={current.src}
                  className="relative h-full w-full"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <Image src={current.src} alt={current.alt} fill sizes="100vw" className="object-contain" />
                </m.div>
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  {[
                    { d: -1, label: labels.prev, cls: 'left-2 sm:left-4', path: 'M15 6l-6 6 6 6' },
                    { d: 1, label: labels.next, cls: 'right-2 sm:right-4', path: 'M9 6l6 6-6 6' },
                  ].map((b) => (
                    <button
                      key={b.d}
                      type="button"
                      onClick={() => go(b.d)}
                      className={cn(
                        'absolute top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-indigo-deep/60 hover:bg-ivory hover:text-indigo-deep',
                        b.cls,
                      )}
                    >
                      <span className="sr-only">{b.label}</span>
                      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
                        <path d={b.path} />
                      </svg>
                    </button>
                  ))}
                </>
              )}
            </div>
            {current.caption && <p className="px-4 pb-5 text-center text-sm text-ivory/75">{current.caption}</p>}
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
