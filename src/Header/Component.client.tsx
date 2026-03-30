'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'
import type { NavItemWithChildren, NavItemLink } from './Component'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { cn } from '@/utilities/ui'
import { ChevronDown, Menu, SearchIcon, X } from 'lucide-react'

interface HeaderClientProps {
  data: Header
  resolvedNavItems: NavItemWithChildren[]
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, resolvedNavItems }) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null)
  const pathname = usePathname()

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
              return <DesktopDropdown key={navItem.id || i} navItem={navItem} />
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
          <Link
            href="/search"
            className="ml-1 rounded-md p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Pretraga"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>
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
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          id="mobile-nav-panel"
          className="border-t border-white/20 bg-[#007D41] md:hidden"
        >
          <ul className="container flex flex-col gap-1 py-4">
            {resolvedNavItems.map((navItem, i) => {
              if (navItem.type === 'category' && navItem.category) {
                const label = navItem.categoryLabel || navItem.category.title
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
                    {isExpanded && navItem.children && navItem.children.length > 0 && (
                      <ul className="flex flex-col gap-0.5 pb-1 pl-3">
                        {navItem.children.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/kategorije/${child.slug}`}
                              className="block rounded-md px-3 py-2 text-sm text-white/75 transition-colors hover:bg-white/15 hover:text-white"
                              onClick={() => setMobileOpen(false)}
                            >
                              {child.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
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
              <Link
                href="/search"
                className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-white/90 transition-colors hover:bg-white/15 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                <SearchIcon className="h-4 w-4" />
                Pretraga
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}

/* ── Desktop dropdown for category nav items ── */
function DesktopDropdown({ navItem }: { navItem: Extract<NavItemWithChildren, { type: 'category' }> }) {
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
              href={`/kategorije/${child.slug}`}
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
