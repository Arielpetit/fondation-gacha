/**
 * The old theme stores two fields outside the REST API: the event date line
 * ("Du 13 au 20 Janvier 2025") and a short summary ("chapeau"). They are only
 * rendered on each post page, so this script reads them from the public HTML.
 *
 *   node scripts/wp/fetch-extras.mjs   → data/wp-export/post-extras.json
 */
import fs from 'node:fs/promises'
import path from 'node:path'

const OUT = path.resolve('data/wp-export/post-extras.json')
const posts = JSON.parse(await fs.readFile('data/wp-export/posts.json', 'utf8'))

const decode = (s) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;|&#8217;/g, '’')
    .replace(/&lsquo;|&#8216;/g, '‘')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8230;|&hellip;/g, '…')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&#39;/g, "'")
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/&agrave;/g, 'à')
    .replace(/\s+/g, ' ')
    .trim()

async function extract(post) {
  const res = await fetch(post.link.replace('http://', 'https://'), {
    headers: { 'User-Agent': 'fondation-gacha-migration/1.0' },
  })
  if (!res.ok) return { error: res.status }
  const html = await res.text()
  const head = html.match(/<div class="top-content titrePageGeneraleContent contenu-sans-marge[\s\S]*?<\/div>/)?.[0] ?? ''
  const dateLabel = head.match(/<h5[^>]*top-contentMin[^>]*>([\s\S]*?)<\/h5>/)?.[1]
  const summaryBlock = html.match(/<div class="traitTitrePageGenerale[^"]*"><\/div>\s*<p[^>]*>([\s\S]*?)<\/p>/)?.[1]
  return {
    dateLabel: dateLabel ? decode(dateLabel) : null,
    summary: summaryBlock ? decode(summaryBlock) : null,
  }
}

const results = {}
let done = 0
const queue = [...posts]
async function worker() {
  while (queue.length) {
    const post = queue.shift()
    try {
      results[post.id] = await extract(post)
    } catch (e) {
      results[post.id] = { error: String(e) }
    }
    done++
    process.stdout.write(`\r${done}/${posts.length}`)
  }
}
await Promise.all(Array.from({ length: 4 }, worker))
process.stdout.write('\n')
await fs.writeFile(OUT, JSON.stringify(results, null, 1))
const withDate = Object.values(results).filter((r) => r.dateLabel).length
const withSummary = Object.values(results).filter((r) => r.summary).length
console.log(`dates: ${withDate}, summaries: ${withSummary}, errors: ${Object.values(results).filter((r) => r.error).length}`)
