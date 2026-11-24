'use client'

import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'motion/react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { useSafeReducedMotion } from '@/components/motion/useSafeReducedMotion'
import { setScrollLocked } from '@/components/SmoothScroll'
import { buttonClasses } from '@/components/ui/Button'
import { ArrowRight, ArrowUpRight, Close, Plus } from '@/components/ui/icons'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { NdopPattern } from '@/components/ndop/NdopPattern'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/cn'
import type { ResolvedNavItem } from '@/lib/navigation'
import { contact } from '@/lib/site'

type NavItem = ResolvedNavItem

const EASE = [0.16, 1, 0.3, 1] as const

/** Every public page opens on a dark hero, so the header starts transparent with light text — except these. */
const SOLID_ROUTES = ['/styleguide']

export function SiteHeader({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const reduce = useSafeReducedMotion()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
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

  const openMenu = useCallback((key: string | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpen(key)
  }, [])
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpen(null), 160)
  }, [])

  const overlay = !SOLID_ROUTES.includes(pathname) && !scrolled && !open
  const solid = !overlay

  return (
    <>
      <m.header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,color,box-shadow,backdrop-filter] duration-500',
          solid ? 'bg-canvas/90 text-ink shadow-[0_1px_0_var(--line)] backdrop-blur-md' : 'bg-transparent text-ivory',
        )}
        animate={{ y: hidden && !reduce ? '-100%' : '0%' }}
        transition={{ duration: 0.5, ease: EASE }}
        onMouseLeave={scheduleClose}
      >
        <div className="container-site flex h-[var(--header-h)] items-center justify-between gap-4 2xl:gap-6">
          <Link href="/" className="relative z-10 shrink-0">
            <Logo />
          </Link>

          <DesktopNav items={items} open={open} onOpen={openMenu} />

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <ThemeToggleNav />
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

        <MegaPanel items={items} openKey={open} onEnter={() => openMenu(open)} onLeave={scheduleClose} />
      </m.header>

      <MobileDrawer items={items} open={drawer} onClose={() => setDrawer(false)} />
    </>
  )
}

function ThemeToggleNav({ className }: { className?: string }) {
  const tr = useTranslations('nav')
  return <ThemeToggle className={className} labels={{ toDark: tr('toDark'), toLight: tr('toLight') }} />
}

function DonateLabel() {
  const tr = useTranslations('nav')
  return <>{tr('donate')}</>
}

