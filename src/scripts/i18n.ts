/**
 * Translation round-trip for localized content.
 *
 *   I18N=export pnpm i18n   → data/i18n/fr.json   (French source, one entry per document)
 *   I18N=import pnpm i18n   → applies data/i18n/en-*.json (English) and fr-*.json (French corrections)
 *
 * Rich text is translated block by block (paragraph, heading, list item, quote): the English document is a copy
 * of the French one with each block's text replaced, so images, embeds, links and layout are kept.
 * A block whose text is split across several styled runs gets the whole translation in its first run.
 */
import fs from 'node:fs'
import path from 'node:path'

import { getPayload } from 'payload'

import config from '@payload-config'

type Node = { type?: string; text?: string; children?: Node[]; [k: string]: unknown }
type Entry = { collection: string; id: number; fields: Record<string, string | string[] | null> }

const DIR = path.resolve('data/i18n')
const TEXT_BLOCKS = new Set(['paragraph', 'heading', 'listitem', 'quote'])

/** Text blocks of a rich-text tree, in document order (list items are leaves; nested lists recurse). */
function blocks(root: Node | undefined): Node[] {
  const out: Node[] = []
  const walk = (n: Node) => {
    if (n.type && TEXT_BLOCKS.has(n.type)) {
      const nested = (n.children ?? []).filter((c) => c.type === 'list')
      if (blockText(n).trim()) out.push(n)
      nested.forEach(walk)
      return
    }
    ;(n.children ?? []).forEach(walk)
  }
  if (root) walk(root)
  return out
}

/** Text of a block, excluding nested lists. Line breaks become "\n". */
function blockText(n: Node): string {
  if (n.type === 'linebreak') return '\n'
  if (typeof n.text === 'string') return n.text
  return (n.children ?? [])
    .filter((c) => c.type !== 'list')
    .map(blockText)
    .join('')
}

/**
 * Replace a block's text. Each line (split on "\n") goes into the first text run of the matching line
 * of the original block; the other runs of that line are emptied. Line breaks are kept.
 */
function setBlockText(n: Node, value: string) {
  const lines = value.split('\n')
  let line = 0
  let firstOfLine = true
  const walk = (c: Node) => {
    if (c.type === 'list') return
    if (c.type === 'linebreak') {
      line++
      firstOfLine = true
      return
    }
    if (typeof c.text === 'string') {
      c.text = firstOfLine ? (lines[line] ?? '') : ''
      firstOfLine = false
      return
    }
    ;(c.children ?? []).forEach(walk)
  }
  ;(n.children ?? []).forEach(walk)
  // Drop runs emptied above so the editor doesn't keep blank formatting nodes.
  const prune = (c: Node) => {
    if (!c.children) return
    c.children = c.children.filter((x) => !(typeof x.text === 'string' && x.text === '' && x.type === 'text'))
    c.children.forEach(prune)
  }
  prune(n)
}

const SOURCES: { collection: 'pages' | 'activities' | 'posts' | 'rooms' | 'partners' | 'team' | 'residents' | 'reports'; fields: string[]; where?: object }[] = [
  { collection: 'pages', fields: ['title', 'hero.eyebrow', 'hero.intro', 'content'] },
  { collection: 'activities', fields: ['title', 'summary', 'content', 'highlights'] },
  { collection: 'posts', fields: ['title', 'summary', 'eventLabel', 'place'] },
  { collection: 'rooms', fields: ['name', 'description', 'priceVariants'] },
  { collection: 'partners', fields: ['description'] },
  { collection: 'team', fields: ['role'] },
  { collection: 'residents', fields: ['discipline'] },
  { collection: 'reports', fields: ['title'] },
]

const get = (obj: Record<string, unknown>, dotted: string) =>
  dotted.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined), obj)

const payload = await getPayload({ config })
const mode = process.env.I18N

if (mode === 'export') {
  fs.mkdirSync(DIR, { recursive: true })
  const entries: Entry[] = []
  for (const src of SOURCES) {
    const res = await payload.find({ collection: src.collection, locale: 'fr', limit: 1000, depth: 0, sort: 'id' })
    for (const doc of res.docs as unknown as Record<string, unknown>[]) {
      const fields: Entry['fields'] = {}
      for (const f of src.fields) {
        const v = get(doc, f)
        if (f === 'content') fields[f] = blocks((v as { root?: Node } | null)?.root).map(blockText)
        else if (f === 'highlights') fields[f] = ((v as { text: string }[] | null) ?? []).map((h) => h.text)
        else if (f === 'priceVariants') fields[f] = ((v as { label: string }[] | null) ?? []).map((h) => h.label)
        else fields[f] = typeof v === 'string' ? v : null
      }
      entries.push({ collection: src.collection, id: doc.id as number, fields })
    }
  }
  fs.writeFileSync(path.join(DIR, 'fr.json'), JSON.stringify(entries, null, 1))
  console.log(`exported ${entries.length} documents → data/i18n/fr.json`)
} else if (mode === 'import') {
  // en-*.json → English; fr-*.json → corrections to the French source (fr.json itself is the export).
  const files = fs.readdirSync(DIR).filter((f) => /^(en|fr)-[a-z0-9-]+\.json$/.test(f))
  let updated = 0
  for (const file of files) {
    const locale = file.startsWith('fr-') ? 'fr' : 'en'
    const entries = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8')) as Entry[]
    for (const e of entries) {
      const fr = (await payload.findByID({ collection: e.collection as never, id: e.id, locale: 'fr', depth: 0, draft: false })) as unknown as Record<string, unknown>
      const data: Record<string, unknown> = {}
      for (const [f, value] of Object.entries(e.fields)) {
        if (value == null) continue
        if (f === 'content') {
          const copy = structuredClone(fr.content) as { root: Node } | null
          if (!copy) continue
          const target = blocks(copy.root)
          const list = value as string[]
          if (list.length !== target.length) {
            console.warn(`! ${e.collection}#${e.id} content: ${list.length} translations for ${target.length} blocks — skipped`)
            continue
          }
          target.forEach((b, i) => setBlockText(b, list[i]))
          data.content = copy
        } else if (f === 'highlights' || f === 'priceVariants') {
          const key = f === 'highlights' ? 'text' : 'label'
          const rows = (fr[f] as Record<string, unknown>[] | null) ?? []
          data[f] = rows.map((row, i) => ({ ...row, [key]: (value as string[])[i] ?? row[key] }))
        } else if (f.startsWith('hero.')) {
          data.hero = { ...((data.hero as object) ?? {}), ...((fr.hero as object) ?? {}), [f.slice(5)]: value }
        } else {
          data[f] = value
        }
      }
      if (!Object.keys(data).length) continue
      await payload.update({ collection: e.collection as never, id: e.id, locale, data: data as never, context: { migration: true } })
      updated++
    }
  }
  console.log(`updated ${updated} documents from ${files.join(', ')}`)
} else {
  console.log('Set I18N=export or I18N=import')
}
process.exit(0)
