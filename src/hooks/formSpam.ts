import { APIError, type CollectionBeforeValidateHook } from 'payload'

/** Hidden field filled only by bots (see FormRenderer). */
export const HONEYPOT = 'site_web'

const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 8
const hits = new Map<string, number[]>()

const clientIp = (headers: Headers | undefined) =>
  headers?.get('x-forwarded-for')?.split(',')[0]?.trim() || headers?.get('x-real-ip') || 'unknown'

/**
 * Rejects obvious spam on public form submissions:
 *  - honeypot field filled in,
 *  - more than MAX_PER_WINDOW submissions from one IP in 10 minutes (per server instance),
 *  - over-long values.
 * Staff creating submissions from the admin are not limited.
 */
export const rejectSpam: CollectionBeforeValidateHook = ({ data, req, operation }) => {
  if (operation !== 'create' || req.user) return data

  const values = (data?.submissionData ?? []) as { field: string; value: unknown }[]
  if (values.some((v) => v.field === HONEYPOT && String(v.value ?? '').trim() !== '')) {
    throw new APIError('Envoi refusé.', 400)
  }
  if (values.some((v) => String(v.value ?? '').length > 5000)) {
    throw new APIError('Message trop long.', 400)
  }

  const ip = clientIp(req.headers)
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) {
    throw new APIError('Trop d’envois, merci de réessayer plus tard.', 429)
  }
  hits.set(ip, [...recent, now])

  return { ...data, submissionData: values.filter((v) => v.field !== HONEYPOT) }
}
