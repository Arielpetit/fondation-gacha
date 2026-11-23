'use client'

import { AnimatePresence, m } from 'motion/react'
import { useId, useState, type FormEvent } from 'react'

import { buttonClasses } from '@/components/ui/Button'
import { ArrowRight } from '@/components/ui/icons'
import { cn } from '@/lib/cn'

export type FormFieldDef = {
  blockType: 'text' | 'email' | 'textarea' | 'number' | 'date' | 'checkbox' | 'select' | 'message'
  name: string
  label?: string | null
  required?: boolean | null
  width?: number | null
  options?: { value: string; label: string }[] | null
}

export type PublicForm = {
  id: number
  submitLabel: string
  confirmation: string
  fields: FormFieldDef[]
}

/** Must match HONEYPOT in src/hooks/formSpam.ts. */
const HONEYPOT = 'site_web'

type Labels = { sending: string; error: string; required: string }

/**
 * Renders a Payload form-builder form and posts it to /api/form-submissions.
 * Works on light or dark backgrounds; shows the form's confirmation message on success.
 */
export function FormRenderer({
  form,
  labels,
  dark = false,
  className,
}: {
  form: PublicForm
  labels: Labels
  dark?: boolean
  className?: string
}) {
  const uid = useId()
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const submissionData = form.fields
      .filter((f) => f.blockType !== 'message')
      .map((f) => ({ field: f.name, value: f.blockType === 'checkbox' ? fd.get(f.name) === 'on' : String(fd.get(f.name) ?? '') }))
    const trap = String(fd.get(HONEYPOT) ?? '')
    if (trap) submissionData.push({ field: HONEYPOT, value: trap })

    setStatus('sending')
    setError(null)
    try {
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form: form.id, submissionData }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { errors?: { message?: string }[] } | null
        throw new Error(body?.errors?.[0]?.message || labels.error)
      }
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setError((err as Error).message || labels.error)
    }
  }

  const input = cn(
    'w-full rounded-sm border bg-transparent px-4 py-3 text-base outline-none transition-colors',
    dark
      ? 'border-ivory/25 placeholder:text-ivory/40 focus:border-raffia'
      : 'border-ink/15 bg-paper placeholder:text-ink/35 focus:border-indigo-ndop',
  )

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="wait" initial={false}>
        {status === 'done' ? (
          <m.div
            key="done"
            role="status"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('rounded-sm p-8', dark ? 'bg-ivory/10' : 'bg-forest/10 text-forest')}
          >
            <p className="font-display text-display-sm font-light">✓</p>
            <p className="mt-3 text-lead">{form.confirmation}</p>
          </m.div>
        ) : (
          <m.form
            key="form"
            exit={{ opacity: 0, y: -8 }}
            onSubmit={onSubmit}
            className="grid gap-5 sm:grid-cols-2"
            noValidate={false}
          >
            {form.fields.map((f) => {
              const id = `${uid}-${f.name}`
              const half = (f.width ?? 100) <= 50
              const label = (
                <span className={cn('mb-2 block text-sm font-medium', dark ? 'text-ivory/80' : 'text-ink/80')}>
                  {f.label}
                  {f.required && (
                    <span className="text-terracotta" aria-hidden>
                      {' '}
                      *
                    </span>
                  )}
                </span>
              )
              const wrap = cn(half ? 'sm:col-span-1' : 'sm:col-span-2')

              if (f.blockType === 'message') return null
              if (f.blockType === 'checkbox') {
                return (
                  <label key={f.name} htmlFor={id} className={cn(wrap, 'flex cursor-pointer items-start gap-3 text-sm sm:col-span-2')}>
                    <input id={id} name={f.name} type="checkbox" required={Boolean(f.required)} className="mt-0.5 size-5 accent-terracotta" />
                    <span className={dark ? 'text-ivory/80' : 'text-ink/80'}>{f.label}</span>
                  </label>
                )
              }
              return (
                <label key={f.name} htmlFor={id} className={wrap}>
                  {label}
                  {f.blockType === 'textarea' ? (
                    <textarea id={id} name={f.name} required={Boolean(f.required)} rows={5} maxLength={5000} className={cn(input, 'resize-y')} />
                  ) : f.blockType === 'select' ? (
                    <select id={id} name={f.name} required={Boolean(f.required)} defaultValue="" className={cn(input, 'appearance-none', dark && '[&>option]:text-ink')}>
                      <option value="" disabled>
                        —
                      </option>
                      {(f.options ?? []).map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={id}
                      name={f.name}
                      required={Boolean(f.required)}
                      type={f.blockType === 'email' ? 'email' : f.blockType === 'number' ? 'number' : f.blockType === 'date' ? 'date' : 'text'}
                      min={f.blockType === 'number' ? 1 : undefined}
                      autoComplete={f.blockType === 'email' ? 'email' : f.name === 'nom' ? 'name' : f.name === 'telephone' ? 'tel' : undefined}
                      inputMode={f.name === 'telephone' ? 'tel' : undefined}
                      className={cn(input, dark && '[color-scheme:dark]')}
                    />
                  )}
                </label>
              )
            })}

            {/* Honeypot: invisible to people, tempting for bots. */}
            <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label>
                Site web
                <input name={HONEYPOT} tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p className={cn('text-xs', dark ? 'text-ivory/50' : 'text-muted')}>* {labels.required}</p>
              <button type="submit" disabled={status === 'sending'} className={buttonClasses(dark ? 'light' : 'primary', 'lg')}>
                {status === 'sending' ? labels.sending : form.submitLabel}
                <ArrowRight className="size-5" />
              </button>
            </div>
            {status === 'error' && error && (
              <p role="alert" className="text-sm text-terracotta sm:col-span-2">
                {error}
              </p>
            )}
          </m.form>
        )}
      </AnimatePresence>
    </div>
  )
}
