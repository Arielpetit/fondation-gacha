/**
 * Downloads the full public WordPress REST export of fondationgacha.org into data/wp-export/.
 * Read-only: uses the public REST API, no credentials.
 *
 *   node scripts/wp/fetch.mjs
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const BASE = 'https://www.fondationgacha.org/wp-json/wp/v2'
const OUT = path.resolve('data/wp-export')
const TYPES = ['posts', 'pages', 'media', 'tags', 'categories']

async function fetchAll(type) {
  const items = []
  for (let page = 1; ; page++) {
    const res = await fetch(`${BASE}/${type}?per_page=100&page=${page}&orderby=id&order=asc`, {
      headers: { 'User-Agent': 'fondation-gacha-migration/1.0' },
    })
    if (res.status === 400) break // past the last page
    if (!res.ok) throw new Error(`${type} page ${page}: HTTP ${res.status}`)
    const batch = await res.json()
    items.push(...batch)
    const totalPages = Number(res.headers.get('x-wp-totalpages') || 1)
    process.stdout.write(`\r${type}: page ${page}/${totalPages} (${items.length})`)
    if (page >= totalPages) break
  }
  process.stdout.write('\n')
  return items
}

await fs.mkdir(OUT, { recursive: true })
for (const type of TYPES) {
  const items = await fetchAll(type)
  await fs.writeFile(path.join(OUT, `${type}.json`), JSON.stringify(items))
}
console.log('Export written to', OUT)
