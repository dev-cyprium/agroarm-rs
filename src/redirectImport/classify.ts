import { serbianSlugify } from '@/utilities/serbianSlugify'

/**
 * Classification of a single old-site URL.
 *
 * The old WordPress site (agroarm.rs) exposes URLs through two sitemaps:
 *   - the live Yoast index (page-sitemap.xml + envira-sitemap.xml)
 *   - a stale legacy sitemap.xml that still lists the PDF documents
 *
 * We don't try to hard-code every old category here. Instead we extract the
 * meaningful "leaf" slug and hand it to the matcher, which searches the new
 * collections (products / plans / categories / pages) for the best target.
 * Classification only needs to (a) skip noise and (b) give the matcher a hint
 * about which content type the old URL most likely represented.
 */

export type OldUrlType =
  | 'content' // a real page we should try to map to new content
  | 'pdf' // a PDF document (needs manual handling — re-upload to Media)
  | 'gallery' // Envira gallery junk (?post_type=envira&p=…)
  | 'home' // the old homepage — maps to '/', no redirect needed
  | 'notFound' // the old /404-2/ helper page — ignore

/** Old top-level segments that denote a product family (vs. an editorial page). */
export const PRODUCT_PREFIXES = new Set([
  'herbicidi',
  'fungicidi',
  'insekticidi',
  'akaricidi',
  'biopesticidi',
  'okvasivaci',
  'seminis',
  'fertiline',
  'safagrow',
  'kwizda-agro',
])

/** Old segment that denotes a crop-protection plan. */
export const PLAN_PREFIX = 'planovi_zastite_biljaka'

export interface ClassifiedUrl {
  /** The original `<loc>` value, verbatim — becomes the redirect `from`. */
  from: string
  /** Path only, lowercased, no leading/trailing slash (e.g. "herbicidi/bingo"). */
  path: string
  type: OldUrlType
  /** Normalised last path segment, our primary matching key (e.g. "bingo"). */
  leafSlug: string
  /** The old top-level segment, if any (e.g. "herbicidi"). Hints the target kind. */
  prefix: string | null
  /** Best guess at which new route family this belongs to. */
  hint: 'product' | 'plan' | 'category' | 'page' | 'none'
}

/**
 * Turn a full old URL into a normalised, path-only string.
 * Keeps the query string out (except we detect envira via it upstream).
 */
function toPath(rawUrl: string): { path: string; search: string } {
  let rest = rawUrl.trim()
  // strip scheme + host
  rest = rest.replace(/^https?:\/\/[^/]+/i, '')
  const [pathPart, searchPart = ''] = rest.split('?')
  const path = pathPart.replace(/^\/+/, '').replace(/\/+$/, '').toLowerCase()
  return { path, search: searchPart.toLowerCase() }
}

export function classifyUrl(rawUrl: string): ClassifiedUrl {
  const { path, search } = toPath(rawUrl)
  const segments = path ? path.split('/') : []
  const leafRaw = segments[segments.length - 1] ?? ''
  const leafSlug = serbianSlugify({ valueToSlugify: leafRaw.replace(/_/g, '-') }) ?? leafRaw

  const base = (): Omit<ClassifiedUrl, 'type' | 'hint'> => ({
    from: rawUrl.trim(),
    path,
    leafSlug,
    prefix: segments[0] ?? null,
  })

  // --- noise / special cases -------------------------------------------------
  if (search.includes('post_type=envira')) {
    return { ...base(), type: 'gallery', hint: 'none' }
  }
  if (path.endsWith('.pdf')) {
    return { ...base(), type: 'pdf', hint: 'none' }
  }
  if (path === '') {
    return { ...base(), type: 'home', hint: 'none' }
  }
  if (path === '404-2') {
    return { ...base(), type: 'notFound', hint: 'none' }
  }

  // --- real content ----------------------------------------------------------
  const prefix = segments[0]
  let hint: ClassifiedUrl['hint'] = 'page'

  if (prefix === PLAN_PREFIX) {
    hint = 'plan'
  } else if (PRODUCT_PREFIXES.has(prefix)) {
    // A bare family root (e.g. "herbicidi", "seminis/paprika") is a listing →
    // maps to a category; a deeper leaf is an individual product.
    hint = segments.length === 1 ? 'category' : 'product'
  }

  return { ...base(), type: 'content', hint }
}
