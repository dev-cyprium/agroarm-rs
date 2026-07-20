import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

import type { Culture } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { cultureHasPlan } from '@/utilities/plans'

// Generated at request time — must not require a DB connection during the build.
export const dynamic = 'force-dynamic'

// Protection-plan URLs: the index, culture-group archives, and every culture
// that actually has a protection plan. Nutrition plans are intentionally
// excluded while that section shows the coming-soon page.
const getPlansSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL = getServerSideURL()
    const dateFallback = new Date().toISOString()

    const [groups, cultures] = await Promise.all([
      payload.find({
        collection: 'culture-groups',
        overrideAccess: false,
        depth: 0,
        limit: 100,
        pagination: false,
        select: { slug: true, updatedAt: true },
      }),
      payload.find({
        collection: 'cultures',
        overrideAccess: false,
        depth: 0,
        limit: 1000,
        pagination: false,
      }),
    ])

    return [
      { loc: `${SITE_URL}/planovi-zastite`, lastmod: dateFallback },
      ...(groups.docs ?? [])
        .filter((g) => Boolean(g?.slug))
        .map((g) => ({
          loc: `${SITE_URL}/planovi-zastite/${g.slug}`,
          lastmod: g.updatedAt || dateFallback,
        })),
      ...(cultures.docs ?? [])
        .filter((c) => Boolean(c?.slug) && cultureHasPlan(c as Culture, 'protection'))
        .map((c) => ({
          loc: `${SITE_URL}/planovi-zastite/${c.slug}`,
          lastmod: c.updatedAt || dateFallback,
        })),
    ]
  },
  ['plans-sitemap'],
  { tags: ['plans-sitemap'] },
)

export async function GET() {
  return getServerSideSitemap(await getPlansSitemap())
}
