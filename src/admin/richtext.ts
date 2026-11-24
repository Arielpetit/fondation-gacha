/**
 * Converts between the editor's document (Tiptap/ProseMirror JSON) and the Lexical JSON stored by Payload.
 * Supported: paragraphs, headings, bold/italic/underline/strike/code, links, bullet/numbered lists, quotes, line breaks,
 * images (media library uploads) and embeds (YouTube, Facebook…). Pure functions: usable on server and client.
 */
type Json = Record<string, any>

const FORMAT = { bold: 1, italic: 2, strike: 4, underline: 8, code: 16, subscript: 32, superscript: 64 } as const
const MARK_BY_NAME: Record<string, number> = { bold: 1, italic: 2, strike: 4, underline: 8, code: 16, subscript: 32, superscript: 64 }

export type MediaInfo = { id: number; url: string; alt?: string }

// ── Lexical → editor ────────────────────────────────────────────────────────
function lexInline(nodes: Json[] = [], link?: Json): Json[] {
  const out: Json[] = []
  for (const n of nodes) {
    if (n.type === 'text') {
      const marks: Json[] = []
      for (const [name, bit] of Object.entries(FORMAT)) if ((n.format ?? 0) & bit) marks.push({ type: name })
      if (link) marks.push(link)
      if (n.text) out.push({ type: 'text', text: n.text, ...(marks.length ? { marks } : {}) })
    } else if (n.type === 'linebreak') out.push({ type: 'hardBreak' })
    else if (n.type === 'link' || n.type === 'autolink') {
      const attrs = { href: n.fields?.url ?? n.url ?? '#', target: n.fields?.newTab ? '_blank' : null }
      out.push(...lexInline(n.children, { type: 'link', attrs }))
    } else if (n.children) out.push(...lexInline(n.children, link))
  }
  return out
}

function lexBlock(n: Json, media: Map<number, MediaInfo>): Json[] {
  switch (n.type) {
    case 'paragraph':
      return [{ type: 'paragraph', content: lexInline(n.children) }]
    case 'heading':
      return [{ type: 'heading', attrs: { level: Math.min(6, Math.max(2, Number(String(n.tag).slice(1)) || 2)) }, content: lexInline(n.children) }]
    case 'quote':
      return [{ type: 'blockquote', content: [{ type: 'paragraph', content: lexInline(n.children) }] }]
    case 'list':
      return [
        {
          type: n.listType === 'number' ? 'orderedList' : 'bulletList',
          content: (n.children ?? []).map((li: Json) => ({
            type: 'listItem',
            content: [{ type: 'paragraph', content: lexInline(li.children) }],
          })),
        },
      ]
    case 'upload': {
      const id = typeof n.value === 'object' ? n.value?.id : n.value
      const m = media.get(Number(id))
      return [{ type: 'image', attrs: { src: m?.url ?? '', alt: m?.alt ?? '', mediaId: Number(id) } }]
    }
    case 'block':
      if (n.fields?.blockType === 'embed') return [{ type: 'embed', attrs: { url: n.fields.url ?? '', caption: n.fields.caption ?? '' } }]
      return []
    default:
      return n.children ? n.children.flatMap((c: Json) => lexBlock(c, media)) : []
  }
}

export function lexicalToEditor(lexical: Json | null | undefined, media: Map<number, MediaInfo>): Json {
  const children: Json[] = lexical?.root?.children ?? []
  const content = children.flatMap((n) => lexBlock(n, media))
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] }
}

/** Media ids used by a Lexical document (to preload their URLs). */
export function lexicalMediaIds(lexical: Json | null | undefined): number[] {
  const ids = new Set<number>()
  const walk = (n: Json) => {
    if (n.type === 'upload') ids.add(Number(typeof n.value === 'object' ? n.value?.id : n.value))
    ;(n.children ?? []).forEach(walk)
  }
  ;(lexical?.root?.children ?? []).forEach(walk)
  return [...ids].filter(Boolean)
}

// ── editor → Lexical ────────────────────────────────────────────────────────
const lexText = (text: string, format = 0): Json => ({ mode: 'normal', text, type: 'text', style: '', detail: 0, format, version: 1 })

function edInline(nodes: Json[] = []): Json[] {
  const out: Json[] = []
  for (const n of nodes) {
    if (n.type === 'hardBreak') out.push({ type: 'linebreak', version: 1 })
    else if (n.type === 'text') {
      const marks: Json[] = n.marks ?? []
      const format = marks.reduce((acc, m) => acc | (MARK_BY_NAME[m.type] ?? 0), 0)
      const link = marks.find((m) => m.type === 'link')
      const textNode = lexText(n.text ?? '', format)
      if (link) {
        const last = out[out.length - 1]
        if (last?.type === 'link' && last.fields.url === link.attrs.href) last.children.push(textNode)
        else
          out.push({
            type: 'link',
            version: 3,
            format: '',
            indent: 0,
            direction: null,
            fields: { url: link.attrs.href, newTab: link.attrs.target === '_blank', linkType: 'custom' },
            children: [textNode],
          })
      } else out.push(textNode)
    }
  }
  return out
}

const para = (children: Json[]): Json => ({ type: 'paragraph', format: '', indent: 0, version: 1, direction: null, children })

function edBlock(n: Json): Json[] {
  switch (n.type) {
    case 'paragraph':
      return [para(edInline(n.content))]
    case 'heading':
      return [{ type: 'heading', tag: `h${n.attrs?.level ?? 2}`, format: '', indent: 0, version: 1, direction: null, children: edInline(n.content) }]
    case 'blockquote':
      return [{ type: 'quote', format: '', indent: 0, version: 1, direction: null, children: edInline((n.content ?? []).flatMap((p: Json) => p.content ?? [])) }]
    case 'bulletList':
    case 'orderedList':
      return [
        {
          type: 'list',
          tag: n.type === 'bulletList' ? 'ul' : 'ol',
          listType: n.type === 'bulletList' ? 'bullet' : 'number',
          start: 1,
          format: '',
          indent: 0,
          version: 1,
          direction: null,
          children: (n.content ?? []).map((li: Json, i: number) => ({
            type: 'listitem',
            value: i + 1,
            format: '',
            indent: 0,
            version: 1,
            direction: null,
            children: edInline((li.content ?? []).flatMap((p: Json) => p.content ?? [])),
          })),
        },
      ]
    case 'image':
      return n.attrs?.mediaId ? [{ type: 'upload', version: 3, format: '', relationTo: 'media', value: Number(n.attrs.mediaId), fields: null }] : []
    case 'embed':
      return [{ type: 'block', version: 2, format: '', fields: { blockType: 'embed', blockName: '', url: n.attrs?.url ?? '', ...(n.attrs?.caption ? { caption: n.attrs.caption } : {}) } }]
    default:
      return []
  }
}

export function editorToLexical(doc: Json): Json {
  const children = (doc?.content ?? []).flatMap(edBlock)
  return {
    root: { type: 'root', format: '', indent: 0, version: 1, direction: null, children: children.length ? children : [para([])] },
  }
}
