'use client'

import { useState } from 'react'

import { Facebook, Mail } from '@/components/ui/icons'

/** Share buttons: native share sheet when available, otherwise Facebook / WhatsApp / email / copy. */
export function ShareLinks({ title, url, labels }: { title: string; url: string; labels: { share: string; copy: string; copied: string } }) {
  const [copied, setCopied] = useState(false)
  const enc = encodeURIComponent
  const btn =
    'inline-flex size-10 items-center justify-center rounded-full border border-ink/15 text-ink/70 transition-colors hover:border-ink hover:text-ink'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="eyebrow mr-2 text-muted">{labels.share}</span>
      <a className={btn} href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`} target="_blank" rel="noopener noreferrer">
        <Facebook className="size-4" />
        <span className="sr-only">Facebook</span>
      </a>
      <a className={btn} href={`https://wa.me/?text=${enc(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
        </svg>
        <span className="sr-only">WhatsApp</span>
      </a>
      <a className={btn} href={`mailto:?subject=${enc(title)}&body=${enc(url)}`}>
        <Mail className="size-4" />
        <span className="sr-only">E-mail</span>
      </a>
      <button
        type="button"
        className="ml-1 text-sm text-muted underline underline-offset-4 hover:text-ink"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
          } catch {
            // Clipboard blocked: nothing to do.
          }
        }}
      >
        <span aria-live="polite">{copied ? labels.copied : labels.copy}</span>
      </button>
    </div>
  )
}
