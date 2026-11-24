'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { deleteDoc, saveDoc } from '@/admin/actions'
import { editorToLexical } from '@/admin/richtext'
import type { FieldDef } from '@/admin/schema'
import { cn } from '@/lib/cn'

import { Icon } from './Icon'
import { MediaPicker } from './MediaPicker'
import { Badge, btn, Card } from './ui'
import type { FormProps } from './loadForm'

const RichEditor = dynamic(() => import('./RichEditor').then((m) => m.RichEditor), { ssr: false, loading: () => <div className="h-72 animate-pulse rounded-2xl bg-sand" /> })

const inputCls = 'w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-[0.9rem] sm:px-4 sm:py-2.5 sm:text-[0.95rem] outline-none transition-colors placeholder:text-muted/60 focus:border-accent disabled:opacity-60'

type Ctx = { locale: string; media: FormProps['media']; options: FormProps['options']; setMedia: (m: { id: number; url: string; alt?: string; filename?: string }) => void }

const uid = () => `new-${Math.random().toString(36).slice(2, 9)}`
const blank = (fields: FieldDef[]): Record<string, any> => {
  const o: Record<string, any> = {}
  for (const f of fields) o[f.name] = f.type === 'array' ? [] : f.type === 'group' ? blank(f.fields ?? []) : f.type === 'checkbox' ? Boolean(f.defaultValue) : f.hasMany ? [] : f.type === 'number' ? null : f.type === 'upload' || f.type === 'relationship' ? null : f.defaultValue ?? ''
  return o
}

function Label({ f, ctx, children }: { f: FieldDef; ctx: Ctx; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-medium">
          {f.label}
          {f.required && <span className="text-terracotta"> *</span>}
        </span>
        {f.localized && <span className="rounded-full bg-sand px-2 py-0.5 text-[0.6rem] tracking-wider text-muted uppercase">{ctx.locale}</span>}
      </div>
      {children}
      {f.description && <p className="text-xs text-muted">{f.description}</p>}
    </div>
  )
}

function MediaField({ value, onChange, ctx }: { value: number | null; onChange: (v: number | null) => void; ctx: Ctx }) {
  const [open, setOpen] = useState(false)
  const m = value ? ctx.media[value] : null
  return (
    <div className="flex items-center gap-4">
      <span className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-dashed border-line bg-sand text-muted">
        {m?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.url} alt={m.alt ?? ''} className="size-full object-cover" />
        ) : (
          <Icon name="media" className="size-6" />
        )}
      </span>
      <div className="flex flex-col items-start gap-2">
        <button type="button" className={btn('ghost', 'h-9 px-4')} onClick={() => setOpen(true)}>{m ? 'Changer' : 'Choisir une photo'}</button>
        {m && <button type="button" className="text-xs text-muted hover:text-terracotta" onClick={() => onChange(null)}>Retirer</button>}
      </div>
      {open && <MediaPicker onClose={() => setOpen(false)} onPick={(p) => { ctx.setMedia({ id: p.id, url: p.url, alt: p.alt }); onChange(p.id); setOpen(false) }} />}
    </div>
  )
}

