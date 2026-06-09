import type { Metadata } from 'next/types'

import React, { Suspense } from 'react'

import { getSpotlightIndex } from '../api/spotlight/route'
import { SearchPageClient } from '@/search/SearchPageClient'
import PageClient from './page.client'

// Query-driven page that reads the live search index — render at request time
// (also keeps the build free of any DB dependency).
export const dynamic = 'force-dynamic'

export default async function Page() {
  let records: Awaited<ReturnType<typeof getSpotlightIndex>> = []
  try {
    records = await getSpotlightIndex()
  } catch (error) {
    console.warn('Failed to load search index during build/runtime.', error)
  }

  return (
    <div className="bg-surface pt-24 pb-24">
      <PageClient />
      <div className="container">
        <h1 className="mb-8 text-center text-3xl font-semibold text-ink">Pretraga</h1>
        <Suspense fallback={null}>
          <SearchPageClient records={records} />
        </Suspense>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Pretraga | AGROARM',
  }
}
