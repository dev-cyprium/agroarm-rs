import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

import { getServerSideURL } from '@/utilities/getURL'
import { fetchAllCategories, buildCategoryMaps } from '@/utilities/categoryTree'

// Generated at request time — must not require a DB connection during the build.
export const dynamic = 'force-dynamic'

// Catalog URLs: the index, top-level category scopes, and every product page.
const getProductsSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL = getServerSideURL()
    const dateFallback = new Date().toISOString()

    const [products, categories] = await Promise.all([
      payload.find({
        collection: 'products',
        overrideAccess: false,
        depth: 0,
        limit: 1000,
        pagination: false,
        select: { slug: true, updatedAt: true },
      }),
      fetchAllCategories(payload),
    ])

    const maps = buildCategoryMaps(categories)

    return [
      { loc: `${SITE_URL}/kategorije`, lastmod: dateFallback },
      ...maps.topLevel
        .filter((c) => Boolean(c.slug))
        .map((c) => ({
          loc: `${SITE_URL}/kategorije/${c.slug}`,
          lastmod: c.updatedAt || dateFallback,
        })),
      ...(products.docs ?? [])
        .filter((p) => Boolean(p?.slug))
        .map((p) => ({
          loc: `${SITE_URL}/proizvodi/${p.slug}`,
          lastmod: p.updatedAt || dateFallback,
        })),
    ]
  },
  ['products-sitemap'],
  { tags: ['products-sitemap'] },
)

export async function GET() {
  return getServerSideSitemap(await getProductsSitemap())
}
