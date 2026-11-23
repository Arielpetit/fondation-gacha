/** Public path of a document, used by the admin's preview button and live preview. */
export function documentPath(collection: string, doc: { slug?: string | null; path?: string | null }, locale?: string): string {
  const prefix = locale === 'en' ? '/en' : ''
  switch (collection) {
    case 'posts':
      return `${prefix}/actualites/${doc.slug ?? ''}`
    case 'activities':
      return `${prefix}/actions/${doc.slug ?? ''}`
    case 'pages':
      return `${prefix}/${doc.path ?? ''}`
    default:
      return prefix || '/'
  }
}

/** Preview URL: turns on draft mode for the logged-in editor, then opens the page. */
export const previewUrl = (collection: string, doc: { slug?: string | null; path?: string | null }, locale?: string) =>
  `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/next/preview?path=${encodeURIComponent(documentPath(collection, doc, locale))}`
