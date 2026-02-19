import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  let footerData: Footer = { navItems: [] } as unknown as Footer

  try {
    footerData = await getCachedGlobal('footer', 1)()
  } catch (error) {
    console.warn('Failed to load footer global from Payload.', error)
  }

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          <Logo />
        </Link>

        <nav className="flex flex-col md:flex-row gap-4 md:items-center">
          {navItems.map(({ link }, i) => {
            return <CMSLink className="text-white" key={i} {...link} />
          })}
        </nav>
      </div>
    </footer>
  )
}
