import configPromise from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

/**
 * GET /next/preview?path=/actualites/slug
 * Turns on Next.js draft mode for a logged-in admin user (Payload session cookie), then opens the page.
 * Used by the admin's "Preview" button and the live preview iframe.
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const path = url.searchParams.get('path') || '/'
  // Only same-site paths: never redirect to another host.
  const safePath = path.startsWith('/') && !path.startsWith('//') ? path : '/'

  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: req.headers })
  if (!user) {
    return new Response('Connectez-vous à l’administration pour prévisualiser.', { status: 403 })
  }

  const draft = await draftMode()
  draft.enable()
  redirect(safePath)
}
