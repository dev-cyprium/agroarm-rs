import type { Endpoint } from 'payload'
import { getCachedRedirectMap } from '@/utilities/getRedirectMap'

/**
 * GET /api/redirect-map — public, cached JSON of all 301 targets + 410 paths.
 * Read by the edge middleware so it can resolve redirects without DB access.
 * Lives under /api (excluded from the middleware matcher) so there's no loop.
 */
export const redirectMapEndpoint: Endpoint = {
  path: '/redirect-map',
  method: 'get',
  handler: async () => {
    try {
      const data = await getCachedRedirectMap()()
      return Response.json(data, {
        headers: { 'cache-control': 'public, s-maxage=300, stale-while-revalidate=600' },
      })
    } catch {
      // Fail open: an empty map means the middleware simply passes requests through.
      return Response.json({ redirects: {}, gone: [] })
    }
  },
}
