import type { Category, Product } from '@/payload-types'

/**
 * Server-side facet builders shared by the catalog index (`/kategorije`) and
 * the scoped catalog (`/kategorije/[slug]`). Both derive their facets from the
 * already-fetched product set, so counts are computed in-memory (no extra
 * queries).
 */

export type CultureOption = { id: number; title: string }
export type CultureFilterGroup = {
  group: { id: number; title: string }
  cultures: CultureOption[]
}
export type SubcategoryFacetOption = {
  id: number
  slug: string
  title: string
  count: number
}

const objectsOnly = <T>(arr: (number | T)[] | null | undefined): T[] =>
  (arr ?? []).filter((v): v is Exclude<typeof v, number> => typeof v === 'object') as T[]

/**
 * Build the "Kultura" facet from a product set: cultures grouped by their
 * culture group, plus any cultures without a group. (Lifted from the previous
 * inline logic in `[slug]/page.tsx`.)
 */
export function buildCultureFacets(products: Product[]): {
  cultureFilterGroups: CultureFilterGroup[]
  ungroupedCultures: CultureOption[]
} {
  const groupsMap = new Map<
    number,
    { group: { id: number; title: string }; cultures: Map<number, CultureOption> }
  >()
  const ungroupedMap = new Map<number, CultureOption>()

  for (const product of products) {
    const productCultures = objectsOnly<{ id: number; title: string }>(product.culture)
    const cultureGroups = objectsOnly<{ id: number; title: string }>(product.cultureGroup)

    for (const culture of productCultures) {
      if (cultureGroups.length > 0) {
        for (const cultureGroup of cultureGroups) {
          if (!groupsMap.has(cultureGroup.id)) {
            groupsMap.set(cultureGroup.id, {
              group: { id: cultureGroup.id, title: cultureGroup.title },
              cultures: new Map(),
            })
          }
          groupsMap
            .get(cultureGroup.id)!
            .cultures.set(culture.id, { id: culture.id, title: culture.title })
        }
      } else {
        ungroupedMap.set(culture.id, { id: culture.id, title: culture.title })
      }
    }
  }

  const cultureFilterGroups = Array.from(groupsMap.values())
    .map((entry) => ({
      group: entry.group,
      cultures: Array.from(entry.cultures.values()).sort((a, b) =>
        a.title.localeCompare(b.title, 'sr'),
      ),
    }))
    .sort((a, b) => a.group.title.localeCompare(b.group.title, 'sr'))

  const ungroupedCultures = Array.from(ungroupedMap.values()).sort((a, b) =>
    a.title.localeCompare(b.title, 'sr'),
  )

  return { cultureFilterGroups, ungroupedCultures }
}

/**
 * Build the "Kategorija" facet — the scope's subcategories with the number of
 * products in `products` directly attached to each. Zero-count subcategories
 * are kept so every category stays discoverable; selecting one renders the
 * catalog's empty state instead of silently hiding the category.
 */
export function buildSubcategoryFacet(
  subcategories: Category[],
  products: Product[],
): SubcategoryFacetOption[] {
  const counts = new Map<number, number>()
  const subIds = new Set(subcategories.map((s) => s.id))

  for (const product of products) {
    const cats = objectsOnly<{ id: number }>(product.categories)
    const seen = new Set<number>()
    for (const cat of cats) {
      if (subIds.has(cat.id) && !seen.has(cat.id)) {
        seen.add(cat.id)
        counts.set(cat.id, (counts.get(cat.id) ?? 0) + 1)
      }
    }
  }

  return subcategories.map((sub) => ({
    id: sub.id,
    slug: sub.slug,
    title: sub.title,
    count: counts.get(sub.id) ?? 0,
  }))
}
