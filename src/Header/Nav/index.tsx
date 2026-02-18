'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, SearchIcon, X } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

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
        aria-controls="mobile-nav-drawer"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMobileOpen((prev) => !prev)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.nav
            id="mobile-nav-drawer"
            className="header-glass-menu absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(18rem,calc(100vw-2rem))] overflow-hidden md:hidden"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.ul
              className="flex flex-col p-2 gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14, delay: 0.04 }}
            >
              {navItems.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink
                      {...link}
                      appearance="link"
                      className="w-full justify-start rounded-xl px-3 py-2 text-sm font-medium text-foreground/90 hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10 no-underline hover:no-underline transition-colors"
                    />
                  </li>
                )
              })}
              <li>
                <Link
                  href="/search"
                  className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-foreground/90 hover:text-foreground hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                >
                  <SearchIcon className="h-4 w-4" />
                  Search
                </Link>
              </li>
            </motion.ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  )
}
