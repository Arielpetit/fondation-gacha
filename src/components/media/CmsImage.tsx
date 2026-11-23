import Image from 'next/image'

import { asMedia, mediaSrc, type ImageLike } from '@/lib/payload'
import { cn } from '@/lib/cn'

/**
 * next/image for a Payload media document. Uses the focal point for cropping
 * and falls back to a Ndop-indigo block when the image is missing.
 */
export function CmsImage({
  media,
  sizes = '100vw',
  fill = true,
  priority,
  className,
  alt,
}: {
  media: ImageLike
  sizes?: string
  fill?: boolean
  priority?: boolean
  className?: string
  alt?: string
}) {
  const m = asMedia(media)
  const src = mediaSrc(m)
  if (!m || !src || !m.mimeType?.startsWith('image/')) {
    return <span aria-hidden className={cn('block bg-indigo-ndop/90', fill && 'absolute inset-0', className)} />
  }

  const position = m.focalX != null && m.focalY != null ? `${m.focalX}% ${m.focalY}%` : 'center'
  const altText = alt ?? m.alt ?? ''
  const common = {
    src,
    sizes,
    priority,
    className: cn('object-cover', className),
    style: { objectPosition: position },
  }

  return fill ? (
    <Image {...common} alt={altText} fill />
  ) : (
    <Image {...common} alt={altText} width={m.width ?? 1600} height={m.height ?? 1000} />
  )
}
