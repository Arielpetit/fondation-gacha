import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Reveal, SplitText } from '@/components/motion'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Section'

/** Temporary home hero — the full homepage is built in Phase 3. */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('home')

  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-indigo-deep text-ivory">
      <Image
        src="/images/sg/case-sunset.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover opacity-70"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-indigo-deep via-indigo-deep/50 to-indigo-deep/20" />

      <div className="container-site pt-40 pb-16 sm:pb-24">
        <Reveal delay={0.1}>
          <Eyebrow dark>{t('comingSoon')}</Eyebrow>
        </Reveal>
        <SplitText
          as="h1"
          animateOnMount
          delay={0.25}
          text={t('tagline')}
          className="mt-6 max-w-5xl font-display text-display-xl font-light text-balance"
        />
        <Reveal delay={0.8} className="mt-8 flex max-w-xl flex-col gap-8">
          <p className="text-lead text-ivory/80">{t('intro')}</p>
          <div className="flex flex-wrap gap-3">
            <Button href="/fondation" variant="light" arrow>
              {t('discover')}
            </Button>
            <Button href="/soutenir/don" variant="outline-light">
              {t('support')}
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
