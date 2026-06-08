import type { Metadata } from 'next'

import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { CatalogClient } from '../CatalogClient'
import { loadCatalog } from '../getCatalog'
import { fetchAllCategories, buildCategoryMaps, resolveScope } from '@/utilities/categoryTree'

type Args = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'categories',
    limit: 1000,
    overrideAccess: false,
    select: { slug: true },
  })

  return categories.docs.filter((cat) => cat.slug).map((cat) => ({ slug: cat.slug }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const maps = buildCategoryMaps(await fetchAllCategories(payload))
  const { scope } = resolveScope(decodeURIComponent(slug), maps)

  return {
    title: scope ? `${scope.title} - Proizvodi` : 'Proizvodi',
    description: scope ? `Svi proizvodi u kategoriji ${scope.title}` : undefined,
  }
}

export default async function CategoryPage({ params }: Args) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const maps = buildCategoryMaps(await fetchAllCategories(payload))
  const { scope, matched, isSubcategory } = resolveScope(decodeURIComponent(slug), maps)

  if (!scope || !matched) notFound()

  // Subcategory slug → canonical top-level catalog with the facet pre-applied.
  if (isSubcategory) {
    redirect(`/kategorije/${scope.slug}?sub=${encodeURIComponent(matched.slug)}`)
  }

  const data = await loadCatalog(scope, maps)

  return (
    <Suspense fallback={null}>
      <CatalogClient {...data} />
    </Suspense>
  )
}
