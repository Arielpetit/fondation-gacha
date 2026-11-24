import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import type { ReactNode } from 'react'

import { ThemeScript } from '@/components/theme/ThemeScript'

import '../(frontend)/styles.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap', axes: ['opsz'] })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Espace équipe — Fondation Gacha', template: '%s — Espace équipe' },
  robots: { index: false, follow: false },
}

export default function ManageRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-canvas font-sans text-ink antialiased">{children}</body>
    </html>
  )
}
