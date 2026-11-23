'use client'

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { useSafeReducedMotion } from '@/components/motion/useSafeReducedMotion'
import { setScrollLocked } from '@/components/SmoothScroll'
import { buttonClasses } from '@/components/ui/Button'
import { ArrowRight, ArrowUpRight, Close, Plus } from '@/components/ui/icons'
import { Logo } from '@/components/ui/Logo'
import { NdopPattern } from '@/components/ndop/NdopPattern'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import { contact, navigation, t, type NavItem } from '@/lib/site'

const EASE = [0.16, 1, 0.3, 1] as const

/** Routes whose first section is a dark full-bleed hero: header starts transparent with light text. */
const OVERLAY_ROUTES = ['/']

export function SiteHeader() {
  const pathname = usePathname()
  const reduce = useSafeReducedMotion()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState<NavItem['key'] | null>(null)
  const [drawer, setDrawer] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setScrolled(y > 24)
    // Hide when scrolling down past the fold, show again on scroll up.
    setHidden(y > 320 && y > prev && !open && !drawer)
  })

  // Close everything on navigation (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(null)
    setDrawer(false)
  }

  useEffect(() => {
    setScrollLocked(drawer)
    return () => setScrollLocked(false)
  }, [drawer])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null)
        setDrawer(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const openMenu = useCallback((key: NavItem['key'] | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(key)
  }, [])
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(null), 160)
  }, [])

  const overlay = OVERLAY_ROUTES.includes(pathname) && !scrolled && !open
  const solid = !overlay

  return (
    <>
      <motion.header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,color,box-shadow,backdrop-filter] duration-500',
          solid ? 'bg-ivory/90 text-ink shadow-[0_1px_0_var(--color-line)] backdrop-blur-md' : 'bg-transparent text-ivory',
        )}
        animate={{ y: hidden && !reduce ? '-100%' : '0%' }}
        transition={{ duration: 0.5, ease: EASE }}
        onMouseLeave={scheduleClose}
      >
        <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link href="/" className="relative z-10 shrink-0" aria-label="Accueil — Fondation Jean-Félicien Gacha">
            <Logo />
          </Link>

          <DesktopNav open={open} onOpen={openMenu} />

          <div className="flex items-center gap-2">
            <LocaleSwitch className="hidden sm:inline-flex" />
            <Link
              href="/soutenir/don"
              className={buttonClasses(overlay ? 'light' : 'primary', 'sm', 'hidden md:inline-flex')}
            >
              <DonateLabel />
            </Link>
            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full xl:hidden"
              aria-expanded={drawer}
              aria-controls="mobile-menu"
              onClick={() => setDrawer(true)}
            >
              <span className="sr-only">Menu</span>
              <span className="flex w-6 flex-col gap-1.5" aria-hidden>
                <span className="block h-px w-full bg-current" />
                <span className="block h-px w-4 self-end bg-current" />
              </span>
            </button>
          </div>
        </div>

        <MegaPanel openKey={open} onEnter={() => openMenu(open)} onLeave={scheduleClose} />
      </motion.header>

      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
    </>
  )
}

function DonateLabel() {
  const tr = useTranslations('nav')
  return <>{tr('donate')}</>
}

