import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Fraunces, Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import React from 'react'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SmoothScroll } from '@/components/SmoothScroll'
import { routing } from '@/i18n/routing'
import '../styles.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta' })
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3005'

  return {
    metadataBase: new URL(base),
    title: { default: t('title'), template: `%s — Fondation Gacha` },
    description: t('description'),
    alternates: { languages: { fr: '/', en: '/en' } },
    openGraph: { siteName: 'Fondation Jean-Félicien Gacha', locale },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  return (
    <html lang={locale} className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="fixed top-3 left-3 z-[100] -translate-y-20 rounded-full bg-terracotta px-5 py-3 text-sm text-ivory transition-transform focus:translate-y-0"
          >
            {locale === 'fr' ? 'Aller au contenu' : 'Skip to content'}
          </a>
          <SmoothScroll />
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
