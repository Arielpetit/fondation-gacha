import { getTranslations } from 'next-intl/server'

import { NdopDraw } from '@/components/ndop/NdopDraw'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Section'

export default async function NotFound() {
  const t = await getTranslations('common')
  const tn = await getTranslations('nav')

  return (
    <section className="grain relative isolate flex min-h-[80svh] items-center overflow-hidden bg-indigo-deep text-ivory">
      <NdopDraw className="absolute top-1/2 -right-32 size-[34rem] -translate-y-1/2 text-ivory/10" />
      <Container className="relative pt-[var(--header-h)]">
        <p className="font-display text-[clamp(6rem,20vw,14rem)] leading-none font-light text-raffia/80">404</p>
        <h1 className="mt-4 font-display text-display-md font-light">{t('notFoundTitle')}</h1>
        <p className="mt-4 max-w-xl text-lead text-ivory/75">{t('notFoundText')}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/" variant="light" arrow>
            {t('notFoundCta')}
          </Button>
          <Button href="/actualites" variant="outline-light">
            {tn('news')}
          </Button>
        </div>
      </Container>
    </section>
  )
}