function DesktopNav({
  open,
  onOpen,
}: {
  open: NavItem['key'] | null
  onOpen: (key: NavItem['key'] | null) => void
}) {
  const tr = useTranslations('nav')
  const pathname = usePathname()

  return (
    <nav aria-label="Navigation principale" className="hidden xl:block">
      <ul className="flex items-center gap-1">
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const label = tr(item.key)
          const base =
            'relative inline-flex h-10 items-center rounded-full px-3 text-[0.9rem] whitespace-nowrap transition-colors hover:bg-current/8'
          const indicator = (
            <span
              className={cn(
                'absolute inset-x-3 bottom-1.5 h-px origin-left bg-current transition-transform duration-500 ease-out-expo',
                active || open === item.key ? 'scale-x-100' : 'scale-x-0',
              )}
              aria-hidden
            />
          )

          return (
            <li key={item.key} onMouseEnter={() => onOpen(item.children ? item.key : null)}>
              {item.children ? (
                <button
                  type="button"
                  className={base}
                  aria-expanded={open === item.key}
                  aria-controls={`mega-${item.key}`}
                  // Mouse: hover already opened it, so a click must not close it.
                  // Keyboard (detail === 0): Enter/Space toggles.
                  onClick={(e) => onOpen(e.detail > 0 || open !== item.key ? item.key : null)}
                >
                  {label}
                  {indicator}
                </button>
              ) : (
                <Link href={item.href} className={base} aria-current={active ? 'page' : undefined}>
                  {label}
                  {indicator}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function MegaPanel({
  openKey,
  onEnter,
  onLeave,
}: {
  openKey: NavItem['key'] | null
  onEnter: () => void
  onLeave: () => void
}) {
  const locale = useLocale()
  const tr = useTranslations('nav')
  const item = navigation.find((n) => n.key === openKey && n.children)

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="panel"
          id={`mega-${item.key}`}
          className="absolute inset-x-0 top-full hidden overflow-hidden border-t border-line bg-ivory text-ink shadow-[0_30px_60px_-30px_rgba(18,25,51,0.35)] xl:block"
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={item.key}
              className="container-site grid grid-cols-12 gap-10 py-12"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="col-span-3">
                <p className="eyebrow text-terracotta">{tr(item.key)}</p>
                <Link
                  href={item.href}
                  className="group mt-5 inline-flex items-center gap-2 font-display text-3xl font-light"
                >
                  {tr('overview')}
                  <ArrowRight className="size-5 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
                </Link>
              </div>
              <ul className={cn('grid content-start gap-x-10 gap-y-1', item.feature ? 'col-span-5 grid-cols-2' : 'col-span-9 grid-cols-3')}>
                {item.children!.map((child, i) => (
                  <motion.li
                    key={child.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.035, duration: 0.4, ease: EASE }}
                  >
                    <Link
                      href={child.href}
                      className="group block rounded-sm border-b border-line py-3.5 transition-colors hover:border-ink"
                    >
                      <span className="flex items-center justify-between gap-3 font-medium">
                        {t(child.label, locale)}
                        <ArrowRight className="size-4 -translate-x-2 opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100" />
                      </span>
                      {child.description && (
                        <span className="mt-1 block text-sm text-muted">{t(child.description, locale)}</span>
                      )}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              {item.feature && (
                <Link
                  href={item.feature.href}
                  className="group relative isolate col-span-4 flex min-h-56 flex-col justify-end overflow-hidden rounded-sm p-6 text-ivory"
                >
                  <Image
                    src={item.feature.image}
                    alt={t(item.feature.alt, locale)}
                    fill
                    sizes="30vw"
                    className="-z-10 object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105"
                  />
                  <span className="absolute inset-0 -z-10 bg-gradient-to-t from-indigo-deep/90 to-transparent" />
                  <span className="font-display text-2xl">{t(item.feature.title, locale)}</span>
                  <span className="mt-1 text-sm text-ivory/80">{t(item.feature.text, locale)}</span>
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tr = useTranslations('nav')
  const locale = useLocale()
  const [expanded, setExpanded] = useState<NavItem['key'] | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()

  // Collapse sub-menus whenever the drawer closes.
  if (!open && expanded) setExpanded(null)

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto overscroll-contain bg-indigo-ndop text-ivory xl:hidden"
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="pointer-events-none absolute inset-0 text-ivory/[0.035]">
            <NdopPattern motif="spider" scale={2} />
          </div>
          <h2 id={titleId} className="sr-only">
            Menu
          </h2>
          <div className="container-site relative flex h-[var(--header-h)] shrink-0 items-center justify-between">
            <Logo />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="inline-flex size-11 items-center justify-center rounded-full border border-ivory/25"
            >
              <span className="sr-only">{tr('close')}</span>
              <Close className="size-5" />
            </button>
          </div>

          <nav aria-label="Navigation mobile" className="container-site relative flex-1 pt-6 pb-10">
            <ul>
              {navigation.map((item, i) => (
                <motion.li
                  key={item.key}
                  className="border-b border-ivory/15"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.05, duration: 0.6, ease: EASE }}
                >
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between py-4 text-left font-display text-[1.9rem] font-light"
                        aria-expanded={expanded === item.key}
                        onClick={() => setExpanded(expanded === item.key ? null : item.key)}
                      >
                        {tr(item.key)}
                        <Plus
                          className={cn('size-6 transition-transform duration-500 ease-out-expo', expanded === item.key && 'rotate-45')}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded === item.key && (
                          <motion.ul
                            className="overflow-hidden"
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.45, ease: EASE }}
                          >
                            {[{ href: item.href, label: { fr: tr('overview'), en: tr('overview') } }, ...item.children].map((c) => (
                              <li key={c.href}>
                                <Link href={c.href} className="flex items-center gap-3 py-2.5 text-ivory/80 hover:text-ivory">
                                  <span className="h-px w-4 bg-raffia" aria-hidden />
                                  {t(c.label, locale)}
                                </Link>
                              </li>
                            ))}
                            <li className="h-4" />
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link href={item.href} className="block py-4 font-display text-[1.9rem] font-light">
                      {tr(item.key)}
                    </Link>
                  )}
                </motion.li>
              ))}
            </ul>

            <motion.div
              className="mt-10 flex flex-col gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link href="/soutenir/don" className={buttonClasses('primary', 'lg', 'w-full')}>
                {tr('donate')}
              </Link>
              <div className="flex items-center justify-between text-sm text-ivory/70">
                <a href={`mailto:${contact.email}`} className="hover:text-ivory">
                  {contact.email}
                </a>
                <LocaleSwitch />
              </div>
              <a
                href={contact.maisonGacha}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-raffia"
              >
                maisongacha.fr <ArrowUpRight className="size-4" />
              </a>
            </motion.div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function LocaleSwitch({ className }: { className?: string }) {
  const locale = useLocale()
  const pathname = usePathname()
  const other = locale === 'fr' ? 'en' : 'fr'

  return (
    <Link
      href={pathname}
      locale={other}
      className={cn(
        'inline-flex h-9 items-center gap-1 rounded-full px-3 text-xs font-medium tracking-[0.14em] uppercase transition-colors hover:bg-current/10',
        className,
      )}
      aria-label={other === 'en' ? 'English version' : 'Version française'}
      hrefLang={other}
    >
      <span className={cn(locale === 'fr' ? 'opacity-100' : 'opacity-45')}>FR</span>
      <span className="opacity-30">/</span>
      <span className={cn(locale === 'en' ? 'opacity-100' : 'opacity-45')}>EN</span>
    </Link>
  )
}
