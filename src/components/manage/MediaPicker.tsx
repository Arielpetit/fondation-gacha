'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'

import { listMedia, uploadMedia, type MediaItem } from '@/admin/actions'
import { cn } from '@/lib/cn'

import { Icon } from './Icon'
import { btn } from './ui'

/** Modal to choose a photo from the media library, or upload a new one. */
export function MediaPicker({ onPick, onClose }: { onPick: (m: MediaItem) => void; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [items, setItems] = useState<MediaItem[]>([])
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [busy, start] = useTransition()
  const [error, setError] = useState('')
  const file = useRef<HTMLInputElement>(null)

  const load = useCallback((query: string, p: number) => {
    start(async () => {
      const r = await listMedia(query, p)
      setItems((prev) => (p === 1 ? r.items : [...prev, ...r.items]))
      setPages(r.pages)
    })
  }, [])
  useEffect(() => {
    const t = setTimeout(() => load(q, 1), q ? 300 : 0)
    return () => clearTimeout(t)
  }, [q, load])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setError('')
    for (const f of Array.from(files)) {
      const fd = new FormData()
      fd.set('file', f)
      const r = await uploadMedia(fd)
      if (!r.ok) return setError(r.error)
      setItems((prev) => [r.data!, ...prev])
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Choisir une photo">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative flex max-h-[88vh] w-full max-w-4xl flex-col rounded-3xl border border-line bg-canvas shadow-2xl">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-5">
          <h2 className="mr-auto font-display text-2xl font-light">Médiathèque</h2>
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="h-10 rounded-full border border-line bg-paper pr-4 pl-10 text-sm outline-none focus:border-accent" />
          </div>
          <button type="button" className={btn('primary')} onClick={() => file.current?.click()}>
            <Icon name="upload" className="size-4" /> Importer
          </button>
          <input ref={file} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full border border-line" aria-label="Fermer">
            <Icon name="x" className="size-4" />
          </button>
        </div>
        {error && <p className="mx-5 mt-4 rounded-xl bg-terracotta/10 px-4 py-2 text-sm text-terracotta">{error}</p>}
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-5 sm:grid-cols-4 md:grid-cols-6">
          {items.map((m) => (
            <button key={m.id} type="button" onClick={() => onPick(m)} className="group relative aspect-square overflow-hidden rounded-xl bg-sand ring-accent transition-shadow hover:ring-2 focus-visible:ring-2" title={m.filename}>
              {m.mime?.startsWith('image/') === false ? (
                <span className="grid size-full place-items-center text-muted"><Icon name="file" className="size-8" /></span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.alt} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
            </button>
          ))}
          {!items.length && !busy && <p className="col-span-full py-12 text-center text-sm text-muted">Aucune photo trouvée.</p>}
        </div>
        {page < pages && (
          <div className="border-t border-line p-4 text-center">
            <button type="button" disabled={busy} className={cn(btn('ghost'))} onClick={() => { setPage(page + 1); load(q, page + 1) }}>
              {busy ? 'Chargement…' : 'Voir plus'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
