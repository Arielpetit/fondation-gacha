'use client'

import { useState } from 'react'

/** Label + monospace value with a copy button (IBAN, BIC…). */
export function CopyField({ label, value, copy, copied }: { label: string; value: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false)
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ivory/15 py-4">
      <div className="min-w-0">
        <p className="eyebrow text-[0.65rem] text-raffia">{label}</p>
        <p className="mt-1.5 font-mono text-base tracking-wide break-all sm:text-lg">{value}</p>
      </div>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value.replace(/\s/g, ''))
            setDone(true)
            setTimeout(() => setDone(false), 2000)
          } catch {
            // Clipboard blocked: the value stays visible to copy by hand.
          }
        }}
        className="shrink-0 rounded-full border border-ivory/30 px-4 py-2 text-sm transition-colors hover:bg-ivory hover:text-indigo-ndop"
      >
        <span aria-live="polite">{done ? copied : copy}</span>
      </button>
    </div>
  )
}
