'use client'

import { useState } from 'react'

import { Gallery, type GalleryImage } from '@/components/media/Gallery'
import { cn } from '@/lib/cn'

type Album = { key: string; title: string; photos: GalleryImage[] }

const STEP = 24

/** Photo gallery page: album chips, a grid that grows by 24, and the shared lightbox. */
export function PhotoGallery({
  albums,
  labels,
}: {
  albums: Album[]
  labels: { all: string; more: string; photos: string; open: string; close: string; prev: string; next: string }
}) {
  const [key, setKey] = useState('all')
  const [shown, setShown] = useState(STEP)
  const all: Album = { key: 'all', title: labels.all, photos: albums.flatMap((a) => a.photos) }
  const current = key === 'all' ? all : (albums.find((a) => a.key === key) ?? all)
  const visible = current.photos.slice(0, shown)

  return (
    <div>
      <div role="tablist" aria-label="Albums" className="flex flex-wrap gap-2">
        {[all, ...albums].map((a) => (
          <button
            key={a.key}
            type="button"
            role="tab"
            aria-selected={current.key === a.key}
            onClick={() => {
              setKey(a.key)
              setShown(STEP)
            }}
            className={cn(
              'inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm transition-colors duration-300',
              current.key === a.key ? 'border-ink bg-ink text-canvas' : 'border-line text-ink/80 hover:border-ink',
            )}
          >
            {a.title}
            <span className={cn('text-xs', current.key === a.key ? 'text-canvas/70' : 'text-muted')}>{a.photos.length}</span>
          </button>
        ))}
      </div>

      <div className="mt-8" key={current.key}>
        <Gallery images={visible} dense labels={labels} />
      </div>

      {shown < current.photos.length && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setShown((n) => n + STEP)}
            className="inline-flex h-12 items-center rounded-full border border-ink px-7 text-sm font-medium transition-colors duration-300 hover:bg-ink hover:text-canvas"
          >
            {labels.more} ({current.photos.length - shown})
          </button>
        </div>
      )}
    </div>
  )
}
