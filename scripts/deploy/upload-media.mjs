/**
 * Uploads every file of ./media to the Supabase Storage bucket (names kept, so database rows keep working).
 * Safe to re-run: files already in the bucket are skipped. Reads SUPABASE_URL, SUPABASE_SECRET_KEY (and optionally
 * SUPABASE_BUCKET, default "fondation-media") from the environment (.env is loaded by `node --env-file=.env`).
 *   node --env-file=.env scripts/deploy/upload-media.mjs
 */
import fs from 'node:fs'
import path from 'node:path'

const { SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_BUCKET = 'fondation-media' } = process.env
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) throw new Error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY')
const base = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1`
const H = { apikey: SUPABASE_SECRET_KEY, Authorization: `Bearer ${SUPABASE_SECRET_KEY}` }
const TYPES = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.mp4': 'video/mp4' }
const key = (p) => p.split('/').map(encodeURIComponent).join('/')

// Existing object names (paged), to skip what is already uploaded.
const have = new Set()
for (let offset = 0; ; offset += 1000) {
  const r = await fetch(`${base}/object/list/${SUPABASE_BUCKET}`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ prefix: '', limit: 1000, offset }) })
  if (!r.ok) throw new Error(`List failed (${r.status}): ${await r.text()}`)
  const page = await r.json()
  page.forEach((o) => have.add(o.name))
  if (page.length < 1000) break
}

const dir = path.resolve('media')
const files = fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isFile())
let done = 0, skipped = 0, failed = 0, n = 0
const queue = files.filter((f) => (have.has(f) ? (skipped++, false) : true))
async function worker() {
  while (queue.length) {
    const f = queue.shift()
    try {
      const r = await fetch(`${base}/object/${SUPABASE_BUCKET}/${key(f)}`, { method: 'POST', headers: { ...H, 'Content-Type': TYPES[path.extname(f).toLowerCase()] ?? 'application/octet-stream', 'x-upsert': 'true', 'cache-control': 'max-age=31536000' }, body: fs.readFileSync(path.join(dir, f)) })
      if (!r.ok) throw new Error(`${r.status} ${await r.text()}`)
      done++
    } catch (e) {
      failed++
      console.error('FAILED', f, String(e.message).slice(0, 160))
    }
    if (++n % 100 === 0) console.log(`${n} uploaded this run, ${queue.length} left`)
  }
}
await Promise.all(Array.from({ length: 6 }, worker))
console.log(`uploaded ${done}, already there ${skipped}, failed ${failed}, total ${files.length}`)
