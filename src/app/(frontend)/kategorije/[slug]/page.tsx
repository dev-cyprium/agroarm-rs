import type { Metadata } from 'next'

import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { CategoryPageClient } from './CategoryPageClient'

import type { Category, Product, CultureGroup } from '@/payload-types'

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

  return categories.docs
    .filter((cat) => cat.slug)
    .map((cat) => ({ slug: cat.slug }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 1,
    where: { slug: { equals: slug } },
    overrideAccess: false,
  })

  const category = result.docs?.[0]

  return {
    title: category ? `${category.title} - Proizvodi` : 'Kategorija',
    description: category ? `Svi proizvodi u kategoriji ${category.title}` : undefined,
  }
}

export default async function CategoryPage({ params }: Args) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  // Get current category with parent populated
  const categoryResult = await payload.find({
    collection: 'categories',
    depth: 1,
    limit: 1,
    where: { slug: { equals: slug } },
    overrideAccess: false,
  })

  const category = categoryResult.docs?.[0]
  if (!category) notFound()

  // Check if this category has children (is a parent)
  const childrenResult = await payload.find({
    collection: 'categories',
    where: { parent: { equals: category.id } },
    sort: 'order',
    limit: 50,
    overrideAccess: false,
  })

  const children = childrenResult.docs

  if (children.length > 0) {
    // Parent category — show child categories, fetch product counts per child
    const childProductCounts = await Promise.all(
      children.map(async (child) => {
        const result = await payload.count({
          collection: 'products',
          where: { categories: { contains: child.id } },
          overrideAccess: false,
        })
        return { id: child.id, count: result.totalDocs }
      }),
    )

    const countsMap = Object.fromEntries(childProductCounts.map((c) => [c.id, c.count]))

    return (
      <CategoryPageClient
        mode="parent"
        category={category}
        children={children}
        childProductCounts={countsMap}
      />
    )
  }

  // Leaf category — show products with filters
  const parentId = typeof category.parent === 'object' ? category.parent?.id : category.parent

  const [siblingsResult, productsResult] = await Promise.all([
    parentId
      ? payload.find({
          collection: 'categories',
          where: { parent: { equals: parentId } },
          sort: 'order',
          limit: 50,
          overrideAccess: false,
        })
      : Promise.resolve(null),
    payload.find({
      collection: 'products',
      depth: 2,
      limit: 200,
      where: { categories: { contains: category.id } },
      overrideAccess: false,
    }),
  ])

  const siblings = siblingsResult?.docs ?? []
  const products = productsResult.docs ?? []

  // Build culture filter options grouped by culture group
  const groupsMap = new Map<number, { group: { id: number; title: string }; cultures: Map<number, { id: number; title: string }> }>()
  const ungroupedCultures = new Map<number, { id: number; title: string }>()

  for (const product of products) {
    const culture = typeof product.culture === 'object' ? product.culture : null
    const cultureGroup = typeof product.cultureGroup === 'object' ? product.cultureGroup : null

    if (cultureGroup && culture) {
      if (!groupsMap.has(cultureGroup.id)) {
        groupsMap.set(cultureGroup.id, {
          group: { id: cultureGroup.id, title: cultureGroup.title },
          cultures: new Map(),
        })
      }
      groupsMap.get(cultureGroup.id)!.cultures.set(culture.id, { id: culture.id, title: culture.title })
    } else if (culture) {
      ungroupedCultures.set(culture.id, { id: culture.id, title: culture.title })
    }
  }

  const cultureFilterGroups = Array.from(groupsMap.values())
    .map((entry) => ({
      group: entry.group,
      cultures: Array.from(entry.cultures.values()).sort((a, b) => a.title.localeCompare(b.title, 'sr')),
    }))
    .sort((a, b) => a.group.title.localeCompare(b.group.title, 'sr'))

  const ungrouped = Array.from(ungroupedCultures.values()).sort((a, b) =>
    a.title.localeCompare(b.title, 'sr'),
  )

  return (
    <CategoryPageClient
      mode="leaf"
      category={category}
      siblings={siblings}
      products={products}
      cultureFilterGroups={cultureFilterGroups}
      ungroupedCultures={ungrouped}
    />
  )
}
