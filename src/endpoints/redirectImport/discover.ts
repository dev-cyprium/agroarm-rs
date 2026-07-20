import type { Endpoint, PayloadRequest } from 'payload'
import { crawlOldSitemaps, DEFAULT_OLD_ORIGIN } from '@/redirectImport/sources'
import { classifyUrl } from '@/redirectImport/classify'
import { createMatcher, type Proposal } from '@/redirectImport/match'
import { normalizePath } from '@/utilities/collectionRoutes'
import { loadCandidates } from './loadCandidates'

async function readBody(req: PayloadRequest): Promise<Record<string, unknown>> {
  try {
    const json = (req as unknown as { json?: () => Promise<unknown> }).json
    if (typeof json === 'function') return ((await json.call(req)) as Record<string, unknown>) ?? {}
  } catch {
    /* no body */
  }
  return {}
}

/**
 * POST /api/redirect-import/discover
 * Crawls the old site's sitemaps, classifies every URL, loads the new content,
 * and returns a prefilled redirect proposal for each — plus a summary. Read-only:
 * it never writes. The admin UI renders the proposals for review, then calls
 * /commit with the ones to keep.
 */
export const discoverEndpoint: Endpoint = {
  path: '/redirect-import/discover',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Niste prijavljeni.' }, { status: 401 })
    }

    const body = await readBody(req)
    const origin = typeof body.origin === 'string' && body.origin.trim() ? body.origin.trim() : DEFAULT_OLD_ORIGIN

    // 1) crawl
    const crawl = await crawlOldSitemaps(origin)
    if (!crawl.urls.length) {
      return Response.json(
        {
          error: `Nijedan URL nije pronađen na ${origin}. Proverite da li je stari sajt dostupan i da postoji sitemap.`,
          crawl,
        },
        { status: 502 },
      )
    }

    // 2) load new-site candidates + existing redirects (to flag duplicates)
    const [{ docs, cultures }, existing] = await Promise.all([
      loadCandidates(req),
      req.payload.find({
        collection: 'redirects',
        depth: 0,
        limit: 0,
        pagination: false,
        select: { from: true },
        req,
      }),
    ])
    const existingFrom = new Set(
      existing.docs
        .map((d) => (d as { from?: string }).from)
        .filter((f): f is string => Boolean(f))
        .map(normalizePath),
    )

    // 3) classify + match — dedupe by normalised path ("/foo" and "/foo/" are
    // the same route; two rows would collide on the unique `from` field).
    const matcher = createMatcher({ docs, cultures })
    const seenPaths = new Set<string>()
    const proposals: Array<Proposal & { exists: boolean }> = []
    for (const url of crawl.urls) {
      const key = normalizePath(url)
      if (seenPaths.has(key)) continue
      seenPaths.add(key)
      const p = matcher.match(classifyUrl(url))
      proposals.push({ ...p, exists: existingFrom.has(key) })
    }

    // Non-content noise (homepage "/", old 404 helper, Envira gallery query URLs).
    // Returned but flagged so the UI can hide it by default behind a toggle.
    const isNoise = (p: Proposal) => p.kind === 'home' || p.kind === 'notFound' || p.kind === 'gallery'
    const real = proposals.filter((p) => !isNoise(p))

    // 4) summary (counts reflect real content routes; noise is reported separately)
    const summary = {
      total: real.length,
      autoMatched: real.filter((p) => p.status === 'auto-matched').length,
      needsReview: real.filter((p) => p.status === 'needs-review').length,
      noMatch: real.filter((p) => p.status === 'no-match').length,
      noise: proposals.length - real.length,
      alreadyExists: real.filter((p) => p.exists).length,
      candidates: { docs: docs.length, cultures: cultures.length },
    }

    return Response.json({ ok: true, origin, crawl, summary, proposals })
  },
}
