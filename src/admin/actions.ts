'use server'

import { revalidatePath } from 'next/cache'

import { requireAdmin, resourceOrThrow } from './server'

type Result<T = unknown> = { ok: true; data?: T } | { ok: false; error: string }
const fail = (e: unknown): Result => ({ ok: false, error: e instanceof Error ? e.message : String(e) })

export async function saveDoc(input: { slug: string; id?: string | number; locale: string; data: Record<string, unknown>; status?: 'draft' | 'published' }): Promise<Result<{ id: string | number }>> {
  try {
    const { payload, user } = await requireAdmin()
    const r = resourceOrThrow(input.slug)
    const common = { user, overrideAccess: false, locale: input.locale as 'fr' | 'en', depth: 0 } as const
    if (r.kind === 'global') {
      await payload.updateGlobal({ slug: input.slug as 'settings', data: input.data as never, ...common })
      revalidatePath('/admin', 'layout')
      return { ok: true, data: { id: input.slug } }
    }
    const data = { ...input.data, ...(input.status ? { _status: input.status } : {}) }
    const doc = input.id
      ? await payload.update({ collection: input.slug as 'posts', id: input.id, data: data as never, draft: input.status === 'draft', ...common })
      : await payload.create({ collection: input.slug as 'posts', data: data as never, draft: input.status === 'draft', ...common })
    revalidatePath('/admin', 'layout')
    return { ok: true, data: { id: doc.id } }
  } catch (e) {
    return fail(e) as Result<{ id: string | number }>
  }
}

export async function deleteDoc(slug: string, id: string | number): Promise<Result> {
  try {
    const { payload, user } = await requireAdmin()
    await payload.delete({ collection: slug as 'posts', id, user, overrideAccess: false })
    revalidatePath('/admin', 'layout')
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}

export type MediaItem = { id: number; url: string; alt: string; filename: string; width?: number; height?: number; mime?: string }

export async function listMedia(q: string, page = 1): Promise<{ items: MediaItem[]; total: number; pages: number }> {
  const { payload, user } = await requireAdmin()
  const r = await payload.find({
    collection: 'media',
    limit: 36,
    page,
    depth: 0,
    sort: '-createdAt',
    user,
    overrideAccess: false,
    where: q ? { or: [{ filename: { like: q } }, { alt: { like: q } }] } : undefined,
  })
  return {
    items: r.docs.map((m) => ({ id: m.id, url: (m.sizes?.thumb?.url ?? m.sizes?.card?.url ?? m.url) as string, alt: m.alt ?? '', filename: m.filename ?? '', width: m.width ?? undefined, height: m.height ?? undefined, mime: m.mimeType ?? undefined })),
    total: r.totalDocs,
    pages: r.totalPages,
  }
}

export async function uploadMedia(formData: FormData): Promise<Result<MediaItem>> {
  try {
    const { payload, user } = await requireAdmin()
    const file = formData.get('file') as File | null
    if (!file || !file.size) return { ok: false, error: 'Aucun fichier.' }
    const buf = Buffer.from(await file.arrayBuffer())
    const alt = String(formData.get('alt') || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '))
    const doc = await payload.create({
      collection: 'media',
      data: { alt },
      file: { data: buf, mimetype: file.type, name: file.name.normalize('NFD').replace(/[^\w.\-]+/g, '-'), size: buf.length },
      user,
      overrideAccess: false,
    })
    return { ok: true, data: { id: doc.id, url: (doc.sizes?.thumb?.url ?? doc.sizes?.card?.url ?? doc.url) as string, alt: doc.alt ?? '', filename: doc.filename ?? '', mime: doc.mimeType ?? undefined } }
  } catch (e) {
    return fail(e) as Result<MediaItem>
  }
}

export async function updateMediaAlt(id: number, alt: string, caption?: string): Promise<Result> {
  try {
    const { payload, user } = await requireAdmin()
    await payload.update({ collection: 'media', id, data: { alt, ...(caption !== undefined ? { caption } : {}) }, user, overrideAccess: false })
    return { ok: true }
  } catch (e) {
    return fail(e)
  }
}
