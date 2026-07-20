'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

/**
 * Nav entry (rendered via admin.components.afterNavLinks) that links to the
 * custom Redirect Importer view.
 */
const RedirectImporterNavLink: React.FC = () => {
  const pathname = usePathname()
  const href = '/admin/redirect-importer'
  const active = pathname === href

  return (
    <Link
      href={href}
      className="nav__link"
      style={{
        display: 'block',
        padding: '8px 0',
        fontWeight: active ? 700 : 500,
        color: active ? 'var(--theme-success-500, #007D41)' : undefined,
      }}
    >
      Uvoz preusmerenja
    </Link>
  )
}

export default RedirectImporterNavLink
