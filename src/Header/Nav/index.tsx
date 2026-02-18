'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { Menu, SearchIcon, X } from 'lucide-react'

type HeaderNavProps = {
  data: HeaderType
  mobileOpen: boolean
  onToggleMobileMenu: () => void
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ data, mobileOpen, onToggleMobileMenu }) => {
  const navItems = data?.navItems || []

  return (
    <div className="relative flex items-center">
      <nav className="hidden md:flex gap-5 md:gap-7 items-center">
        {navItems.map(({ link }, i) => {
          return (
            <CMSLink
              key={i}
              {...link}
              appearance="link"
              className="text-sm font-medium text-foreground/85 hover:text-foreground no-underline hover:no-underline transition-colors"
            />
          )
        })}
        <Link
          href="/search"
          className="text-foreground/80 hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-white/20 dark:hover:bg-white/10"
          aria-label="Search"
        >
          <SearchIcon className="w-5" />
        </Link>
      </nav>

      <button
        type="button"
        className="md:hidden inline-flex items-center justify-center rounded-full p-2 text-foreground/90 hover:text-foreground transition-colors hover:bg-white/20 dark:hover:bg-white/10"
        aria-expanded={mobileOpen}
        aria-controls="mobile-nav-panel"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        onClick={onToggleMobileMenu}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
    </div>
  )
}
