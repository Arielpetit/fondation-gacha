import { getLocale, getTranslations } from 'next-intl/server'

import { NdopBand } from '@/components/ndop/NdopPattern'
import { NdopDraw } from '@/components/ndop/NdopDraw'
import { Facebook, Mail, MapPin, Phone, Clock, ArrowUpRight } from '@/components/ui/icons'
import { Logo } from '@/components/ui/Logo'
import { NewsletterForm } from '@/components/ui/NewsletterForm'
import { Link } from '@/i18n/navigation'
import { contact, navigation, t } from '@/lib/site'

export async function SiteFooter() {
  const locale = await getLocale()
  const tr = await getTranslations('footer')
  const nav = await getTranslations('nav')
  const columns = navigation.filter((n) => ['foundation', 'actions', 'stay', 'support'].includes(n.key))

  return (
    <footer className="grain relative overflow-hidden bg-indigo-deep text-ivory">
      <NdopDraw className="pointer-events-none absolute -top-24 -right-24 size-[28rem] text-ivory/[0.07] sm:size-[36rem]" />

      <div className="container-site relative pt-20 sm:pt-28">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="font-display text-display-md font-light text-balance">{tr('tagline')}</p>
            <div className="mt-10 max-w-md">
              <p className="mb-2 text-sm text-ivory/70">{tr('newsletterTitle')}</p>
              <NewsletterForm
                dark
                label={tr('newsletterLabel')}
                placeholder={tr('newsletterPlaceholder')}
                submit={tr('newsletterSubmit')}
                success={tr('newsletterSuccess')}
              />
            </div>
          </div>

          <address className="not-italic lg:col-span-5 lg:col-start-8">
            <ul className="space-y-4 text-[0.95rem] text-ivory/80">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-raffia" />
                {t(contact.address, locale)}
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-raffia" />
                {t(contact.hours, locale)}
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-5 shrink-0 text-raffia" />
                <span>
                  <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="hover:text-ivory">
                    {contact.phone}
                  </a>
                  <span className="block text-sm text-ivory/55">
                    Villa Boutanga :{' '}
                    <a href={`tel:${contact.villaPhone.replace(/\s/g, '')}`} className="hover:text-ivory">
                      {contact.villaPhone}
                    </a>
                  </span>
                </span>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-5 shrink-0 text-raffia" />
                <a href={`mailto:${contact.email}`} className="hover:text-ivory">
                  {contact.email}
                </a>
              </li>
            </ul>
          </address>
        </div>

        <NdopBand className="my-16 text-raffia/50" motif="zigzag" />

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:grid-cols-12">
          <div className="col-span-2 sm:col-span-4 lg:col-span-4">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/60">{tr('about')}</p>
            <div className="mt-6 flex gap-2">
              <a
                href={contact.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-10 items-center justify-center rounded-full border border-ivory/20 transition-colors hover:bg-ivory hover:text-indigo-deep"
              >
                <Facebook className="size-4" />
                <span className="sr-only">Facebook</span>
              </a>
            </div>
          </div>
          {columns.map((col) => (
            <nav key={col.key} aria-label={nav(col.key)} className="lg:col-span-2">
              <p className="eyebrow text-raffia">{nav(col.key)}</p>
              <ul className="mt-5 space-y-2.5 text-sm text-ivory/70">
                {col.children?.map((c) => (
                  <li key={c.href}>
                    <Link href={c.href} className="transition-colors hover:text-ivory">
                      {t(c.label, locale)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-ivory/15 py-8 text-xs text-ivory/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Fondation Jean-Félicien Gacha — {tr('rights')}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/mentions-legales" className="hover:text-ivory">
              {tr('legal')}
            </Link>
            <Link href="/contact" className="hover:text-ivory">
              {nav('contact')}
            </Link>
            <a href={contact.maisonGacha} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-ivory">
              Maison Gacha <ArrowUpRight className="size-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
