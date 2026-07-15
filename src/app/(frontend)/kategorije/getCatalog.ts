import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { Category, Product } from '@/payload-types'
import { collectDescendantIds, type CategoryMaps } from '@/utilities/categoryTree'
import {
  buildCultureFacets,
  buildSubcategoryFacet,
  type CultureFilterGroup,
  type CultureOption,
  type SubcategoryFacetOption,
} from './catalogData'

export type CatalogData = {
  scope: { id: number; title: string; slug: string } | null
  topLevelCategories: { id: number; title: string; slug: string }[]
  subcategoryFacet: SubcategoryFacetOption[]
  cultureFilterGroups: CultureFilterGroup[]
  ungroupedCultures: CultureOption[]
  products: Product[]
}

/**
 * Assemble everything `CatalogClient` needs for a given scope. `scope = null`
 * means the all-products index (`/kategorije`); a scope category fetches all
 * products under it and its descendants (`categories: { in: [...] }`).
 */
export async function loadCatalog(scope: Category | null, maps: CategoryMaps): Promise<CatalogData> {
  const payload = await getPayload({ config: configPromise })

  const productsResult = await payload.find({
    collection: 'products',
    depth: 2,
    pagination: false,
    overrideAccess: false,
    ...(scope
      ? { where: { categories: { in: collectDescendantIds(scope.id, maps.childrenByParent) } } }
      : {}),
  })
  // Tagged products first (novo, then uskoro), then untagged; A–Z by title
  // within each group, with Serbian collation (č/ć/đ/š/ž) — the DB's default
  // sort (newest first) and its collation can't be trusted for Latin Serbian.
  const tagRank = (p: Product) => (p.productTag === 'novo' ? 0 : p.productTag === 'uskoro' ? 1 : 2)
  const products = [...productsResult.docs].sort(
    (a, b) => tagRank(a) - tagRank(b) || a.title.localeCompare(b.title, 'sr'),
  )

  const subcategories = scope ? (maps.childrenByParent.get(scope.id) ?? []) : []
  const { cultureFilterGroups, ungroupedCultures } = buildCultureFacets(products)

  return {
    scope: scope ? { id: scope.id, title: scope.title, slug: scope.slug } : null,
    topLevelCategories: maps.topLevel.map((c) => ({ id: c.id, title: c.title, slug: c.slug })),
    subcategoryFacet: buildSubcategoryFacet(subcategories, products),
    cultureFilterGroups,
    ungroupedCultures,
    products,
  }
}
