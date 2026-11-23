import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as PayloadRichText,
} from '@payloadcms/richtext-lexical/react'

import { CmsImage } from '@/components/media/CmsImage'
import { Gallery, type GalleryImage } from '@/components/media/Gallery'
import { asMedia, mediaSrc } from '@/lib/payload'
import { cn } from '@/lib/cn'

const EMBED_HOSTS = /^(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be|player\.vimeo\.com|vimeo\.com|facebook\.com|html5-player\.libsyn\.com|open\.spotify\.com|google\.com)$/

/** Turn a YouTube/Vimeo/etc. link into an embeddable URL, or null if not allowed. */
function toEmbedUrl(raw: string): string | null {
  try {
    const u = new URL(raw.startsWith('//') ? `https:${raw}` : raw)
    if (!EMBED_HOSTS.test(u.hostname)) return null
    if (/youtu\.be$/.test(u.hostname)) return `https://www.youtube-nocookie.com/embed/${u.pathname.slice(1)}`
    if (/youtube\.com$/.test(u.hostname)) {
      const id = u.searchParams.get('v') ?? u.pathname.split('/embed/')[1]
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`
      return null
    }
    return u.toString()
  } catch {
    return null
  }
}

const LIGHTBOX = {
  fr: { open: 'Agrandir l’image', close: 'Fermer', prev: 'Image précédente', next: 'Image suivante' },
  en: { open: 'Enlarge image', close: 'Close', prev: 'Previous image', next: 'Next image' },
}

type Node = { type: string; value?: unknown; children?: Node[]; [k: string]: unknown }

const isImageUpload = (n: Node) => n.type === 'upload' && Boolean(asMedia(n.value as never)?.mimeType?.startsWith('image/'))

const toGalleryImage = (n: Node): GalleryImage => {
  const media = asMedia(n.value as never)!
  return {
    src: mediaSrc(media) ?? '',
    alt: media.alt ?? '',
    width: media.width ?? 1600,
    height: media.height ?? 1000,
    caption: media.caption,
  }
}

/** Groups consecutive images into one "gallery" node so they render as a grid instead of a tall stack. */
function withGalleries(data: SerializedEditorState): SerializedEditorState {
  const out: Node[] = []
  for (const node of data.root.children as unknown as Node[]) {
    const prev = out[out.length - 1]
    if (isImageUpload(node)) {
      if (prev?.type === 'gallery') (prev.images as GalleryImage[]).push(toGalleryImage(node))
      else out.push({ type: 'gallery', version: 1, images: [toGalleryImage(node)] })
    } else {
      out.push(node)
    }
  }
  return { ...data, root: { ...data.root, children: out as never } }
}

const makeConverters = (locale: 'fr' | 'en'): JSXConvertersFunction => ({ defaultConverters }) => ({
  ...defaultConverters,
  gallery: ({ node }: { node: { images: GalleryImage[] } }) => <Gallery images={node.images} labels={LIGHTBOX[locale]} />,
  ...LinkJSXConverter({ internalDocToHref: () => '#' }),
  upload: ({ node }) => {
    const media = asMedia(node.value as never)
    if (!media) return null
    if (!media.mimeType?.startsWith('image/')) {
      const href = mediaSrc(media)
      return href ? (
        <p>
          <a href={href} target="_blank" rel="noopener" className="file-link">
            {media.alt || media.filename} <span className="text-muted">(PDF)</span>
          </a>
        </p>
      ) : null
    }
    return (
      <figure className="rt-figure">
        <CmsImage media={media} fill={false} sizes="(min-width: 1024px) 760px, 100vw" className="h-auto w-full rounded-sm" />
        {media.caption && <figcaption>{media.caption}</figcaption>}
      </figure>
    )
  },
  blocks: {
    embed: ({ node }: { node: { fields: unknown } }) => {
      const fields = node.fields as { url: string; caption?: string }
      const src = toEmbedUrl(fields.url)
      if (!src) {
        return (
          <p>
            <a href={fields.url} target="_blank" rel="noopener noreferrer">
              {fields.url}
            </a>
          </p>
        )
      }
      const isAudio = /libsyn|spotify/.test(src)
      return (
        <figure className="rt-figure">
          <div className={cn('relative overflow-hidden rounded-sm bg-indigo-deep', isAudio ? 'h-40' : 'aspect-video')}>
            <iframe
              src={src}
              title={fields.caption || 'Vidéo'}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
          {fields.caption && <figcaption>{fields.caption}</figcaption>}
        </figure>
      )
    },
  },
})

/** Renders Payload rich text with the site's typography (.prose-gacha); images become galleries with a lightbox. */
export function RichText({
  data,
  className,
  locale = 'fr',
}: {
  data: SerializedEditorState | null | undefined
  className?: string
  locale?: string
}) {
  if (!data?.root?.children?.length) return null
  return (
    <PayloadRichText
      data={withGalleries(data)}
      converters={makeConverters(locale === 'en' ? 'en' : 'fr')}
      className={cn('prose-gacha', className)}
      disableContainer={false}
    />
  )
}
