'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { btn } from './ui'

const input = 'h-12 w-full rounded-xl border border-line bg-paper px-4 text-base outline-none transition-colors focus:border-accent'

export function LoginForm({ first }: { first: boolean }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email'))
    const password = String(f.get('password'))
    try {
      if (first) {
        if (password !== f.get('confirm')) throw new Error('Les deux mots de passe ne correspondent pas.')
        const r = await fetch('/api/users/first-register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, 'confirm-password': password, name: f.get('name') }) })
        if (!r.ok) throw new Error((await r.json().catch(() => null))?.errors?.[0]?.message ?? 'Création impossible.')
      } else {
        const r = await fetch('/api/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
        if (!r.ok) throw new Error('E-mail ou mot de passe incorrect.')
      }
      router.push('/admin')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      {first && (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Nom</span>
          <input name="name" className={input} autoComplete="name" />
        </label>
      )}
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">E-mail</span>
        <input name="email" type="email" required className={input} autoComplete="email" />
      </label>
      <label className="block text-sm">
        <span className="mb-1.5 block font-medium">Mot de passe</span>
        <span className="relative block">
          <input name="password" type={show ? 'text' : 'password'} required minLength={first ? 8 : 1} className={input} autoComplete={first ? 'new-password' : 'current-password'} />
          <button type="button" onClick={() => setShow(!show)} className="absolute top-1/2 right-4 -translate-y-1/2 text-xs text-muted hover:text-ink">
            {show ? 'Masquer' : 'Afficher'}
          </button>
        </span>
      </label>
      {first && (
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium">Confirmer le mot de passe</span>
          <input name="confirm" type="password" required className={input} autoComplete="new-password" />
        </label>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-terracotta/10 px-4 py-3 text-sm text-terracotta dark:text-accent">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className={btn('primary', 'h-12 w-full text-base')}>
        {busy ? 'Un instant…' : first ? 'Créer le compte' : 'Se connecter'}
      </button>
    </form>
  )
}
