import { NextResponse, type NextRequest } from 'next/server'
import { normalizePath } from '@/utilities/collectionRoutes'

/**
 * Serves the SEO migration redirects that route-level resolution can't:
 *   - path recorded in gone-urls  → 410 Gone (permanent removal)
 *   - path recorded in redirects  → 301 to the resolved target
 *   - anything else               → passes through untouched
 *
 * The map is fetched from /api/redirect-map (cached server-side) and held in a
 * short-lived in-process cache to avoid a fetch per request. Everything here is
 * fail-open: any error just lets the request continue normally.
 */

interface RedirectMap {
  redirects: Record<string, string>
  gone: string[]
}

interface Processed {
  redirects: Record<string, string>
  gone: Set<string>
}

const TTL_MS = 60_000
let cached: { data: Processed; at: number } | null = null

async function loadMap(origin: string): Promise<Processed | null> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data
  try {
    const res = await fetch(`${origin}/api/redirect-map`, {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) return cached?.data ?? null
    const raw = (await res.json()) as RedirectMap
    const data: Processed = {
      redirects: raw.redirects || {},
      gone: new Set(raw.gone || []),
    }
    cached = { data, at: Date.now() }
    return data
  } catch {
    return cached?.data ?? null
  }
}

export async function middleware(req: NextRequest) {
  const pathname = normalizePath(req.nextUrl.pathname)
  const map = await loadMap(req.nextUrl.origin)
  if (!map) return NextResponse.next()

  if (map.gone.has(pathname)) {
    return new NextResponse('410 Gone', {
      status: 410,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  const target = map.redirects[pathname]
  if (target && target !== pathname) {
    return NextResponse.redirect(new URL(target, req.nextUrl.origin), 301)
  }

  return NextResponse.next()
}

export const config = {
  // Run on everything EXCEPT Payload admin/api, Next internals, and static files
  // — but DO include /wp-content/… (old WordPress uploads, e.g. PDFs): those
  // paths contain dots yet must be redirect/410-able like any other old URL.
  matcher: [
    '/((?!api|admin|_next/static|_next/image|favicon.ico|robots.txt|sitemap|.*\\..*).*)',
    '/wp-content/:path*',
  ],
}
