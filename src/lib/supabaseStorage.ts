import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'

/**
 * Stores uploaded files in a Supabase Storage bucket, through its REST API with the project's secret key
 * (no S3 keys needed). Files are served by Payload at /api/media/file/<name>, so public URLs never change.
 */
const base = () => `${(process.env.SUPABASE_URL || '').replace(/\/$/, '')}/storage/v1`
const bucket = () => process.env.SUPABASE_BUCKET || 'fondation-media'
const auth = () => ({ apikey: process.env.SUPABASE_SECRET_KEY || '', Authorization: `Bearer ${process.env.SUPABASE_SECRET_KEY || ''}` })
const key = (p: string) => p.split('/').map(encodeURIComponent).join('/')

const adapter: Adapter = () => ({
  name: 'supabase-storage',
  handleUpload: async ({ file, storageFilePath }) => {
    const res = await fetch(`${base()}/object/${bucket()}/${key(storageFilePath)}`, {
      method: 'POST',
      headers: { ...auth(), 'Content-Type': file.mimeType || 'application/octet-stream', 'x-upsert': 'true', 'cache-control': 'max-age=31536000' },
      body: new Uint8Array(file.buffer),
    })
    if (!res.ok) throw new Error(`Supabase Storage upload failed (${res.status}): ${await res.text()}`)
  },
  handleDelete: async ({ storageFilePath }) => {
    await fetch(`${base()}/object/${bucket()}/${key(storageFilePath)}`, { method: 'DELETE', headers: auth() })
  },
  staticHandler: async (_req, { params }) => {
    const path = [params.prefix, params.filename].filter(Boolean).join('/')
    const res = await fetch(`${base()}/object/${bucket()}/${key(path)}`, { headers: auth() })
    if (!res.ok || !res.body) return new Response('Not found', { status: 404 })
    return new Response(res.body, {
      status: 200,
      headers: {
        'Content-Type': res.headers.get('content-type') ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  },
})

export const supabaseStorage = () =>
  cloudStoragePlugin({ collections: { media: { adapter, disableLocalStorage: true } } })
