import type { ReactNode } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'

import { FormRenderer, type FormFieldDef } from '@/components/forms/FormRenderer'
import { Reveal } from '@/components/motion'
import { Container, Section, SectionHeading, type Tone, isDarkTone } from '@/components/ui/Section'
import type { Locale } from '@/i18n/routing'
import { getForm } from '@/lib/payload'

type LexNode = { text?: string; children?: LexNode[] }
const plainText = (rich: unknown) => {
  const walk = (n: LexNode): string => n.text ?? (n.children ?? []).map(walk).join('')
  const root = (rich as { root?: LexNode } | null)?.root
  return (root?.children ?? []).map(walk).join('\n').trim()
}

/** Loads a form by slug and renders it inside a section. Renders nothing if the form does not exist. */
export async function CmsForm({
  slug,
  title,
  intro,
  tone = 'paper',
  id,
  aside,
}: {
  slug: string
  title: string
  intro?: string
  tone?: Tone
  id?: string
  /** Extra content under the intro (e.g. a map). */
  aside?: ReactNode
}) {
  const locale = (await getLocale()) as Locale
  const form = await getForm(locale, slug)
  if (!form) return null
  const t = await getTranslations('forms')
  const dark = isDarkTone(tone)

  return (
    <Section tone={tone} spacing="md" id={id}>
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading dark={dark} title={title} intro={intro} size="sm" />
          {aside && <div className="mt-8">{aside}</div>}
        </div>
        <Reveal className="lg:col-span-7 lg:col-start-6">
          <FormRenderer
            dark={dark}
            form={{
              id: form.id,
              submitLabel: form.submitButtonLabel || t('submit'),
              confirmation: plainText(form.confirmationMessage) || t('thanks'),
              fields: (form.fields ?? []) as FormFieldDef[],
            }}
            labels={{ sending: t('sending'), error: t('error'), required: t('required') }}
          />
        </Reveal>
      </Container>
    </Section>
  )
}
