/** Converts WordPress post HTML into Payload Lexical rich text, importing images and embeds on the way. */
import crypto from 'node:crypto'

import { convertHTMLToLexical } from '@payloadcms/richtext-lexical'
import type { SanitizedServerEditorConfig } from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'

import type { MediaImporter } from './media'

type LexNode = { type: string; children?: LexNode[]; text?: string; [k: string]: unknown }
export type LexicalState = { root: LexNode & { children: LexNode[] } }

const MEDIA = (id: number) => `§§MEDIA:${id}§§`
const EMBED = (url: string) => `§§EMBED:${url}§§`
const MARKER = /^§§(MEDIA|EMBED):(.+)§§$/

const objectId = () => crypto.randomBytes(12).toString('hex')

export type ConvertContext = {
  editorConfig: SanitizedServerEditorConfig
  media: MediaImporter
  /** Rewrites old-site hrefs to new-site paths; returns '' for dead links. */
  rewriteLink: (href: string) => Promise<string>
  /** Used as alt text when an image has none. */
  altFallback: string
}

/** Top-level ancestor of `el` directly under <body>. */
function topBlock(el: Element, body: HTMLElement): Element {
  let node: Element = el
  while (node.parentElement && node.parentElement !== body) node = node.parentElement
  return node
}

function textOf(node: LexNode): string {
  if (typeof node.text === 'string') return node.text
  return (node.children ?? []).map(textOf).join('')
}

export async function htmlToLexical(html: string, ctx: ConvertContext): Promise<LexicalState> {
  const dom = new JSDOM(`<!doctype html><body>${html}</body>`)
  const doc = dom.window.document
  const body = doc.body

  body.querySelectorAll('script, style, noscript').forEach((n) => n.remove())

  // Insert markers after each top-level block, preserving order within a block.
  const lastInserted = new Map<Element, Element>()
  const insertAfterBlock = (el: Element, text: string) => {
    const block = topBlock(el, body)
    const p = doc.createElement('p')
    p.textContent = text
    const anchor = lastInserted.get(block) ?? block
    anchor.after(p)
    lastInserted.set(block, p)
  }

  // WordPress replaced emoji with <img class="emoji" alt="📚">: put the character back.
  // Same for emoji pasted from Facebook (emoji.php), and drop tracking pixels.
  for (const img of Array.from(
    body.querySelectorAll('img.emoji, img[src*="s.w.org/images/core/emoji"], img[src*="/emoji.php/"]'),
  )) {
    img.replaceWith(doc.createTextNode(img.getAttribute('alt') ?? ''))
  }
  for (const img of Array.from(body.querySelectorAll('img[src*="pixel.gif"], img[width="1"]'))) img.remove()

  for (const img of Array.from(body.querySelectorAll('img'))) {
    const src = img.getAttribute('src')
    const alt = img.getAttribute('alt') || ctx.altFallback
    const id = src ? await ctx.media.fromUrl(src, alt) : null
    // Remove the wrapping link to the full-size file, and figure captions become text.
    const link = img.closest('a')
    const figure = img.closest('figure, .wp-caption')
    const caption = figure?.querySelector('figcaption, .wp-caption-text')?.textContent?.trim()
    if (id) insertAfterBlock(img, MEDIA(id))
    if (caption) insertAfterBlock(img, caption)
    if (figure && figure !== topBlock(img, body)) figure.remove()
    else if (link && link.querySelectorAll('img').length === 1 && !link.textContent?.trim()) link.remove()
    else img.remove()
  }

  for (const frame of Array.from(body.querySelectorAll('iframe'))) {
    const src = frame.getAttribute('src')
    if (src) insertAfterBlock(frame, EMBED(src.startsWith('//') ? `https:${src}` : src))
    frame.remove()
  }

  for (const a of Array.from(body.querySelectorAll('a'))) {
    const href = a.getAttribute('href')?.trim() ?? ''
    const text = a.textContent?.trim() ?? ''
    if (!href || href === '#' || href.startsWith('javascript:')) {
      // Links without a target fail validation: email text becomes mailto, anything else plain text.
      if (/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(text)) a.setAttribute('href', `mailto:${text}`)
      else {
        a.replaceWith(...Array.from(a.childNodes))
        continue
      }
    } else {
      const next = await ctx.rewriteLink(href)
      // Empty string = dead link (file gone from the old server): keep the text only.
      if (!next) {
        a.replaceWith(...Array.from(a.childNodes))
        continue
      }
      a.setAttribute('href', next)
    }
    a.removeAttribute('target')
  }

  // Drop empty paragraphs / blocks left behind by removed images.
  for (const el of Array.from(body.querySelectorAll('p, div, figure'))) {
    if (!el.textContent?.replace(/ /g, ' ').trim() && !el.querySelector('img, iframe, br + *')) el.remove()
  }

  const state = convertHTMLToLexical({
    editorConfig: ctx.editorConfig,
    html: body.innerHTML,
    JSDOM: JSDOM as never,
  }) as unknown as LexicalState

  // The HTML importer URL-encodes hrefs that already contain %-escapes ("/api%2Fmedia…").
  // Undo that so file links with accented names stay clickable.
  const fixLinks = (node: LexNode) => {
    const fields = node.fields as { url?: string } | undefined
    if ((node.type === 'link' || node.type === 'autolink') && fields?.url && /^(%2F|https?%3A)/i.test(fields.url)) {
      fields.url = decodeURIComponent(fields.url)
    }
    node.children?.forEach(fixLinks)
  }
  state.root.children.forEach(fixLinks)

  state.root.children = state.root.children.flatMap((node): LexNode[] => {
    if (node.type !== 'paragraph') return [node]
    const m = textOf(node).trim().match(MARKER)
    if (!m) return [node]
    if (m[1] === 'MEDIA') {
      return [
        {
          type: 'upload',
          version: 3,
          format: '',
          id: objectId(),
          fields: null,
          relationTo: 'media',
          value: Number(m[2]),
        },
      ]
    }
    return [
      {
        type: 'block',
        version: 2,
        format: '',
        fields: { id: objectId(), blockName: '', blockType: 'embed', url: m[2] },
      },
    ]
  })

  return state
}

/** Plain-text lexical document from a short string (used for seeded content). */
export function textToLexical(paragraphs: string[]): LexicalState {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        textFormat: 0,
        children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
      })),
    },
  }
}
