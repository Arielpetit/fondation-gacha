import crypto from 'node:crypto'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const WINDOW_MS = 10 * 60 * 1000
const hits = new Map<string, number[]>()

/** Adds the address to the existing Mailchimp list when MAILCHIMP_API_KEY / MAILCHIMP_LIST_ID are set. */
async function syncMailchimp(email: string, locale: string): Promise<boolean> {
  const key = process.env.MAILCHIMP_API_KEY
  const list = process.env.MAILCHIMP_LIST_ID
  if (!key || !list) return false
  const dc = key.split('-')[1]
  const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex')
  const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${list}/members/${hash}`, {
    method: 'PUT',
    headers: { Authorization: `Basic ${Buffer.from(`any:${key}`).toString('base64')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email_address: email, status_if_new: 'pending', language: locale }),
  })
  return res.ok
}

/**
 * POST /api-site/newsletter { email, locale, site_web }
 * Stores the subscriber in Payload (idempotent) and mirrors it to Mailchimp when configured.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; locale?: string; site_web?: string }
  const email = String(body.email ?? '').trim().toLowerCase()
  const locale = body.locale === 'en' ? 'en' : 'fr'

  // Honeypot: pretend success to bots.
  if (body.site_web) return Response.json({ ok: true })
  if (!EMAIL.test(email) || email.length > 254) return Response.json({ ok: false, error: 'invalid' }, { status: 400 })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= 5) return Response.json({ ok: false, error: 'rate' }, { status: 429 })
  hits.set(ip, [...recent, now])

  const payload = await getPayload({ config: configPromise })
  const existing = await payload.find({ collection: 'subscribers', where: { email: { equals: email } }, limit: 1, depth: 0 })
  if (existing.docs[0]) return Response.json({ ok: true })

  let synced = false
  try {
    synced = await syncMailchimp(email, locale)
  } catch {
    synced = false
  }
  await payload.create({ collection: 'subscribers', data: { email, locale, mailchimp: synced }, overrideAccess: true })
  return Response.json({ ok: true })
}
