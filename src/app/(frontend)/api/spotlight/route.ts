import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

import type { Category, Culture, CultureGroup, Media, Product } from '@/payload-types'
import { buildKeywords, normalize } from '@/utilities/normalize'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cultureHasPlan } from '@/utilities/plans'
import { PLAN_CONFIG } from '@/utilities/plans'
import { SPOTLIGHT_TAG, type SpotlightRecord } from '@/components/Spotlight/types'

// Resolve a relationship field that may be an id or a populated object.
function relTitle(rel: unknown): string | undefined {
  if (rel && typeof rel === 'object' && 'title' in rel) {
    const t = (rel as { title?: unknown }).title
    return typeof t === 'string' ? t : undefined
  }
  return undefined
}

function relTitles(rels: unknown): string[] {
  if (!Array.isArray(rels)) return []
  return rels.map(relTitle).filter((t): t is string => Boolean(t))
}

function mediaUrl(rel: unknown): string | undefined {
  if (rel && typeof rel === 'object' && 'url' in rel) {
    const url = (rel as Media).url
    return url ? getMediaUrl(url) : undefined
  }
  return undefined
}

async function buildIndex(): Promise<SpotlightRecord[]> {
  const payload = await getPayload({ config: configPromise })

  const baseQuery = { overrideAccess: false, pagination: false as const, limit: 1000, depth: 1 }

  const [cultures, products, groups, categories] = await Promise.all([
    payload.find({ collection: 'cultures', ...baseQuery }),
    payload.find({ collection: 'products', ...baseQuery }),
    payload.find({ collection: 'culture-groups', ...baseQuery, depth: 0 }),
    payload.find({ collection: 'categories', ...baseQuery, depth: 0 }),
  ])

  const records: SpotlightRecord[] = []

  // ── Cultures ──
  for (const culture of cultures.docs as Culture[]) {
    if (!culture.slug) continue

    // Canonical URL: prefer a plan page that actually renders.
    let url: string | null = null
    if (cultureHasPlan(culture, 'protection')) {
      url = `${PLAN_CONFIG.protection.basePath}/${culture.slug}`
    } else if (cultureHasPlan(culture, 'nutrition')) {
      url = `${PLAN_CONFIG.nutrition.basePath}/${culture.slug}`
    }
    if (!url) continue // no public detail page → not linkable

    const groupTitle = relTitle(culture.cultureGroup)
    const aliases = (culture.keywordAliases ?? []).map((a) => a?.keyword).filter(Boolean) as string[]

    records.push({
      key: `culture:${culture.id}`,
      id: culture.id,
      type: 'culture',
      title: culture.title,
      subtitle: groupTitle,
      titleNormalized: normalize(culture.title),
      keywords: buildKeywords(culture.title, ...aliases, groupTitle),
      url,
      iconUrl: mediaUrl(culture.icon) || mediaUrl(culture.image),
    })
  }

  // ── Products ──
  for (const product of products.docs as Product[]) {
    if (!product.slug) continue

    const categoryTitles = relTitles(product.categories)
    const cultureTitles = relTitles(product.culture)
    const groupTitles = relTitles(product.cultureGroup)
    const activeMaterial = product.activeMaterial || undefined
    const isActiveSubstance = product.descriptorType === 'activeMaterial' && activeMaterial

    records.push({
      key: `product:${product.id}`,
      id: product.id,
      type: 'product',
      title: product.title,
      subtitle: isActiveSubstance ? activeMaterial : categoryTitles[0],
      titleNormalized: normalize(product.title),
      keywords: buildKeywords(
        product.title,
        activeMaterial,
        product.shortDescription,
        ...categoryTitles,
        ...cultureTitles,
        ...groupTitles,
      ),
      url: `/proizvodi/${product.slug}`,
      iconUrl: mediaUrl(product.image),
      cultures: cultureTitles,
    })
  }

  // ── Culture groups ──
  for (const group of groups.docs as CultureGroup[]) {
    if (!group.slug) continue
    records.push({
      key: `culture-group:${group.id}`,
      id: group.id,
      type: 'culture-group',
      title: group.title,
      subtitle: 'Grupa kultura',
      titleNormalized: normalize(group.title),
      keywords: buildKeywords(group.title, group.description),
      url: `${PLAN_CONFIG.protection.basePath}/${group.slug}`,
    })
  }

  // ── Categories ──
  for (const category of categories.docs as Category[]) {
    if (!category.slug) continue
    records.push({
      key: `category:${category.id}`,
      id: category.id,
      type: 'category',
      title: category.title,
      subtitle: 'Kategorija',
      titleNormalized: normalize(category.title),
      keywords: buildKeywords(category.title),
      url: `/kategorije/${category.slug}`,
    })
  }

  return records
}

export const getSpotlightIndex = unstable_cache(buildIndex, ['spotlight-index'], {
  tags: [SPOTLIGHT_TAG],
})

export async function GET() {
  try {
    const records = await getSpotlightIndex()
    return Response.json(records, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Failed to build spotlight index', error)
    return Response.json([], { status: 200 })
  }
}
