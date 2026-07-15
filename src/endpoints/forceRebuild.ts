import type { Endpoint } from 'payload'

/**
 * POST /api/force-rebuild — triggers a full Vercel redeploy via a Deploy Hook.
 * Catch-all for when ISR revalidation isn't enough: a fresh build regenerates
 * every static page from scratch.
 *
 * Requires the VERCEL_DEPLOY_HOOK_URL env var (Vercel → Project → Settings →
 * Git → Deploy Hooks → Create Hook, then copy the URL).
 */
export const forceRebuildEndpoint: Endpoint = {
  path: '/force-rebuild',
  method: 'post',
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: 'Niste prijavljeni.' }, { status: 401 })
    }

    const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
    if (!hookUrl) {
      return Response.json(
        { error: 'VERCEL_DEPLOY_HOOK_URL nije podešen u environment varijablama.' },
        { status: 500 },
      )
    }

    try {
      const res = await fetch(hookUrl, { method: 'POST' })
      if (!res.ok) {
        return Response.json(
          { error: `Deploy hook je odbijen (status ${res.status}).` },
          { status: 502 },
        )
      }
      req.payload.logger.info(`Force rebuild triggered by user ${req.user.email ?? req.user.id}`)
      return Response.json({ ok: true })
    } catch (err) {
      req.payload.logger.error(`Force rebuild failed: ${String(err)}`)
      return Response.json({ error: 'Neuspešno pokretanje builda.' }, { status: 502 })
    }
  },
}
