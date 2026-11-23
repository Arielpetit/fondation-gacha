/**
 * Structured sections appended to CMS pages (team, rooms, prices, donations…).
 * Server components; data comes from Payload collections and the site settings global.
 */
import { getLocale, getTranslations } from 'next-intl/server'

import { CopyField } from '@/components/content/CopyField'
import { CmsImage } from '@/components/media/CmsImage'
import { Reveal, Stagger, StaggerItem } from '@/components/motion'
import { NdopPattern } from '@/components/ndop/NdopPattern'
import { Button, buttonClasses } from '@/components/ui/Button'
import { RoomCard, TierCard } from '@/components/ui/cards'
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from '@/components/ui/icons'
import { Container, Section, SectionHeading } from '@/components/ui/Section'
import { cn } from '@/lib/cn'
import { formatDate, formatPrice, splitPhones, telHref } from '@/lib/format'
import { mediaSrc } from '@/lib/payload'
import type { Partner, Press as PressItem, Report, Resident, Room, Setting, Team as TeamMember } from '@/payload-types'

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

// ── Team ────────────────────────────────────────────────────────────────────
export async function TeamGrid({ team }: { team: TeamMember[] }) {
  const t = await getTranslations('pages')
  const groups = [
    { key: 'board', title: t('board'), people: team.filter((m) => m.group === 'board') },
    { key: 'staff', title: t('team'), people: team.filter((m) => m.group === 'staff') },
    { key: 'volunteer', title: t('volunteers'), people: team.filter((m) => m.group === 'volunteer') },
  ].filter((g) => g.people.length)

  return (
    <Section tone="paper" spacing="md">
      <Container className="flex flex-col gap-16">
        {groups.map((g) => (
          <div key={g.key}>
            <SectionHeading title={g.title} size="sm" />
            <Stagger className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {g.people.map((m) => (
                <StaggerItem key={m.id} className="flex items-center gap-4">
                  <span className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-ndop font-display text-lg text-ivory">
                    {m.photo ? <CmsImage media={m.photo} sizes="64px" /> : initials(m.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium">{m.name}</span>
                    {m.role && <span className="block text-sm text-muted">{m.role}</span>}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        ))}
      </Container>
    </Section>
  )
}

// ── Residents ───────────────────────────────────────────────────────────────
export async function ResidentsList({ residents }: { residents: Resident[] }) {
  const t = await getTranslations('pages')
  return (
    <Section tone="indigo" spacing="md">
      <Container>
        <SectionHeading dark title={t('residents')} size="sm" />
        <Stagger as="ul" className="mt-10 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {residents.map((r) => (
            <StaggerItem as="li" key={r.id} className="flex items-baseline justify-between gap-4 border-b border-ivory/15 py-4">
              <span>
                <span className="font-display text-xl">{r.name}</span>
                {r.discipline && <span className="ml-2 text-sm text-ivory/55">{r.discipline}</span>}
              </span>
              <span className="font-display text-raffia">{r.year}</span>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  )
}

// ── Partners ────────────────────────────────────────────────────────────────
export async function PartnersGrid({ partners }: { partners: Partner[] }) {
  const t = await getTranslations('pages')
  return (
    <Section tone="paper" spacing="md">
      <Container>
        <SectionHeading title={t('partners')} size="sm" />
        <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p) => {
            const body = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-2xl font-light">{p.name}</h3>
                  {p.url && <ArrowUpRight className="size-5 shrink-0 text-muted" />}
                </div>
                {p.description && <p className="mt-3 text-sm leading-relaxed text-muted">{p.description}</p>}
              </>
            )
            return (
              <StaggerItem key={p.id}>
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="block h-full rounded-sm border border-line bg-ivory p-6 transition-colors hover:border-ink">
                    {body}
                  </a>
                ) : (
                  <div className="h-full rounded-sm border border-line bg-ivory p-6">{body}</div>
                )}
              </StaggerItem>
            )
          })}
        </Stagger>
      </Container>
    </Section>
  )
}

