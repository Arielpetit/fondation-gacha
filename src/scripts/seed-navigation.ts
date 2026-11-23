/**
 * Fills the "Menu du site" global from the built-in menu (src/lib/site.ts), in French and English.
 * Feature images in public/images/sg/ are uploaded to the media library once.
 *   pnpm seed:nav
 * Re-running overwrites the menu: only use it to reset.
 */
import fs from 'node:fs'
import path from 'node:path'

import { getPayload } from 'payload'

import config from '@payload-config'
import { navigation } from '@/lib/site'

const LABELS = {
  fr: { foundation: 'La Fondation', actions: 'Nos actions', news: 'Actualités', stay: 'Séjourner', support: 'Soutenir', resources: 'Ressources', maison: 'Maison Gacha' },
  en: { foundation: 'The Foundation', actions: 'Our work', news: 'News', stay: 'Stay', support: 'Support us', resources: 'Resources', maison: 'Maison Gacha' },
} as const

const payload = await getPayload({ config })

async function staticImage(publicPath: string, alt: string): Promise<number> {
  const legacyUrl = `static:${publicPath}`
  const found = await payload.find({ collection: 'media', where: { legacyUrl: { equals: legacyUrl } }, limit: 1, depth: 0 })
  if (found.docs[0]) return found.docs[0].id
  const file = path.resolve('public', publicPath.replace(/^\//, ''))
  const data = fs.readFileSync(file)
  const doc = await payload.create({
    collection: 'media',
    data: { alt, legacyUrl },
    file: { data, mimetype: 'image/webp', name: path.basename(file), size: data.length },
  })
  return doc.id
}

const images = new Map<string, number>()
for (const item of navigation) {
  if (item.feature) images.set(item.key, await staticImage(item.feature.image, item.feature.alt.fr))
}

const build = (locale: 'fr' | 'en', ids?: { id: string; children: string[] }[]) =>
  navigation.map((item, i) => ({
    ...(ids ? { id: ids[i].id } : {}),
    label: LABELS[locale][item.key],
    href: item.href,
    inFooter: ['foundation', 'actions', 'stay', 'support'].includes(item.key),
    children: (item.children ?? []).map((c, j) => ({
      ...(ids ? { id: ids[i].children[j] } : {}),
      label: c.label[locale],
      href: c.href,
      description: c.description?.[locale] ?? null,
    })),
    feature: item.feature
      ? { image: images.get(item.key), title: item.feature.title[locale], text: item.feature.text[locale], href: item.feature.href }
      : {},
  }))

const fr = await payload.updateGlobal({ slug: 'navigation', locale: 'fr', data: { items: build('fr') } as never })
const ids = (fr.items ?? []).map((it) => ({ id: it.id!, children: (it.children ?? []).map((c) => c.id!) }))
await payload.updateGlobal({ slug: 'navigation', locale: 'en', data: { items: build('en', ids) } as never })

console.log(`✓ menu: ${ids.length} items`)
process.exit(0)
