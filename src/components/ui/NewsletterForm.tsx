'use client'

import { useId, useState } from 'react'

import { cn } from '@/lib/cn'

import { ArrowRight } from './icons'

/**
 * Newsletter sign-up field. Posts to /api-site/newsletter (stored in Payload, mirrored to Mailchimp when configured).
 */
export function NewsletterForm({
  label,
  placeholder,
  submit,
  success,
  error = 'Error',
  locale = 'fr',
  dark,
  className,
}: {
  label: string
  placeholder: string
  submit: string
  success: string
  error?: string
  locale?: string
  dark?: boolean
  className?: string
}) {
  const id = useId()
  const [done, setDone] = useState(false)
  const [failed, setFailed] = useState(false)
  const [sending, setSending] = useState(false)

  return (
    <form
      className={cn('relative w-full max-w-md', className)}
      onSubmit={async (e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        setSending(true)
        setFailed(false)
        try {
          const res = await fetch('/api-site/newsletter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: fd.get('email'), locale, site_web: fd.get('site_web') }),
          })
          if (!res.ok) throw new Error()
          setDone(true)
        } catch {
          setFailed(true)
        } finally {
          setSending(false)
        }
      }}
    >
      <input name="site_web" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px" />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div
        className={cn(
          'flex items-center border-b pb-2 transition-colors focus-within:border-current',
          dark ? 'border-ivory/30' : 'border-ink/25',
        )}
      >
        <input
          id={id}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={placeholder}
          disabled={done}
          className={cn(
            'h-11 min-w-0 flex-1 bg-transparent text-base outline-none',
            dark ? 'placeholder:text-ivory/45' : 'placeholder:text-ink/40',
          )}
        />
        <button
          type="submit"
          disabled={done || sending}
          aria-label={submit}
          className="group inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-terracotta hover:text-ivory"
        >
          <ArrowRight className="size-5 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5" />
        </button>
      </div>
      <p role="status" className={cn('mt-3 text-sm', failed ? 'text-terracotta' : dark ? 'text-raffia' : 'text-forest', !done && !failed && 'sr-only')}>
        {done ? success : failed ? error : ''}
      </p>
    </form>
  )
}