// ── Villa Boutanga rooms ────────────────────────────────────────────────────
export async function RoomsSection({ rooms, settings }: { rooms: Room[]; settings: Setting }) {
  const t = await getTranslations('pages')
  const tc = await getTranslations('common')
  const locale = await getLocale()
  const villa = settings.contacts?.find((c) => /villa/i.test(c.service))

  return (
    <Section tone="sand" spacing="md" id="chambres">
      <Container>
        <SectionHeading title={t('rooms')} size="sm" />
        <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rooms.map((r, i) => {
            const img = (r.images ?? [])[i % Math.max(1, (r.images ?? []).length)]
            const media = typeof img === 'object' ? img : null
            return (
              <StaggerItem key={r.id}>
                <RoomCard
                  className="h-full"
                  locale={locale}
                  name={r.name}
                  description={
                    r.description +
                    (r.priceVariants?.length
                      ? ` ${r.priceVariants.map((v) => `${v.label} : ${formatPrice(v.price ?? 0, locale)} FCFA`).join(' · ')}`
                      : '')
                  }
                  capacity={r.capacity}
                  price={r.price}
                  perNight={tc('perNight')}
                  guestsLabel={tc('guests')}
                  image={{ src: mediaSrc(media, 'card') ?? '/images/sg/villa-terrace.webp', alt: media?.alt ?? r.name }}
                />
              </StaggerItem>
            )
          })}
        </Stagger>
        {villa && (
          <Reveal className="mt-12 flex flex-col gap-6 rounded-sm bg-indigo-ndop p-8 text-ivory sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow text-raffia">{t('contacts')}</p>
              <p className="mt-2 font-display text-2xl">{villa.service}</p>
              <p className="mt-1 text-sm text-ivory/70">{splitPhones(villa.phones).join(' · ')}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {villa.email && (
                <Button href={`mailto:${villa.email}`} external variant="light" arrow>
                  {villa.email}
                </Button>
              )}
              {splitPhones(villa.phones)[0] && (
                <Button href={telHref(splitPhones(villa.phones)[0])} external variant="outline-light">
                  {splitPhones(villa.phones)[0]}
                </Button>
              )}
            </div>
          </Reveal>
        )}
      </Container>
    </Section>
  )
}

