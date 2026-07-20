import type { Endpoint, PayloadRequest } from 'payload'
import type { Proposal } from '@/redirectImport/match'
import type { Redirect } from '@/payload-types'
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
 * POST /api/redirect-import/commit
 * Body: { items: Proposal[] }
 * Creates a redirect row per proposal, skipping any `from` that already exists.
 * `from` is stored as a normalised path (no origin, no trailing slash) so the
 * middleware map and route-level resolver compare apples to apples.
 * Rows without a resolvable target are SKIPPED — never redirected to a
 * placeholder (a redirect to an unrelated page is a soft-404 to Google).
 * Called in batches by the admin UI so it can show a progress bar.
 */
export const commitEndpoint: Endpoint = {
  path: '/redirect-import/commit',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Niste prijavljeni.' }, { status: 401 })
    }

    const body = await readBody(req)
    const items = Array.isArray(body.items) ? (body.items as Proposal[]) : []
    if (!items.length) {
      return Response.json({ error: 'Nema stavki za upis.' }, { status: 400 })
    }

    // Preload existing `from` values so commits are idempotent. Older rows may
    // hold full URLs, so query both raw and normalised forms and compare
    // normalised on our side.
    const froms = items.flatMap((i) => (i?.from ? [i.from, normalizePath(i.from)] : []))
    const existing =
      froms.length > 0
        ? await req.payload.find({
            collection: 'redirects',
            depth: 0,
            limit: 0,
            pagination: false,
            where: { from: { in: froms } },
            select: { from: true },
            req,
          })
        : { docs: [] as { from?: string }[] }
    const existingFrom = new Set(
      existing.docs
        .map((d) => (d as { from?: string }).from)
        .filter((f): f is string => Boolean(f))
        .map(normalizePath),
    )

    let created = 0
    let skipped = 0
    const errors: Array<{ from: string; error: string }> = []

    for (const item of items) {
      const from = item?.from ? normalizePath(item.from) : ''
      if (!from || from === '/' || item.kind === 'home' || item.kind === 'notFound') {
        skipped++
        continue
      }
      if (existingFrom.has(from)) {
        skipped++
        continue
      }

      // Build the `to` group. IDs are numeric in Postgres; the cast reconciles
      // our generic reference shape with Payload's discriminated union.
      let to: Redirect['to']
      if (item.toType === 'reference' && item.reference) {
        to = { type: 'reference', reference: item.reference } as Redirect['to']
      } else if (item.toType === 'custom' && item.url) {
        to = { type: 'custom', url: item.url } as Redirect['to']
      } else {
        // No target → leave the old URL to 404; do NOT invent a redirect.
        skipped++
        continue
      }

      try {
        await req.payload.create({
          collection: 'redirects',
          req,
          data: {
            from,
            to,
            importStatus: item.status,
            importConfidence: item.confidence ?? 0,
            importNote: item.note ?? '',
            importSuggestions: item.suggestions ?? [],
          },
        })
        existingFrom.add(from)
        created++
      } catch (err) {
        errors.push({ from, error: err instanceof Error ? err.message : String(err) })
      }
    }

    return Response.json({ ok: true, created, skipped, errors })
  },
}
