'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import type { Header } from '@/payload-types'
import type { NavItemWithChildren, NavItemLink } from './Component'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { cn } from '@/utilities/ui'
import { useSpotlight } from '@/components/Spotlight/useSpotlight'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ChevronDown, Menu, SearchIcon, X } from 'lucide-react'

interface HeaderClientProps {
  data: Header
  resolvedNavItems: NavItemWithChildren[]
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, resolvedNavItems }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null)
  const pathname = usePathname()
  const { toggle: toggleSpotlight, setOpen: setSpotlightOpen } = useSpotlight()

  useEffect(() => {
    setMobileOpen(false)
    setExpandedMobileCategory(null)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onEscape)

    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onEscape)
    }
  }, [mobileOpen])

  return (
    <header className="sticky top-0 z-50 w-full bg-[#007D41] shadow-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="shrink-0" onClick={() => setMobileOpen(false)}>
          <Logo loading="eager" priority="high" src="/beli.svg" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {resolvedNavItems.map((navItem, i) => {
            if (navItem.type === 'category' && navItem.category) {
              if (navItem.children && navItem.children.length > 0) {
                return <DesktopDropdown key={navItem.id || i} navItem={navItem} />
              }
              const label = navItem.categoryLabel || navItem.category.title
              return (
                <Link
                  key={navItem.id || i}
                  href={`/kategorije/${navItem.category.slug}`}
                  className="rounded-md px-3 py-2 text-sm font-medium text-white/90 no-underline transition-colors hover:bg-white/15 hover:text-white hover:no-underline"
                >
                  {label}
                </Link>
              )
            }

            return (
              <CMSLink
                key={navItem.id || i}
                {...(navItem as NavItemLink).link}
                appearance="link"
                className="rounded-md px-3 py-2 text-sm font-medium text-white/90 no-underline transition-colors hover:bg-white/15 hover:text-white hover:no-underline"
              />
            )
          })}
          <button
            type="button"
            onClick={toggleSpotlight}
            className="ml-1 rounded-md p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Pretraga"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
          <ThemeToggle className="rounded-md p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white" />
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-white/90 transition-colors hover:bg-white/15 hover:text-white md:hidden"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-panel"
          aria-label={mobileOpen ? 'Zatvori meni' : 'Otvori meni'}
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span className="relative block h-6 w-6">
            <AnimatePresence initial={false}>
              {mobileOpen ? (
                <motion.span
                  key="close"
                  className="absolute inset-0"
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <X className="h-6 w-6" />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  className="absolute inset-0"
                  initial={{ opacity: 0, rotate: 90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: -90 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <Menu className="h-6 w-6" />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </button>
      </div>

      {/* Mobile search bar — always visible, opens Spotlight as a bottom sheet */}
      <div className="container pb-3 md:hidden">
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false)
            setSpotlightOpen(true)
          }}
          className="flex h-11 w-full items-center gap-3 rounded-full bg-white pl-5 pr-1.5 text-left shadow-sm"
          aria-label="Pretraga"
        >
          <span className="flex-1 truncate text-sm text-[#1F2A24]/50">
            Pretražite proizvode i kulture…
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#024E29] text-white">
            <SearchIcon className="h-4 w-4" />
          </span>
        </button>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            id="mobile-nav-panel"
            className="absolute inset-x-0 top-full overflow-hidden border-t border-white/20 bg-[#007D41] shadow-lg md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <ul className="container flex max-h-[calc(100dvh-8.5rem)] flex-col gap-1 overflow-y-auto py-4">
            {resolvedNavItems.map((navItem, i) => {
              if (navItem.type === 'category' && navItem.category) {
                const label = navItem.categoryLabel || navItem.category.title

                if (!navItem.children || navItem.children.length === 0) {
                  return (
                    <li key={navItem.id || i} onClick={() => setMobileOpen(false)}>
                      <Link
                        href={`/kategorije/${navItem.category.slug}`}
                        className="block w-full rounded-md px-3 py-2.5 text-base font-medium text-white/90 no-underline transition-colors hover:bg-white/15 hover:text-white"
                      >
                        {label}
                      </Link>
                    </li>
                  )
                }

                const isExpanded = expandedMobileCategory === navItem.id
                return (
                  <li key={navItem.id || i}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-base font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white"
                      onClick={() =>
                        setExpandedMobileCategory(isExpanded ? null : (navItem.id ?? null))
                      }
                    >
                      {label}
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          isExpanded && 'rotate-180',
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.ul
                          className="flex flex-col gap-0.5 overflow-hidden pb-1 pl-3"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                        >
                          {navItem.children.map((child) => (
                            <li key={child.id}>
                              <Link
                                href={`/kategorije/${navItem.category.slug}?sub=${encodeURIComponent(child.slug)}`}
                                className="block rounded-md px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/15 hover:text-white"
                                onClick={() => setMobileOpen(false)}
                              >
                                {child.title}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                )
              }

              return (
                <li key={navItem.id || i} onClick={() => setMobileOpen(false)}>
                  <CMSLink
                    {...(navItem as NavItemLink).link}
                    appearance="link"
                    className="w-full justify-start rounded-md px-3 py-2.5 text-base font-medium text-white/90 no-underline transition-colors hover:bg-white/15 hover:text-white hover:no-underline"
                  />
                </li>
              )
            })}
            <li>
              <ThemeToggle
                showLabel
                className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white [&>svg]:h-4 [&>svg]:w-4"
              />
            </li>
          </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

/* ── Desktop dropdown for category nav items ── */
function DesktopDropdown({
  navItem,
}: {
  navItem: Extract<NavItemWithChildren, { type: 'category' }>
}) {
  const [open, setOpen] = useState(false)
  const label = navItem.categoryLabel || navItem.category.title

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white',
          open && 'bg-white/15 text-white',
        )}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {label}
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && navItem.children && navItem.children.length > 0 && (
        <div className="absolute left-0 top-full z-50 min-w-[200px] rounded-lg border border-border bg-popover pt-2 pb-1 shadow-lg before:absolute before:-top-2 before:left-0 before:h-2 before:w-full">
          {navItem.children.map((child) => (
            <Link
              key={child.id}
              href={`/kategorije/${navItem.category.slug}?sub=${encodeURIComponent(child.slug)}`}
              className="block px-4 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent"
              onClick={() => setOpen(false)}
            >
              {child.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
