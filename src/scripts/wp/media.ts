/** Downloads WordPress uploads (with an on-disk cache) and imports them into Payload's media collection. */
import fs from 'node:fs'
import path from 'node:path'

import type { Payload } from 'payload'

import { originalUploadUrl, plain, readExport, type WPMedia } from './lib'

const CACHE = path.resolve('data/wp-cache')

/** Host-independent file URL, so content never embeds localhost or a deploy domain. */
const relativeFileUrl = (filename?: string | null) => (filename ? `/api/media/file/${filename}` : '')

/**
 * ASCII-only file name ("Bilan-Félicien 2015.pdf" → "bilan-felicien-2015.pdf").
 * Accented names need %-escapes, which Payload's link validation rejects in relative URLs.
 */
function safeFileName(url: string): string {
  const base = decodeURIComponent(path.basename(url))
  const dot = base.lastIndexOf('.')
  const stem = (dot > 0 ? base.slice(0, dot) : base)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
  return `${stem || 'fichier'}${dot > 0 ? base.slice(dot).toLowerCase() : ''}`
}
const SKIP_MIME = /tiff|audio|video/

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  pdf: 'application/pdf',
}

export type MediaImporter = {
  /** Returns the Payload media id for a WP upload URL, importing it if needed. */
  fromUrl: (url: string, altFallback?: string) => Promise<number | null>
  /** Same, from a WP attachment id (featured images). */
  fromWpId: (id: number, altFallback?: string) => Promise<number | null>
  /** Resolve an attachment page URL (…/some-file-slug/) to its file URL. */
  attachmentFileUrl: (pageUrl: string) => string | null
  /** Public URL of an imported media document. */
  publicUrl: (id: number) => string | undefined
  stats: { imported: number; reused: number; renamed: number; failed: string[] }
}

export function createMediaImporter(payload: Payload): MediaImporter {
  fs.mkdirSync(CACHE, { recursive: true })
  const wpMedia = readExport<WPMedia[]>('media')
  const byId = new Map(wpMedia.map((m) => [m.id, m]))
  const byUrl = new Map(wpMedia.map((m) => [originalUploadUrl(m.source_url), m]))
  const bySlug = new Map(wpMedia.map((m) => [m.slug, m]))

  const ids = new Map<string, number | null>() // original url → media id
  const urls = new Map<number, string>() // media id → public url
  const inflight = new Map<string, Promise<number | null>>()
  const stats = { imported: 0, reused: 0, renamed: 0, failed: [] as string[] }

  async function download(url: string, fallback: string): Promise<Buffer | null> {
    const file = path.join(CACHE, encodeURIComponent(url.replace(/^https:\/\//, '')).slice(0, 240))
    if (fs.existsSync(file)) return fs.readFileSync(file)
    for (const candidate of [url, fallback, url.replace('https://', 'http://')]) {
      try {
        const res = await fetch(encodeURI(decodeURI(candidate)), {
          headers: { 'User-Agent': 'fondation-gacha-migration/1.0' },
          signal: AbortSignal.timeout(120_000),
        })
        if (!res.ok) continue
        const buf = Buffer.from(await res.arrayBuffer())
        fs.writeFileSync(file, buf)
        return buf
      } catch {
        // try next candidate
      }
    }
    return null
  }

  async function importOne(rawUrl: string, altFallback?: string): Promise<number | null> {
    const url = originalUploadUrl(rawUrl)

    const existing = await payload.find({
      collection: 'media',
      where: { legacyUrl: { equals: url } },
      limit: 1,
      depth: 0,
    })
    const ext = (url.split('.').pop() || '').toLowerCase()
    const mimetype = MIME[ext]
    const wp = byUrl.get(url)
    const name = safeFileName(url)

    const prev = existing.docs[0]
    if (prev && /^[\x20-\x7e]+$/.test(prev.filename ?? '')) {
      stats.reused++
      urls.set(prev.id, relativeFileUrl(prev.filename))
      return prev.id
    }

    if (!mimetype || (wp && SKIP_MIME.test(wp.mime_type))) return null

    const data = await download(url, rawUrl.replace(/^\/\//, 'https://'))
    if (!data) {
      stats.failed.push(url)
      return null
    }

    if (prev) {
      // Imported earlier under an accented file name: re-upload under an ASCII name.
      const doc = await payload.update({
        collection: 'media',
        id: prev.id,
        data: {},
        file: { data, mimetype: mimetype!, name, size: data.length },
      })
      stats.renamed++
      urls.set(doc.id, relativeFileUrl(doc.filename))
      return doc.id
    }

    const alt =
      plain(wp?.alt_text || '') ||
      plain(wp?.caption?.rendered || '') ||
      altFallback ||
      plain(wp?.title?.rendered || '') ||
      'Fondation Jean-Félicien Gacha'

    try {
      const doc = await payload.create({
        collection: 'media',
        data: { alt, legacyUrl: url },
        file: { data, mimetype, name, size: data.length },
        locale: 'fr',
      })
      stats.imported++
      urls.set(doc.id, relativeFileUrl(doc.filename))
      return doc.id
    } catch (e) {
      stats.failed.push(`${url} (${(e as Error).message})`)
      return null
    }
  }

  const fromUrl = async (rawUrl: string, altFallback?: string) => {
    const key = originalUploadUrl(rawUrl)
    if (ids.has(key)) return ids.get(key) ?? null
    if (!inflight.has(key)) {
      inflight.set(
        key,
        importOne(rawUrl, altFallback).then((id) => {
          ids.set(key, id)
          return id
        }),
      )
    }
    return inflight.get(key)!
  }

  return {
    fromUrl,
    fromWpId: async (id, alt) => {
      const m = byId.get(id)
      return m ? fromUrl(m.source_url, alt) : null
    },
    attachmentFileUrl: (pageUrl) => {
      const slug = pageUrl.replace(/\/$/, '').split('/').pop() ?? ''
      return bySlug.get(slug)?.source_url ?? null
    },
    publicUrl: (id) => urls.get(id),
    stats,
  }
}
