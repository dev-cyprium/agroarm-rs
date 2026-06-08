import type { Metadata } from 'next/types'

import React from 'react'

import { getSpotlightIndex } from '../api/spotlight/route'
import { SearchPageClient } from '@/search/SearchPageClient'
import PageClient from './page.client'

export default async function Page() {
  let records: Awaited<ReturnType<typeof getSpotlightIndex>> = []
  try {
    records = await getSpotlightIndex()
  } catch (error) {
    console.warn('Failed to load search index during build/runtime.', error)
  }

  return (
    <div className="bg-[#F4F8F6] pt-24 pb-24">
      <PageClient />
      <div className="container">
        <h1 className="mb-8 text-center text-3xl font-semibold text-[#1F2A24]">Pretraga</h1>
        <SearchPageClient records={records} />
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Pretraga | AGROARM',
  }
}
