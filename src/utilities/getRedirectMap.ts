import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'
import { docUrl, normalizePath } from './collectionRoutes'

/**
 * Flat, edge-friendly view of all redirects + gone URLs, consumed by the
 * middleware. References are resolved to their final public path here (server
 * side, with DB access) so the middleware only does string lookups.
 */
export interface RedirectMap {
  /** normalised fromPath -> target path (301). */
  redirects: Record<string, string>
  /** normalised paths that should return 410. */
  gone: string[]
}

async function buildRedirectMap(): Promise<RedirectMap> {
  const payload = await getPayload({ config: configPromise })

  const [redirectsRes, goneRes] = await Promise.all([
    payload
      .find({ collection: 'redirects', depth: 1, limit: 0, pagination: false })
      .catch(() => ({ docs: [] as Array<Record<string, unknown>> })),
    payload
      .find({ collection: 'gone-urls', depth: 0, limit: 0, pagination: false })
      .catch(() => ({ docs: [] as Array<Record<string, unknown>> })),
  ])

  const redirects: Record<string, string> = {}
  for (const row of redirectsRes.docs as Array<Record<string, unknown>>) {
    const from = row.from as string | undefined
    if (!from) continue

    const to = row.to as
      | { url?: string; reference?: { relationTo?: string; value?: unknown } }
      | undefined

    let target = ''
    if (to?.url) {
      target = to.url
    } else if (to?.reference?.value) {
      const val = to.reference.value
      const slug = typeof val === 'object' && val ? (val as { slug?: string }).slug : undefined
      target = docUrl(to.reference.relationTo, slug)
    }
    if (!target) continue

    const fromPath = normalizePath(from)
    const toPath = target.startsWith('/') ? target : `/${target}`
    if (fromPath !== toPath) redirects[fromPath] = toPath
  }

  const gone = (goneRes.docs as Array<Record<string, unknown>>)
    .map((d) => d.path as string | undefined)
    .filter((p): p is string => Boolean(p))
    .map(normalizePath)

  return { redirects, gone }
}

/** Cached map, revalidated whenever redirects or gone-urls change. */
export const getCachedRedirectMap = () =>
  unstable_cache(async () => buildRedirectMap(), ['redirect-map'], {
    tags: ['redirects', 'gone-urls'],
  })
