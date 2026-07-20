import type { Metadata } from 'next'

import React from 'react'

import { ErrorLanding } from '@/components/ErrorLanding'

/**
 * Rendered via proxy rewrite for URLs recorded in the gone-urls collection —
 * the proxy sets the actual 410 status. Direct visits to /gone just see the
 * same page (noindex, so it never enters the index).
 */

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Stranica je uklonjena | AGROARM',
  robots: { index: false, follow: false },
}

export default function GonePage() {
  return (
    <ErrorLanding
      badge="410 — stranica uklonjena"
      title="Ova stranica više ne postoji"
      description="Sadržaj koji je bio ovde trajno je uklonjen sa sajta."
    />
  )
}
