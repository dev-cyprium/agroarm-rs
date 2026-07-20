/**
 * Single source of truth mapping a Payload collection slug to the URL prefix of
 * its public (frontend) route. Used by the redirect resolver and the redirect
 * importer so a document reference always resolves to the SAME url the router
 * actually serves.
 *
 * Note: `cultures` is intentionally absent — a culture is served at BOTH
 * `/planovi-zastite/{slug}` and `/planovi-ishrane/{slug}`, so it can't be
 * resolved from the collection alone. Plan redirects use an explicit custom URL.
 */
export const COLLECTION_ROUTE_PREFIX = {
  pages: '',
  posts: '/posts',
  products: '/proizvodi',
  categories: '/kategorije',
} as const

export type RoutedCollection = keyof typeof COLLECTION_ROUTE_PREFIX

export function isRoutedCollection(collection?: string | null): collection is RoutedCollection {
  return !!collection && collection in COLLECTION_ROUTE_PREFIX
}

/** Build the public path for a routed collection document. */
export function docUrl(collection: string | null | undefined, slug?: string | null): string {
  if (!slug || !isRoutedCollection(collection)) return ''
  return `${COLLECTION_ROUTE_PREFIX[collection]}/${slug}`
}

/**
 * Normalise any URL or path to a comparable pathname: strip scheme+host, query
 * and hash, force a leading slash, and drop the trailing slash (except root).
 * Pure — safe to import in edge middleware. Used on both sides of redirect/gone
 * lookups so "https://old/foo/" and "/foo" compare equal.
 */
export function normalizePath(input: string): string {
  let p = (input || '').trim().replace(/^https?:\/\/[^/]+/i, '')
  p = p.split('?')[0].split('#')[0]
  if (!p.startsWith('/')) p = `/${p}`
  if (p.length > 1) p = p.replace(/\/+$/, '')
  return p
}
