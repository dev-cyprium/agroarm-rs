import type { Metadata } from 'next'

import { Suspense } from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { CatalogClient } from './CatalogClient'
import { loadCatalog } from './getCatalog'
import { fetchAllCategories, buildCategoryMaps } from '@/utilities/categoryTree'

// Render at request time — this catalog reflects live CMS data and must not
// require a DB connection during the build.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Svi proizvodi - AGROARM',
  description: 'Pregledajte sve AGROARM proizvode za zaštitu i ishranu bilja.',
}

export default async function CatalogIndexPage() {
  const payload = await getPayload({ config: configPromise })
  const maps = buildCategoryMaps(await fetchAllCategories(payload))
  const data = await loadCatalog(null, maps)

  return (
    <Suspense fallback={null}>
      <CatalogClient {...data} />
    </Suspense>
  )
}
