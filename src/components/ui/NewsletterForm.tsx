'use client'

import { useId, useState } from 'react'

import { cn } from '@/lib/cn'

import { ArrowRight } from './icons'

/**
 * Newsletter sign-up field. UI only for now — wired to Mailchimp / Payload forms in Phase 4.
 */
export function NewsletterForm({
  label,
  placeholder,
  submit,
  success,
  dark,
  className,
}: {
  label: string
  placeholder: string
  submit: string
  success: string
  dark?: boolean
  className?: string
}) {
  const id = useId()
  const [done, setDone] = useState(false)

  return (
    <form
      className={cn('w-full max-w-md', className)}
      onSubmit={(e) => {
        e.preventDefault()
        setDone(true)
      }}
    >
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
          disabled={done}
          aria-label={submit}
          className="group inline-flex size-11 items-center justify-center rounded-full transition-colors hover:bg-terracotta hover:text-ivory"
        >
          <ArrowRight className="size-5 transition-transform duration-500 ease-out-expo group-hover:translate-x-0.5" />
        </button>
      </div>
      <p role="status" className={cn('mt-3 text-sm', dark ? 'text-raffia' : 'text-forest', !done && 'sr-only')}>
        {done ? success : ''}
      </p>
    </form>
  )
}
