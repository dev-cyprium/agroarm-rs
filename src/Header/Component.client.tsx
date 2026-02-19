'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { cn } from '@/utilities/ui'
import { AnimatePresence, motion } from 'framer-motion'
import { SearchIcon } from 'lucide-react'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSurfaceExpanded, setMobileSurfaceExpanded] = useState(false)
  const [surfaceMorphing, setSurfaceMorphing] = useState(false)
  const [mobileSurfaceCollapsing, setMobileSurfaceCollapsing] = useState(false)
  const [useGlassSurface, setUseGlassSurface] = useState(true)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const navItems = data?.navItems || []

  useEffect(() => {
    setHeaderTheme(null)
    setMobileOpen(false)
    setMobileSurfaceExpanded(false)
    setSurfaceMorphing(false)
    setMobileSurfaceCollapsing(false)
  }, [pathname, setHeaderTheme])

  useEffect(() => {
    setTheme(headerTheme ?? null)
  }, [headerTheme])

  useEffect(() => {
    const desktopMedia = window.matchMedia('(min-width: 48rem)')
    const closeOnDesktop = () => {
      if (desktopMedia.matches) {
        setMobileOpen(false)
        setMobileSurfaceExpanded(false)
      }
    }

    closeOnDesktop()
    desktopMedia.addEventListener('change', closeOnDesktop)

    return () => {
      desktopMedia.removeEventListener('change', closeOnDesktop)
    }
  }, [])

  useEffect(() => {
    if (!mobileSurfaceExpanded) return

    const previousOverflow = document.body.style.overflow
    const previousTouchAction = document.body.style.touchAction
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }

    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    window.addEventListener('keydown', onEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.touchAction = previousTouchAction
      window.removeEventListener('keydown', onEscape)
    }
  }, [mobileSurfaceExpanded])

  useEffect(() => {
    let frame: number | null = null

    const measureHeroThreshold = () => {
      const hero = document.querySelector<HTMLElement>('[data-hero-root="true"]')
      const heroHeight = hero?.offsetHeight ?? window.innerHeight * 0.5
      return Math.min(100, Math.max(50, heroHeight * 0.12))
    }

    const applySurfaceMode = () => {
      const threshold = measureHeroThreshold()
      setUseGlassSurface(window.scrollY <= threshold)
    }

    const onScroll = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(() => {
        applySurfaceMode()
        frame = null
      })
    }

    applySurfaceMode()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', applySurfaceMode)

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', applySurfaceMode)
    }
  }, [pathname])

  const handleToggleMobileMenu = React.useCallback(() => {
    setMobileOpen((previouslyOpen) => {
      const nextOpen = !previouslyOpen

      if (nextOpen) setMobileSurfaceExpanded(true)

      return nextOpen
    })
  }, [])

  const handleCloseMobileMenu = React.useCallback(() => {
    setMobileOpen(false)
  }, [])

  return (
    <header
      className="header-glass fixed top-0 left-0 right-0 z-50 isolate"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        <motion.div
          layout
          initial={false}
          onLayoutAnimationStart={() => setSurfaceMorphing(true)}
          onLayoutAnimationComplete={() => setSurfaceMorphing(false)}
          onAnimationStart={() => setSurfaceMorphing(true)}
          onAnimationComplete={() => setSurfaceMorphing(false)}
          animate={
            mobileSurfaceExpanded
              ? {
                  borderRadius: 18,
                  scaleX: [1, 1.012, 0.998, 1],
                  scaleY: [1, 0.99, 1.004, 1],
                }
              : {
                  borderRadius: 9999,
                  scaleX: 1,
                  scaleY: 1,
                }
          }
          transition={
            mobileSurfaceExpanded
              ? {
                  borderRadius: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
                  scaleX: { duration: 0.36, ease: [0.22, 1, 0.36, 1], times: [0, 0.38, 0.72, 1] },
                  scaleY: { duration: 0.36, ease: [0.22, 1, 0.36, 1], times: [0, 0.35, 0.7, 1] },
                  layout: { type: 'spring', stiffness: 340, damping: 36, mass: 0.85 },
                }
              : {
                  type: 'spring',
                  stiffness: 420,
                  damping: 42,
                  mass: 0.72,
                }
          }
          className={cn(
            'header-glass-surface relative z-10 flex items-center justify-between gap-6 px-5 py-3 md:px-6',
            !useGlassSurface && 'header-solid-surface',
            mobileSurfaceExpanded && 'header-glass-surface-mobile-open',
          )}
        >
          <div className="flex w-full items-center justify-between gap-4">
            <Link
              href="/"
              className={cn(
                'shrink-0 transition-opacity duration-150',
                surfaceMorphing || mobileSurfaceCollapsing
                  ? 'pointer-events-none opacity-0 md:pointer-events-auto md:opacity-100'
                  : 'opacity-100',
              )}
              onClick={handleCloseMobileMenu}
            >
              <Logo
                loading="eager"
                priority="high"
                src="/beli.svg"
                className={theme === 'dark' ? undefined : 'invert'}
              />
            </Link>
            <HeaderNav
              data={data}
              mobileOpen={mobileOpen}
              onToggleMobileMenu={handleToggleMobileMenu}
            />
          </div>

          <AnimatePresence
            initial={false}
            onExitComplete={() => {
              if (!mobileOpen) {
                setMobileSurfaceCollapsing(true)
                setMobileSurfaceExpanded(false)
                window.setTimeout(() => {
                  setMobileSurfaceCollapsing(false)
                }, 320)
              }
            }}
          >
            {mobileOpen && (
              <motion.nav
                id="mobile-nav-panel"
                className="header-glass-mobile-nav rounded-2xl p-0 shadow-none md:hidden"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.ul
                  className="flex flex-col gap-2 p-1"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { transition: { staggerChildren: 0.025, staggerDirection: -1 } },
                    visible: { transition: { delayChildren: 0.04, staggerChildren: 0.045 } },
                  }}
                >
                  {navItems.map(({ link }, i) => {
                    return (
                      <motion.li
                        key={i}
                        onClick={handleCloseMobileMenu}
                        variants={{
                          hidden: { opacity: 0, y: 8, scale: 0.98 },
                          visible: { opacity: 1, y: 0, scale: 1 },
                        }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <CMSLink
                          {...link}
                          appearance="link"
                          className="w-full justify-start rounded-2xl px-4 py-3 text-base font-medium text-white/95 hover:text-white hover:bg-white/20 dark:hover:bg-white/10 no-underline hover:no-underline transition-colors"
                        />
                      </motion.li>
                    )
                  })}
                  <motion.li
                    variants={{
                      hidden: { opacity: 0, y: 8, scale: 0.98 },
                      visible: { opacity: 1, y: 0, scale: 1 },
                    }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href="/search"
                      className="inline-flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-base font-medium text-white/95 hover:text-white hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                      onClick={handleCloseMobileMenu}
                    >
                      <SearchIcon className="h-4 w-4" />
                      Search
                    </Link>
                  </motion.li>
                </motion.ul>
              </motion.nav>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </header>
  )
}
