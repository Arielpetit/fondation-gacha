'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'

import { listMedia, updateMediaAlt, uploadMedia, type MediaItem } from '@/admin/actions'
import { cn } from '@/lib/cn'

import { Icon } from './Icon'
import { btn } from './ui'

export function MediaLibrary() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState<MediaItem[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [busy, start] = useTransition()
  const [drag, setDrag] = useState(false)
  const [sel, setSel] = useState<MediaItem | null>(null)
  const [alt, setAlt] = useState('')
  const [msg, setMsg] = useState('')
  const file = useRef<HTMLInputElement>(null)

  const load = useCallback((query: string, p: number) => {
    start(async () => {
      const r = await listMedia(query, p)
      setItems((prev) => (p === 1 ? r.items : [...prev, ...r.items]))
      setPages(r.pages)
    })
  }, [])
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(q, 1) }, q ? 300 : 0)
    return () => clearTimeout(t)
  }, [q, load])

  async function upload(files: FileList | File[] | null) {
    if (!files) return
    setMsg('')
    for (const f of Array.from(files)) {
      const fd = new FormData()
      fd.set('file', f)
      const r = await uploadMedia(fd)
      if (!r.ok) return setMsg(r.error)
      setItems((p) => [r.data!, ...p])
    }
  }

  return (
    <div onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files) }}>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1 sm:max-w-sm">
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une photo…" className="h-11 w-full rounded-full border border-line bg-paper pr-4 pl-11 text-sm outline-none focus:border-accent" />
        </div>
        <button type="button" className={btn('primary', 'ml-auto')} onClick={() => file.current?.click()}>
          <Icon name="upload" className="size-4" /> Importer des photos
        </button>
        <input ref={file} type="file" accept="image/*,application/pdf" multiple hidden onChange={(e) => upload(e.target.files)} />
      </div>
      {msg && <p className="mb-4 rounded-xl bg-terracotta/10 px-4 py-2 text-sm text-terracotta">{msg}</p>}

      <div className={cn('rounded-3xl border-2 border-dashed p-3 transition-colors', drag ? 'border-accent bg-accent/5' : 'border-transparent')}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {items.map((m) => (
            <button key={m.id} type="button" onClick={() => { setSel(m); setAlt(m.alt) }} className="group relative aspect-square overflow-hidden rounded-2xl bg-sand text-left transition-shadow hover:shadow-lg">
              {m.mime?.startsWith('image/') === false ? (
                <span className="grid size-full place-items-center text-muted"><Icon name="file" className="size-10" /></span>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.alt} loading="lazy" className="size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105" />
              )}
              <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-3 pt-6 pb-2 text-[0.7rem] text-white opacity-0 transition-opacity group-hover:opacity-100">{m.filename}</span>
            </button>
          ))}
        </div>
        {!items.length && !busy && <p className="py-16 text-center text-sm text-muted">Aucune photo. Glissez-en ici pour commencer.</p>}
      </div>
      {page < pages && (
        <div className="mt-6 text-center">
          <button type="button" className={btn('ghost')} disabled={busy} onClick={() => { setPage(page + 1); load(q, page + 1) }}>{busy ? 'Chargement…' : 'Voir plus'}</button>
        </div>
      )}

      {sel && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSel(null)} />
          <div className="relative grid w-full max-w-3xl overflow-hidden rounded-3xl border border-line bg-canvas shadow-2xl md:grid-cols-[1.2fr_1fr]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sel.url} alt={sel.alt} className="max-h-[70vh] w-full bg-sand object-contain" />
            <div className="flex flex-col gap-4 p-6">
              <div>
                <p className="truncate text-sm font-medium">{sel.filename}</p>
                {sel.width && <p className="text-xs text-muted">{sel.width} × {sel.height}</p>}
              </div>
              <label className="text-sm">
                <span className="mb-1.5 block font-medium">Texte alternatif</span>
                <textarea value={alt} onChange={(e) => setAlt(e.target.value)} className="min-h-24 w-full rounded-xl border border-line bg-paper px-4 py-2.5 text-sm outline-none focus:border-accent" placeholder="Décrivez la photo pour les personnes malvoyantes" />
              </label>
              <div className="mt-auto flex gap-2">
                <button type="button" className={btn('primary', 'flex-1')} onClick={async () => { const r = await updateMediaAlt(sel.id, alt); if (r.ok) { setItems((p) => p.map((x) => (x.id === sel.id ? { ...x, alt } : x))); setSel(null) } else setMsg(r.error) }}>Enregistrer</button>
                <button type="button" className={btn('ghost')} onClick={() => setSel(null)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
