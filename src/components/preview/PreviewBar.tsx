'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Shown only in draft mode: refreshes the page when the document is saved in the admin
 * (live preview), and offers a way out of draft mode.
 */
export function PreviewBar({ serverURL, label, exit }: { serverURL: string; label: string; exit: string }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <>
      <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} />
      <div className="fixed bottom-4 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-4 rounded-full bg-terracotta px-5 py-2.5 text-sm text-ivory shadow-xl">
        <span className="flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-ivory" aria-hidden />
          {label}
        </span>
        <a href={`/next/exit-preview?path=${encodeURIComponent(pathname)}`} className="underline underline-offset-4">
          {exit}
        </a>
      </div>
    </>
  )
}
