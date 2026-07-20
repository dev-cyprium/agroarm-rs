/**
 * Server-side crawler for the OLD site's sitemaps. Runs inside the Payload
 * admin endpoint, so it's the server fetching public XML — never the browser.
 *
 * The old agroarm.rs (WordPress) exposes URLs through two places:
 *   - the live Yoast index `sitemap_index.xml`
 *       → `page-sitemap.xml`   (all real pages)
 *       → `envira-sitemap.xml` (image-gallery junk)
 *   - a stale `sitemap.xml` (2019) that still lists the PDF documents
 *
 * We walk the index, fall back to the legacy file, and return a deduped list of
 * raw `<loc>` URLs. Classification/matching happens downstream.
 */

const LOC_RE = /<loc>\s*([^<\s]+)\s*<\/loc>/gi

/** Default origin of the OLD site. Overridable so it still works post-cutover. */
export const DEFAULT_OLD_ORIGIN = process.env.OLD_SITE_ORIGIN || 'https://agroarm.rs'

/** Candidate entry points, tried in order; all reachable ones are merged. */
function entryPoints(origin: string): string[] {
  const base = origin.replace(/\/+$/, '')
  return [`${base}/sitemap_index.xml`, `${base}/sitemap.xml`]
}

function extractLocs(xml: string): string[] {
  const out: string[] = []
  let m: RegExpExecArray | null
  LOC_RE.lastIndex = 0
  while ((m = LOC_RE.exec(xml)) !== null) {
    out.push(m[1].trim())
  }
  return out
}

function looksLikeSitemapIndex(xml: string): boolean {
  return /<sitemapindex[\s>]/i.test(xml)
}

// A browser-like UA — some WordPress/WAF setups return 403 to unknown agents,
// which would silently drop an entire sitemap (and all its URLs) from the crawl.
const CRAWL_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

async function fetchText(url: string): Promise<{ text: string } | { error: string }> {
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': CRAWL_UA, accept: 'application/xml,text/xml,*/*' },
      redirect: 'follow',
    })
    if (!res.ok) return { error: `HTTP ${res.status}` }
    return { text: await res.text() }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

export interface SitemapRead {
  url: string
  /** True for a sitemap index (its `count` is child sitemaps, not page URLs). */
  isIndex: boolean
  /** Number of <loc> entries found in this file. */
  count: number
}

export interface CrawlResult {
  /** Deduped raw URLs discovered across all sitemaps. */
  urls: string[]
  /** Every sitemap successfully read, with its URL count (for UI transparency). */
  sitemaps: SitemapRead[]
  /** Non-fatal problems (unreachable sitemaps, etc.). */
  warnings: string[]
}

/**
 * Discover every old URL reachable from `origin`'s sitemaps.
 * Resolves child sitemaps one level deep (sufficient for this site).
 */
export async function crawlOldSitemaps(
  origin: string = DEFAULT_OLD_ORIGIN,
): Promise<CrawlResult> {
  const seenUrls = new Set<string>()
  const readSitemaps: SitemapRead[] = []
  const warnings: string[] = []
  const visited = new Set<string>()

  const ingest = async (sitemapUrl: string, depth: number) => {
    if (visited.has(sitemapUrl)) return
    visited.add(sitemapUrl)

    const result = await fetchText(sitemapUrl)
    if ('error' in result) {
      warnings.push(`Nedostupan sitemap (${result.error}): ${sitemapUrl}`)
      return
    }

    const locs = extractLocs(result.text)
    const isIndex = looksLikeSitemapIndex(result.text) && depth < 2
    readSitemaps.push({ url: sitemapUrl, isIndex, count: locs.length })

    if (isIndex) {
      // children are themselves sitemaps
      for (const child of locs) await ingest(child, depth + 1)
      return
    }
    for (const u of locs) seenUrls.add(u)
  }

  for (const entry of entryPoints(origin)) {
    await ingest(entry, 0)
  }

  return { urls: [...seenUrls], sitemaps: readSitemaps, warnings }
}
