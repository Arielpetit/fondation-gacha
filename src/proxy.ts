import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Skip Payload admin + API, preview routes (/next/*), Next internals and any file with an extension.
  matcher: ['/((?!admin|api|next/|_next|_vercel|.*\\..*).*)'],
}