function Chips({ options, value, onToggle }: { options: { value: string | number; label: string }[]; value: (string | number)[]; onToggle: (v: string | number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.value)
        return (
          <button key={String(o.value)} type="button" aria-pressed={on} onClick={() => onToggle(o.value)} className={cn('rounded-full border px-3.5 py-1.5 text-sm transition-colors', on ? 'border-ink bg-ink text-canvas' : 'border-line text-ink/80 hover:border-ink')}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

function Field({ f, value, onChange, ctx }: { f: FieldDef; value: any; onChange: (v: any) => void; ctx: Ctx }) {
  switch (f.type) {
    case 'text':
    case 'email':
      if (f.hasMany) return <Label f={f} ctx={ctx}><input className={inputCls} value={(value ?? []).join(', ')} onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="valeur 1, valeur 2" /></Label>
      return (
        <Label f={f} ctx={ctx}>
          <input className={inputCls} type={f.name === 'password' ? 'password' : f.type} value={value ?? ''} onChange={(e) => onChange(e.target.value)} readOnly={f.readOnly} autoComplete={f.name === 'password' ? 'new-password' : undefined} />
        </Label>
      )
    case 'textarea':
      return <Label f={f} ctx={ctx}><textarea className={cn(inputCls, 'min-h-28 resize-y leading-relaxed')} value={value ?? ''} onChange={(e) => onChange(e.target.value)} /></Label>
    case 'number':
      return <Label f={f} ctx={ctx}><input className={inputCls} type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} /></Label>
    case 'checkbox':
      return (
        <label className="flex cursor-pointer items-center gap-3">
          <span className={cn('relative h-6 w-11 rounded-full transition-colors', value ? 'bg-forest' : 'bg-line')}>
            <span className={cn('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300', value && 'translate-x-5')} />
          </span>
          <input type="checkbox" className="sr-only" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <span className="text-sm font-medium">{f.label}</span>
        </label>
      )
    case 'date':
      return (
        <Label f={f} ctx={ctx}>
          <input className={inputCls} type="datetime-local" value={value ? new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} />
        </Label>
      )
    case 'select':
      if (f.hasMany) return <Label f={f} ctx={ctx}><Chips options={f.options ?? []} value={value ?? []} onToggle={(v) => onChange((value ?? []).includes(v) ? value.filter((x: any) => x !== v) : [...(value ?? []), v])} /></Label>
      return (
        <Label f={f} ctx={ctx}>
          <select className={inputCls} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
            {!f.required && <option value="">—</option>}
            {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Label>
      )
    case 'relationship': {
      const opts = ctx.options[f.relationTo ?? ''] ?? []
      if (f.hasMany) return <Label f={f} ctx={ctx}><Chips options={opts} value={value ?? []} onToggle={(v) => onChange((value ?? []).includes(v) ? value.filter((x: any) => x !== v) : [...(value ?? []), v])} /></Label>
      return (
        <Label f={f} ctx={ctx}>
          <select className={inputCls} value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}>
            <option value="">—</option>
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Label>
      )
    }
    case 'upload':
      return <Label f={f} ctx={ctx}><MediaField value={value} onChange={onChange} ctx={ctx} /></Label>
    case 'richtext':
      return <Label f={f} ctx={ctx}><RichEditor value={value} onChange={onChange} onMedia={ctx.setMedia} /></Label>
    case 'json':
      return <Label f={f} ctx={ctx}><textarea className={cn(inputCls, 'min-h-28 font-mono text-xs')} defaultValue={JSON.stringify(value ?? null, null, 2)} onChange={(e) => { try { onChange(JSON.parse(e.target.value)) } catch {} }} /></Label>
    case 'group':
      return (
        <fieldset className="rounded-2xl border border-line p-5">
          <legend className="px-2 text-sm font-medium">{f.label}</legend>
          <Fields fields={f.fields ?? []} values={value ?? {}} onChange={(v) => onChange(v)} ctx={ctx} />
        </fieldset>
      )
    case 'array': {
      const rows: any[] = value ?? []
      const set = (next: any[]) => onChange(next)
      const title = (row: any, i: number) => {
        const t = (f.fields ?? []).find((x) => x.type === 'text' || x.type === 'textarea')
        const v = t ? row[t.name] : ''
        return v ? String(v) : `${f.rowLabel || 'Élément'} ${i + 1}`
      }
      return (
        <Label f={f} ctx={ctx}>
          <div className="space-y-3">
            {rows.map((row, i) => (
              <details key={row.id ?? i} className="group rounded-2xl border border-line bg-canvas/50" open={rows.length <= 3}>
                <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                  <Icon name="down" className="size-4 text-muted transition-transform group-open:rotate-180" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{title(row, i)}</span>
                  <span className="flex gap-1" onClick={(e) => e.preventDefault()}>
                    <button type="button" className="grid size-8 place-items-center rounded-lg text-muted hover:bg-sand disabled:opacity-30" disabled={i === 0} aria-label="Monter" onClick={() => { const n = [...rows]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; set(n) }}><Icon name="up" className="size-4" /></button>
                    <button type="button" className="grid size-8 place-items-center rounded-lg text-muted hover:bg-sand disabled:opacity-30" disabled={i === rows.length - 1} aria-label="Descendre" onClick={() => { const n = [...rows]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; set(n) }}><Icon name="down" className="size-4" /></button>
                    <button type="button" className="grid size-8 place-items-center rounded-lg text-muted hover:bg-terracotta/10 hover:text-terracotta" aria-label="Supprimer" onClick={() => set(rows.filter((_, j) => j !== i))}><Icon name="trash" className="size-4" /></button>
                  </span>
                </summary>
                <div className="border-t border-line p-4">
                  <Fields fields={f.fields ?? []} values={row} onChange={(v) => set(rows.map((r, j) => (j === i ? { id: r.id, ...v } : r)))} ctx={ctx} />
                </div>
              </details>
            ))}
            <button type="button" className={btn('ghost', 'h-9 px-4')} onClick={() => set([...rows, { id: uid(), ...blank(f.fields ?? []) }])}>
              <Icon name="plus" className="size-4" /> Ajouter
            </button>
          </div>
        </Label>
      )
    }
  }
}

function Fields({ fields, values, onChange, ctx, single }: { fields: FieldDef[]; values: Record<string, any>; onChange: (v: Record<string, any>) => void; ctx: Ctx; single?: boolean }) {
  const half = (f: FieldDef) => ['number', 'date', 'select', 'email'].includes(f.type) && !f.hasMany
  return (
    <div className={cn('grid gap-5', !single && 'sm:grid-cols-2')}>
      {fields.map((f) => (
        <div key={f.name} className={cn(!single && !half(f) && 'sm:col-span-2')}>
          <Field f={f} value={values[f.name]} onChange={(v) => onChange({ ...values, [f.name]: v })} ctx={ctx} />
        </div>
      ))}
    </div>
  )
}

/** Strip client-only row ids, empty passwords, and convert rich text back to Lexical. */
function prepare(fields: FieldDef[], values: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {}
  for (const f of fields) {
    const v = values[f.name]
    if (f.name === 'password' && !v) continue
    if (f.type === 'richtext') out[f.name] = editorToLexical(v)
    else if (f.type === 'array') out[f.name] = (v ?? []).map((r: any) => ({ ...(typeof r.id === 'string' && r.id.startsWith('new-') ? {} : r.id ? { id: r.id } : {}), ...prepare(f.fields ?? [], r) }))
    else if (f.type === 'group') out[f.name] = prepare(f.fields ?? [], v ?? {})
    else if (f.type === 'number' || f.type === 'date') out[f.name] = v === '' || v === undefined ? null : v
    else out[f.name] = v === '' && (f.type === 'upload' || f.type === 'relationship') ? null : v
  }
  return out
}

export function ResourceForm(props: FormProps) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, any>>(props.values)
  const [media, setMedia] = useState(props.media)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, start] = useTransition()
  const [confirm, setConfirm] = useState(false)
  const ctx: Ctx = { locale: props.locale, media, options: props.options, setMedia: (m) => setMedia((x) => ({ ...x, [m.id]: m })) }

  const main = props.fields.filter((f) => !f.sidebar)
  const side = props.fields.filter((f) => f.sidebar)
  const sections = [...new Set(main.map((f) => f.section ?? ''))]
  const isNew = props.id === null && !props.isGlobal

  function save(status?: 'draft' | 'published') {
    setMsg(null)
    start(async () => {
      const r = await saveDoc({ slug: props.slug, id: props.id ?? undefined, locale: props.locale, data: prepare(props.fields, values), status })
      if (!r.ok) return setMsg({ ok: false, text: r.error })
      setMsg({ ok: true, text: status === 'published' ? 'Publié.' : 'Enregistré.' })
      if (isNew && r.data) router.replace(`/admin/${props.slug}/${r.data.id}`)
      else router.refresh()
    })
  }
  function remove() {
    start(async () => {
      const r = await deleteDoc(props.slug, props.id!)
      if (!r.ok) return setMsg({ ok: false, text: r.error })
      router.push(`/admin/${props.slug}`)
      router.refresh()
    })
  }

  return (
    <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4 sm:space-y-6">
        {sections.map((s) => (
          <Card key={s || 'main'}>
            {s && <h2 className="mb-4 font-display text-lg font-light sm:mb-5 sm:text-xl">{s}</h2>}
            <Fields fields={main.filter((f) => (f.section ?? '') === s)} values={values} onChange={setValues} ctx={ctx} />
          </Card>
        ))}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{isNew ? 'Nouveau' : 'État'}</span>
            {props.drafts && !isNew && <Badge tone={props.status === 'published' ? 'ok' : 'draft'}>{props.status === 'published' ? 'Publié' : 'Brouillon'}</Badge>}
          </div>
          {props.drafts ? (
            <div className="grid gap-2">
              <button type="button" disabled={busy} className={btn('primary', 'w-full')} onClick={() => save('published')}>
                <Icon name="check" className="size-4" /> {props.status === 'published' ? 'Mettre à jour' : 'Publier'}
              </button>
              <button type="button" disabled={busy} className={btn('ghost', 'w-full')} onClick={() => save('draft')}>Enregistrer le brouillon</button>
            </div>
          ) : (
            <button type="button" disabled={busy} className={btn('primary', 'w-full')} onClick={() => save()}>
              <Icon name="check" className="size-4" /> {busy ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          )}
          {msg && (
            <p role="status" className={cn('rounded-xl px-3 py-2 text-sm', msg.ok ? 'bg-forest/12 text-forest dark:text-[#a9d3bb]' : 'bg-terracotta/10 text-terracotta dark:text-accent')}>
              {msg.text}
            </p>
          )}
          {props.fields.some((f) => f.localized) && (
            <div className="border-t border-line pt-4">
              <p className="mb-2 text-xs text-muted">Langue du contenu</p>
              <div className="flex rounded-full border border-line p-1 text-sm">
                {(['fr', 'en'] as const).map((l) => (
                  <Link key={l} href={`?lang=${l}`} className={cn('flex-1 rounded-full py-1.5 text-center transition-colors', props.locale === l ? 'bg-ink text-canvas' : 'text-muted hover:text-ink')}>
                    {l === 'fr' ? 'Français' : 'English'}
                  </Link>
                ))}
              </div>
              {props.locale === 'en' && <p className="mt-2 text-xs text-muted">Les champs vides s’affichent en français sur le site.</p>}
            </div>
          )}
          {!isNew && !props.isGlobal && (
            <div className="border-t border-line pt-4">
              {confirm ? (
                <div className="space-y-2">
                  <p className="text-sm">Supprimer définitivement ?</p>
                  <div className="flex gap-2">
                    <button type="button" className={btn('danger', 'h-9 flex-1 px-3')} onClick={remove} disabled={busy}>Supprimer</button>
                    <button type="button" className={btn('ghost', 'h-9 flex-1 px-3')} onClick={() => setConfirm(false)}>Annuler</button>
                  </div>
                </div>
              ) : (
                <button type="button" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-terracotta" onClick={() => setConfirm(true)}>
                  <Icon name="trash" className="size-4" /> Supprimer
                </button>
              )}
            </div>
          )}
        </Card>
        {side.length > 0 && (
          <Card className="p-5">
            <Fields fields={side} values={values} onChange={setValues} ctx={ctx} single />
          </Card>
        )}
      </aside>
    </div>
  )
}
