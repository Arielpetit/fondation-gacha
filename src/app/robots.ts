import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.fondationgacha.org').replace(/\/$/, '')
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/styleguide', '/en/styleguide'] }],
    sitemap: `${base}/sitemap.xml`,
  }
}
