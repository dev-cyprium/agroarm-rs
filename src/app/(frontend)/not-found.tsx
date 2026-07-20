import type { Metadata } from 'next'

import React from 'react'

import { ErrorLanding } from '@/components/ErrorLanding'

export const metadata: Metadata = {
  title: 'Stranica nije pronađena | AGROARM',
}

export default function NotFound() {
  return (
    <ErrorLanding
      badge="404 — stranica nije pronađena"
      title="Ova stranica ne postoji"
      description="Stranica koju tražite je možda premeštena, preimenovana ili nikada nije postojala."
    />
  )
}
