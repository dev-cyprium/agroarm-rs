import type { Category } from '@/payload-types'
import type { Payload } from 'payload'

/**
 * Helpers for working with the nested-docs category hierarchy (top-level
 * categories like "Zaštita bilja" / "Ishrana bilja" → subcategories). The
 * catalog pages use these to resolve a slug to its top-level scope and to
 * collect every descendant category id for the scoped product query.
 */

export type CategoryMaps = {
  byId: Map<number, Category>
  /** parent id → direct children, each list sorted by `order`. */
  childrenByParent: Map<number, Category[]>
  /** top-level categories (no parent), sorted by `order`. */
  topLevel: Category[]
}

const parentIdOf = (c: Category): number | null => {
  if (c.parent == null) return null
  return typeof c.parent === 'object' ? c.parent.id : c.parent
}

const byOrder = (a: Category, b: Category) =>
  (a.order ?? 0) - (b.order ?? 0) || a.title.localeCompare(b.title, 'sr')

/** Fetch every category in one query (shallow — we only need id/parent/slug/title/order). */
export async function fetchAllCategories(payload: Payload): Promise<Category[]> {
  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 1000,
    pagination: false,
    sort: 'order',
    overrideAccess: false,
  })
  return result.docs
}

export function buildCategoryMaps(categories: Category[]): CategoryMaps {
  const byId = new Map<number, Category>()
  for (const c of categories) byId.set(c.id, c)

  const childrenByParent = new Map<number, Category[]>()
  const topLevel: Category[] = []
  for (const c of categories) {
    const pid = parentIdOf(c)
    if (pid == null) {
      topLevel.push(c)
    } else {
      const arr = childrenByParent.get(pid) ?? []
      arr.push(c)
      childrenByParent.set(pid, arr)
    }
  }

  topLevel.sort(byOrder)
  for (const arr of childrenByParent.values()) arr.sort(byOrder)

  return { byId, childrenByParent, topLevel }
}

/** Self + all transitive descendant ids (DFS). Includes `rootId`. */
export function collectDescendantIds(
  rootId: number,
  childrenByParent: Map<number, Category[]>,
): number[] {
  const ids: number[] = [rootId]
  const stack: number[] = [rootId]
  while (stack.length) {
    const id = stack.pop() as number
    const children = childrenByParent.get(id)
    if (!children) continue
    for (const child of children) {
      ids.push(child.id)
      stack.push(child.id)
    }
  }
  return ids
}

/** Climb `parent` links to the top-level ancestor. Guards against cycles. */
export function findTopLevelAncestor(category: Category, byId: Map<number, Category>): Category {
  let current = category
  const seen = new Set<number>()
  while (true) {
    const pid = parentIdOf(current)
    if (pid == null || seen.has(current.id)) return current
    seen.add(current.id)
    const parent = byId.get(pid)
    if (!parent) return current
    current = parent
  }
}

export type ScopeResolution = {
  /** The top-level category this slug belongs to (the catalog scope). */
  scope: Category | null
  /** The category the slug actually pointed at (may be a subcategory). */
  matched: Category | null
  /** True when `matched` is a subcategory of `scope` (slug should redirect). */
  isSubcategory: boolean
  /** Direct subcategories of `scope` (the "Kategorija" facet options). */
  subcategories: Category[]
}

export function resolveScope(slug: string, maps: CategoryMaps): ScopeResolution {
  let matched: Category | null = null
  for (const c of maps.byId.values()) {
    if (c.slug === slug) {
      matched = c
      break
    }
  }
  if (!matched) return { scope: null, matched: null, isSubcategory: false, subcategories: [] }

  const scope = findTopLevelAncestor(matched, maps.byId)
  return {
    scope,
    matched,
    isSubcategory: matched.id !== scope.id,
    subcategories: maps.childrenByParent.get(scope.id) ?? [],
  }
}
