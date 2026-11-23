import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * Any content change refreshes the whole public site (it is small, and pages cross-reference each other:
 * news on the homepage, settings in the footer…). Skipped outside Next (migration scripts) and for drafts.
 */
async function revalidateSite(reason: string, context?: Record<string, unknown>) {
  if (context?.migration) return
  try {
    const { revalidatePath } = await import('next/cache')
    revalidatePath('/', 'layout')
  } catch {
    // Not running inside Next.js (e.g. `payload run`): nothing to revalidate.
  }
  if (process.env.NODE_ENV !== 'production') console.info(`[revalidate] ${reason}`)
}

export const revalidateOnChange: CollectionAfterChangeHook = async ({ doc, collection, context }) => {
  if (doc?._status === 'draft') return doc
  await revalidateSite(`${collection.slug} ${doc?.id}`, context)
  return doc
}

export const revalidateOnDelete: CollectionAfterDeleteHook = async ({ doc, collection, context }) => {
  await revalidateSite(`${collection.slug} ${doc?.id} deleted`, context)
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = async ({ doc, global, context }) => {
  await revalidateSite(`global ${global.slug}`, context)
  return doc
}
