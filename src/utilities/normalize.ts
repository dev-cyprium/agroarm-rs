import { charMap } from '@/utilities/serbianSlugify'

/**
 * Normalize text for fuzzy search matching:
 * - strips Serbian diacritics (č→c, š→s …) so "psenica" matches "pšenica"
 * - lowercases
 * - collapses whitespace
 *
 * Unlike serbianSlugify this keeps spaces (so multi-word matching works) and
 * does not strip non-word characters.
 */
export function normalize(input?: string | null): string {
  if (typeof input !== 'string') return ''

  return input
    .split('')
    .map((ch) => charMap[ch] || ch)
    .join('')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Build a normalized, space-joined keyword blob from any number of parts.
 * Falsy parts are dropped. Order parts by search priority (most important first).
 */
export function buildKeywords(...parts: (string | null | undefined)[]): string {
  return parts
    .map(normalize)
    .filter(Boolean)
    .join(' ')
}
