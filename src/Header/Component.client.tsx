'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header
      className="header-glass fixed top-0 left-0 right-0 z-50 isolate"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
        <div className="header-glass-surface relative flex items-center justify-between gap-6 px-5 py-3 md:px-6">
          <Link href="/" className="shrink-0">
          <Logo
            loading="eager"
            priority="high"
            src={pathname === '/' ? '/beli.svg' : undefined}
            className={pathname === '/' ? 'invert dark:invert-0' : undefined}
          />
          </Link>
          <HeaderNav data={data} />
        </div>
      </div>
    </header>
  )
}