function DesktopNav({
  items,
  open,
  onOpen,
}: {
  items: NavItem[]
  open: string | null
  onOpen: (key: string | null) => void
}) {
  const pathname = usePathname()
  // Soft pill that glides under the hovered or focused link.
  const [pill, setPill] = useState({ x: 0, w: 0, on: false })
  const moveTo = (el: HTMLElement) => setPill({ x: el.offsetLeft, w: el.offsetWidth, on: true })

  return (
    <nav aria-label="Navigation principale" className="hidden xl:block">
      <ul className="relative flex items-center gap-0.5 2xl:gap-1" onMouseLeave={() => setPill((p) => ({ ...p, on: false }))}>
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 h-10 rounded-full bg-current/10 transition-[transform,width,opacity] duration-500 ease-out-expo"
          style={{ transform: `translateX(${pill.x}px)`, width: pill.w, opacity: pill.on ? 1 : 0 }}
        />
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const label = item.label
          const hasChildren = item.children.length > 0
          const base =
            'relative inline-flex h-10 items-center rounded-full px-[0.45rem] text-[0.85rem] whitespace-nowrap 2xl:px-3 2xl:text-[0.9rem]'
          const indicator = (
            <span
              className={cn(
                'absolute inset-x-[0.45rem] bottom-1.5 h-px 2xl:inset-x-3 origin-left bg-current transition-transform duration-500 ease-out-expo',
                active || open === item.id ? 'scale-x-100' : 'scale-x-0',
              )}
              aria-hidden
            />
          )

          return (
            <li
              key={item.id}
              onMouseEnter={(e) => {
                onOpen(hasChildren ? item.id : null)
                moveTo(e.currentTarget)
              }}
              onFocus={(e) => moveTo(e.currentTarget)}
              onBlur={() => setPill((p) => ({ ...p, on: false }))}
            >
              {hasChildren ? (
                <button
                  type="button"
                  className={base}
                  aria-expanded={open === item.id}
                  aria-controls={`mega-${item.id}`}
                  // Mouse: hover already opened it, so a click must not close it.
                  // Keyboard (detail === 0): Enter/Space toggles.
                  onClick={(e) => onOpen(e.detail > 0 || open !== item.id ? item.id : null)}
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
  items,
  openKey,
  onEnter,
  onLeave,
}: {
  items: NavItem[]
  openKey: string | null
  onEnter: () => void
  onLeave: () => void
}) {
  const tr = useTranslations('nav')
  const item = items.find((n) => n.id === openKey && n.children.length > 0)

  return (
    <AnimatePresence>
      {item && (
        <m.div
          key="panel"
          id={`mega-${item.id}`}
          className="absolute inset-x-0 top-full hidden overflow-hidden border-t border-line bg-canvas text-ink shadow-[0_30px_60px_-30px_rgba(18,25,51,0.35)] xl:block"
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          <AnimatePresence mode="wait">
            <m.div
              key={item.id}
              className="container-site grid grid-cols-12 gap-10 py-12"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              <div className="col-span-3">
                <p className="eyebrow text-accent">{item.label}</p>
                <Link
                  href={item.href}
                  className="group mt-5 inline-flex items-center gap-2 font-display text-3xl font-light"
                >
                  {tr('overview')}
                  <ArrowRight className="size-5 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
                </Link>
              </div>
              <ul className={cn('grid content-start gap-x-10 gap-y-1', item.feature ? 'col-span-5 grid-cols-2' : 'col-span-9 grid-cols-3')}>
                {item.children.map((child, i) => (
                  <m.li
                    key={child.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.035, duration: 0.4, ease: EASE }}
                  >
                    <Link
                      href={child.href}
                      className="group block border-b border-line py-3.5 transition-colors hover:border-ink"
                    >
                      <span className="flex items-center justify-between gap-3 font-medium">
                        {child.label}
                        <ArrowRight className="size-4 -translate-x-2 opacity-0 transition-all duration-500 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100" />
                      </span>
                      {child.description && (
                        <span className="mt-1 block text-sm text-muted">{child.description}</span>
                      )}
                    </Link>
                  </m.li>
                ))}
              </ul>
              {item.feature && (
                <Link
                  href={item.feature.href}
                  className="group relative isolate col-span-4 flex min-h-56 flex-col justify-end overflow-hidden rounded-2xl p-6 text-ivory"
                >
                  <Image
                    src={item.feature.image}
                    alt={item.feature.alt}
                    fill
                    sizes="30vw"
                    className="-z-10 object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105"
                  />
                  <span className="absolute inset-0 -z-10 bg-gradient-to-t from-indigo-deep/90 to-transparent" />
                  <span className="font-display text-2xl">{item.feature.title}</span>
                  <span className="mt-1 text-sm text-ivory/80">{item.feature.text}</span>
                </Link>
              )}
            </m.div>
          </AnimatePresence>
        </m.div>
      )}
    </AnimatePresence>
  )
}

function MobileDrawer({ items, open, onClose }: { items: NavItem[]; open: boolean; onClose: () => void }) {
  const tr = useTranslations('nav')
  const [expanded, setExpanded] = useState<string | null>(null)
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
        <m.div
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
              {items.map((item, i) => (
                <m.li
                  key={item.id}
                  className="border-b border-ivory/15"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.05, duration: 0.6, ease: EASE }}
                >
                  {item.children.length > 0 ? (
                    <>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between py-4 text-left font-display text-[1.9rem] font-light"
                        aria-expanded={expanded === item.id}
                        onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      >
                        {item.label}
                        <Plus
                          className={cn('size-6 transition-transform duration-500 ease-out-expo', expanded === item.id && 'rotate-45')}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded === item.id && (
                          <m.ul
                            className="overflow-hidden"
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.45, ease: EASE }}
                          >
                            {[{ href: item.href, label: tr('overview') }, ...item.children].map((c) => (
                              <li key={c.href}>
                                <Link href={c.href} className="flex items-center gap-3 py-2.5 text-ivory/80 hover:text-ivory">
                                  <span className="h-px w-4 bg-raffia" aria-hidden />
                                  {c.label}
                                </Link>
                              </li>
                            ))}
                            <li className="h-4" />
                          </m.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link href={item.href} className="block py-4 font-display text-[1.9rem] font-light">
                      {item.label}
                    </Link>
                  )}
                </m.li>
              ))}
            </ul>

            <m.div
              className="mt-10 flex flex-col gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link href="/soutenir/don" className={buttonClasses('primary', 'lg', 'w-full')}>
                {tr('donate')}
              </Link>
              <div className="flex items-center justify-between gap-2 text-sm text-ivory/70">
                <a href={`mailto:${contact.email}`} className="min-w-0 truncate hover:text-ivory">
                  {contact.email}
                </a>
                <div className="flex shrink-0 items-center gap-1">
                  <ThemeToggleNav />
                  <LocaleSwitch />
                </div>
              </div>
              <a
                href={contact.maisonGacha}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-raffia"
              >
                maisongacha.fr <ArrowUpRight className="size-4" />
              </a>
            </m.div>
          </nav>
        </m.div>
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
      hrefLang={other}
    >
      {/* Accessible name starts with the visible text ("FR / EN") and then says what the link does. */}
      <span className={cn(locale === 'fr' ? 'opacity-100' : 'opacity-45')}>FR</span>
      <span className="opacity-30">/</span>
      <span className={cn(locale === 'en' ? 'opacity-100' : 'opacity-45')}>EN</span>
      <span className="sr-only" lang={other}>
        {other === 'en' ? ' — English version' : ' — version française'}
      </span>
    </Link>
  )
}