// ── Contacts & visit prices ─────────────────────────────────────────────────
export async function ContactsSection({ settings }: { settings: Setting }) {
  const t = await getTranslations('pages')
  return (
    <Section tone="paper" spacing="md" id="contacts">
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading title={t('contacts')} size="sm" />
          <ul className="mt-8 space-y-4 text-muted">
            {settings.address && (
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-terracotta" />
                {settings.address}
              </li>
            )}
            {settings.hours && (
              <li className="flex gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-terracotta" />
                {settings.hours}
              </li>
            )}
          </ul>
        </div>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-8">
          {(settings.contacts ?? []).map((c) => (
            <StaggerItem key={c.id} className="rounded-sm border border-line bg-ivory p-6">
              <p className="font-display text-xl">{c.service}</p>
              {c.person && <p className="mt-1 text-sm text-muted">{c.person}</p>}
              <ul className="mt-4 space-y-2 text-sm">
                {splitPhones(c.phones).map((p) => (
                  <li key={p}>
                    <a href={telHref(p)} className="inline-flex items-center gap-2 hover:text-terracotta">
                      <Phone className="size-4 text-muted" />
                      {p}
                    </a>
                  </li>
                ))}
                {c.email && (
                  <li>
                    <a href={`mailto:${c.email}`} className="inline-flex items-center gap-2 break-all hover:text-terracotta">
                      <Mail className="size-4 shrink-0 text-muted" />
                      {c.email}
                    </a>
                  </li>
                )}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  )
}

export async function VisitPrices({ settings }: { settings: Setting }) {
  const t = await getTranslations('pages')
  const tc = await getTranslations('common')
  const locale = await getLocale()
  const prices = settings.visitPrices ?? []
  if (!prices.length) return null
  return (
    <Section tone="indigo" spacing="md">
      <Container className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading dark title={t('visitPrices')} size="sm" />
          {settings.visitNotes && <p className="mt-6 text-ivory/75">{settings.visitNotes}</p>}
        </div>
        <ul className="lg:col-span-6 lg:col-start-7">
          {prices.map((p) => (
            <li key={p.id} className="flex items-baseline justify-between gap-6 border-b border-ivory/15 py-4">
              <span className="text-ivory/85">{p.label}</span>
              <span className="shrink-0 font-display text-xl">
                {p.price ? `${formatPrice(p.price, locale)} FCFA` : tc('free')}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}

// ── Membership ──────────────────────────────────────────────────────────────
export async function MembershipSection({ settings }: { settings: Setting }) {
  const t = await getTranslations('pages')
  const locale = await getLocale()
  const tiers = settings.membershipTiers ?? []
  const perks = (settings.membershipPerks ?? []).map((p) => p.text).filter(Boolean) as string[]

  return (
    <Section tone="sand" spacing="md" id="cartes">
      <Container>
        <SectionHeading title={t('membership')} align="center" size="sm" />
        <Stagger className="mt-12 grid gap-4 md:grid-cols-3">
          {tiers.map((tier) => (
            <StaggerItem key={tier.id}>
              <TierCard
                className="h-full"
                locale={locale}
                name={tier.name}
                price={tier.price}
                note={tier.note ?? undefined}
                highlighted={Boolean(tier.highlighted)}
                perks={tier.highlighted ? perks : perks.slice(0, 2)}
                cta={
                  <a href="#adherer" className={buttonClasses(tier.highlighted ? 'light' : 'outline', 'md', 'w-full')}>
                    {t('join')}
                  </a>
                }
              />
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  )
}

// ── Donations ───────────────────────────────────────────────────────────────
export async function DonationSection({ settings }: { settings: Setting }) {
  const t = await getTranslations('pages')
  const tc = await getTranslations('common')
  const bank = settings.bank
  const contact = settings.contacts?.find((c) => /don|volont/i.test(c.service))

  return (
    <Section tone="deep" spacing="md" id="donner" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 text-ivory/[0.035]">
        <NdopPattern motif="moon" scale={1.6} />
      </div>
      <Container className="relative grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading dark title={t('donateByTransfer')} size="sm" />
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          {bank?.iban && (
            <div className="rounded-sm border border-ivory/15 bg-indigo-ndop/60 p-6 backdrop-blur sm:p-8">
              {bank.holder && <p className="mb-2 text-sm text-ivory/65">{t('accountHolder')} : {bank.holder}</p>}
              <CopyField label="IBAN" value={bank.iban} copy={tc('copy')} copied={tc('copied')} />
              {bank.bic && <CopyField label="BIC" value={bank.bic} copy={tc('copy')} copied={tc('copied')} />}
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {settings.paypalUrl && (
              <Button href={settings.paypalUrl} external variant="light" arrow>
                {t('donateByPaypal')}
              </Button>
            )}
            <a href="#recu" className={buttonClasses('outline-light')}>
              {t('donateReceipt')}
            </a>
          </div>
          {contact && (
            <p className="mt-8 text-sm text-ivory/65">
              {t('donateQuestions')} {contact.person} ·{' '}
              <a href={`mailto:${contact.email}`} className="underline underline-offset-4 hover:text-ivory">
                {contact.email}
              </a>
            </p>
          )}
        </div>
      </Container>
    </Section>
  )
}

// ── Reports & press ─────────────────────────────────────────────────────────
function FileRow({ title, meta, href }: { title: string; meta?: string; href?: string | null }) {
  const inner = (
    <>
      <span className="flex min-w-0 items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-terracotta/10 text-xs font-semibold text-terracotta-dark">PDF</span>
        <span className="min-w-0">
          <span className="block font-display text-xl">{title}</span>
          {meta && <span className="block text-sm text-muted">{meta}</span>}
        </span>
      </span>
      {href && <ArrowUpRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
    </>
  )
  const cls = 'group flex items-center justify-between gap-6 border-b border-line py-5'
  return href ? (
    <a href={href} target="_blank" rel="noopener" className={cn(cls, 'hover:bg-sand/50 sm:px-3')}>
      {inner}
    </a>
  ) : (
    <div className={cls}>{inner}</div>
  )
}

export async function ReportsList({ reports }: { reports: Report[] }) {
  const t = await getTranslations('pages')
  return (
    <Section tone="paper" spacing="md">
      <Container className="max-w-4xl">
        <SectionHeading title={t('reports')} size="sm" />
        <div className="mt-8 border-t border-line">
          {reports.map((r) => (
            <FileRow key={r.id} title={r.title} meta={String(r.year)} href={mediaSrc(r.file) ?? r.url} />
          ))}
        </div>
      </Container>
    </Section>
  )
}

export async function PressList({ items }: { items: PressItem[] }) {
  const t = await getTranslations('pages')
  const locale = await getLocale()
  return (
    <Section tone="paper" spacing="md">
      <Container className="max-w-4xl">
        <SectionHeading title={t('press')} size="sm" />
        <div className="mt-8 border-t border-line">
          {items.map((p) => (
            <FileRow
              key={p.id}
              title={p.title}
              meta={[p.outlet, p.date ? formatDate(p.date, locale, { month: 'long', year: 'numeric' }) : null].filter(Boolean).join(' · ')}
              href={mediaSrc(p.file) ?? p.url}
            />
          ))}
        </div>
      </Container>
    </Section>
  )
}
