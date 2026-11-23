import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Skip Payload admin + API, Next internals and any file with an extension.
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
