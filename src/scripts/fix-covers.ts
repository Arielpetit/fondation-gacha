/**
 * One-off: some actions were migrated with a 1200×380 banner as cover, which looks blurry on cards.
 * Use the largest photo from the action's own content instead (only when it is clearly larger).
 * Run: pnpm payload run src/scripts/fix-covers.ts
 */
import { getPayload } from 'payload'

import config from '@payload-config'

type N = { type?: string; value?: unknown; children?: N[] }
type M = { id: number; width?: number | null; height?: number | null; filename?: string | null }

const payload = await getPayload({ config })
const { docs } = await payload.find({ collection: 'activities', limit: 50, depth: 2, locale: 'fr' })
for (const a of docs) {
  const cover = a.cover as M | null
  const imgs: M[] = []
  const walk = (n: N) => {
    if (n.type === 'upload' && n.value && typeof n.value === 'object') imgs.push(n.value as M)
    n.children?.forEach(walk)
  }
  walk(((a.content as { root?: N } | null)?.root ?? {}) as N)
  const best = imgs
    .filter((m) => (m.height ?? 0) >= 900 && (m.width ?? 0) >= (m.height ?? 0))
    .sort((x, y) => (y.width ?? 0) * (y.height ?? 0) - (x.width ?? 0) * (x.height ?? 0))[0]
  if (best && (cover?.height ?? 0) < 700) {
    await payload.update({ collection: 'activities', id: a.id, data: { cover: best.id }, context: { migration: true } })
    console.log(`${a.slug}: ${cover?.filename} -> ${best.filename}`)
  } else if ((cover?.height ?? 0) < 700) {
    console.log(`${a.slug}: no better image in content (${cover?.filename})`)
  }
}
process.exit(0)
