import type { Endpoint, PayloadRequest } from 'payload'
import { normalizePath } from '@/utilities/collectionRoutes'

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
 * POST /api/redirect-import/commit-gone
 * Body: { items: { from: string; note?: string }[] }
 * Records each path in the gone-urls collection (410). Idempotent — skips paths
 * already present. Called in batches by the importer for rows marked "410".
 */
export const commitGoneEndpoint: Endpoint = {
  path: '/redirect-import/commit-gone',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Niste prijavljeni.' }, { status: 401 })
    }

    const body = await readBody(req)
    const items = Array.isArray(body.items) ? (body.items as Array<{ from?: string; note?: string }>) : []
    if (!items.length) {
      return Response.json({ error: 'Nema stavki za upis.' }, { status: 400 })
    }

    const paths = items
      .map((i) => (i?.from ? normalizePath(i.from) : ''))
      .filter(Boolean)

    const existing =
      paths.length > 0
        ? await req.payload.find({
            collection: 'gone-urls',
            depth: 0,
            limit: 0,
            pagination: false,
            where: { path: { in: paths } },
            select: { path: true },
            req,
          })
        : { docs: [] as Array<{ path?: string }> }
    const existingPaths = new Set(
      existing.docs.map((d) => (d as { path?: string }).path).filter(Boolean) as string[],
    )

    let created = 0
    let skipped = 0
    const errors: Array<{ path: string; error: string }> = []

    for (const item of items) {
      const path = item?.from ? normalizePath(item.from) : ''
      if (!path || existingPaths.has(path)) {
        skipped++
        continue
      }
      try {
        await req.payload.create({
          collection: 'gone-urls',
          req,
          data: { path, note: item.note ?? 'Uklonjeno kroz uvoznik.' },
        })
        existingPaths.add(path)
        created++
      } catch (err) {
        errors.push({ path, error: err instanceof Error ? err.message : String(err) })
      }
    }

    return Response.json({ ok: true, created, skipped, errors })
  },
}
