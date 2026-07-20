import Fuse from 'fuse.js'
import { serbianSlugify } from '@/utilities/serbianSlugify'
import { docUrl } from '@/utilities/collectionRoutes'
import type { ClassifiedUrl } from './classify'

/**
 * Fuzzy-matches classified old URLs against the new site's content and produces
 * redirect proposals with a confidence score and a review status. Pure and
 * deterministic — the endpoint loads the candidate docs from Payload and passes
 * them in, so this stays unit-testable without a database.
 */

export type ReferenceCollection = 'products' | 'categories' | 'pages' | 'posts'

/** A candidate the redirect can point at via a document reference. */
export interface DocCandidate {
  id: string | number
  title: string
  slug: string
  collection: ReferenceCollection
}

/** A culture — powers protection/nutrition plans (custom-URL targets). */
export interface CultureCandidate {
  id: string | number
  title: string
  slug: string
  aliases: string[]
}

export interface Suggestion {
  label: string
  url: string
  score: number
  relationTo?: ReferenceCollection
  value?: string | number
}

export type ProposalStatus =
  | 'auto-matched' // confident enough to prefill and leave alone
  | 'needs-review' // prefilled a best guess, but the client should confirm
  | 'no-match' // nothing plausible found — client must pick
  | 'skip' // home / 404 / gallery — no redirect worth creating

export interface Proposal {
  from: string
  path: string
  kind: ClassifiedUrl['type']
  hint: ClassifiedUrl['hint']
  status: ProposalStatus
  confidence: number
  note: string
  /** How to fill the redirect `to` group. */
  toType: 'reference' | 'custom' | 'none'
  reference?: { relationTo: ReferenceCollection; value: string | number }
  url?: string
  /** Human-friendly view of the chosen target (for the UI table). */
  targetLabel: string
  targetUrl: string
  suggestions: Suggestion[]
}

const AUTO_MIN = 88 // fuzzy score at/above this is trusted as auto-matched
const REVIEW_MIN = 45 // below this we don't prefill a guess at all

/** hint → the order in which we prefer candidate collections on a tie. */
const POOL_ORDER: Record<ClassifiedUrl['hint'], ReferenceCollection[]> = {
  product: ['products', 'categories', 'pages', 'posts'],
  category: ['categories', 'products', 'pages', 'posts'],
  page: ['pages', 'categories', 'products', 'posts'],
  plan: ['pages', 'categories', 'products', 'posts'],
  none: ['pages', 'products', 'categories', 'posts'],
}

const PLAN_LEAF_PREFIXES = ['plan-zastite-', 'plan-ishrane-', 'plan-']

export interface MatcherInput {
  docs: DocCandidate[]
  cultures: CultureCandidate[]
}

export interface Matcher {
  match: (c: ClassifiedUrl) => Proposal
}

/** Build a reusable matcher over the current new-site content. */
export function createMatcher({ docs, cultures }: MatcherInput): Matcher {
  // Exact-slug index (a slug can legitimately exist in >1 collection).
  const bySlug = new Map<string, DocCandidate[]>()
  for (const d of docs) {
    const key = serbianSlugify({ valueToSlugify: d.slug }) ?? d.slug
    const list = bySlug.get(key) ?? []
    list.push(d)
    bySlug.set(key, list)
  }

  const docFuse = new Fuse(docs, {
    includeScore: true,
    threshold: 0.5,
    ignoreLocation: true,
    keys: [
      { name: 'slug', weight: 0.7 },
      { name: 'title', weight: 0.3 },
    ],
  })

  const cultureFuse = new Fuse(cultures, {
    includeScore: true,
    threshold: 0.5,
    ignoreLocation: true,
    keys: [
      { name: 'slug', weight: 0.5 },
      { name: 'title', weight: 0.3 },
      { name: 'aliases', weight: 0.2 },
    ],
  })

  const poolRank = (hint: ClassifiedUrl['hint']) => {
    const order = POOL_ORDER[hint]
    return (c: ReferenceCollection) => {
      const i = order.indexOf(c)
      return i === -1 ? order.length : i
    }
  }

  const refProposal = (
    c: ClassifiedUrl,
    d: DocCandidate,
    confidence: number,
    status: ProposalStatus,
    suggestions: Suggestion[],
    note: string,
  ): Proposal => ({
    from: c.from,
    path: c.path,
    kind: c.type,
    hint: c.hint,
    status,
    confidence,
    note,
    toType: 'reference',
    reference: { relationTo: d.collection, value: d.id },
    targetLabel: `${d.title} (${d.collection})`,
    targetUrl: docUrl(d.collection, d.slug),
    suggestions,
  })

  const toSuggestion = (d: DocCandidate, score: number): Suggestion => ({
    label: `${d.title} (${d.collection})`,
    url: docUrl(d.collection, d.slug),
    score,
    relationTo: d.collection,
    value: d.id,
  })

  const matchContent = (c: ClassifiedUrl): Proposal => {
    const rank = poolRank(c.hint)

    // 1) exact slug hit — pick the best collection per the hint's preference.
    const exact = bySlug.get(c.leafSlug)
    if (exact && exact.length) {
      const best = [...exact].sort((a, b) => rank(a.collection) - rank(b.collection))[0]
      const ambiguous = exact.length > 1
      const suggestions = ambiguous ? exact.map((d) => toSuggestion(d, 100)) : []
      return refProposal(
        c,
        best,
        ambiguous ? 96 : 100,
        ambiguous ? 'needs-review' : 'auto-matched',
        suggestions,
        ambiguous
          ? `Slug "${c.leafSlug}" postoji u više kolekcija — potvrdite tačnu.`
          : 'Tačno poklapanje sluga.',
      )
    }

    // 2) fuzzy over all docs.
    const results = docFuse.search(c.leafSlug, { limit: 5 })
    if (!results.length) {
      return {
        from: c.from,
        path: c.path,
        kind: c.type,
        hint: c.hint,
        status: 'no-match',
        confidence: 0,
        note: 'Nema poklapanja — unesite cilj u polje „Cilj“ ili uklonite rutu.',
        toType: 'none',
        targetLabel: '',
        targetUrl: '',
        suggestions: [],
      }
    }

    const scored = results
      .map((r) => ({ d: r.item, score: Math.round((1 - (r.score ?? 1)) * 100) }))
      // stable tie-break by hint preference
      .sort((a, b) => b.score - a.score || rank(a.d.collection) - rank(b.d.collection))

    const top = scored[0]
    const suggestions = scored.slice(0, 3).map((s) => toSuggestion(s.d, s.score))

    if (top.score < REVIEW_MIN) {
      return {
        from: c.from,
        path: c.path,
        kind: c.type,
        hint: c.hint,
        status: 'no-match',
        confidence: top.score,
        note: 'Slabo poklapanje — proverite predloge, unesite cilj u polje „Cilj“ ili uklonite rutu.',
        toType: 'none',
        targetLabel: '',
        targetUrl: '',
        suggestions,
      }
    }

    return refProposal(
      c,
      top.d,
      top.score,
      top.score >= AUTO_MIN ? 'auto-matched' : 'needs-review',
      suggestions,
      top.score >= AUTO_MIN ? 'Pouzdano približno poklapanje.' : 'Najbolja pretpostavka — proverite.',
    )
  }

  const matchPlan = (c: ClassifiedUrl): Proposal => {
    // Plan listing root → the plans index.
    if (c.hint === 'plan' && (c.path === 'planovi_zastite_biljaka' || c.leafSlug.startsWith('planovi'))) {
      return {
        from: c.from,
        path: c.path,
        kind: c.type,
        hint: c.hint,
        status: 'auto-matched',
        confidence: 90,
        note: 'Lista planova zaštite.',
        toType: 'custom',
        url: '/planovi-zastite',
        targetLabel: 'Planovi zaštite (lista)',
        targetUrl: '/planovi-zastite',
        suggestions: [],
      }
    }

    // Strip the plan- prefix to get the crop token, then match a culture.
    let crop = c.leafSlug
    for (const p of PLAN_LEAF_PREFIXES) {
      if (crop.startsWith(p)) {
        crop = crop.slice(p.length)
        break
      }
    }

    const norm = (v: string) => serbianSlugify({ valueToSlugify: v }) ?? v
    const cultureBySlug = cultures.find(
      (cu) => norm(cu.slug) === crop || cu.aliases.some((a) => norm(a) === crop),
    )
    const chosen =
      cultureBySlug ??
      cultureFuse.search(crop, { limit: 1 }).map((r) => r.item)[0]

    if (!chosen) {
      return {
        from: c.from,
        path: c.path,
        kind: c.type,
        hint: c.hint,
        status: 'no-match',
        confidence: 0,
        note: `Nije pronađena kultura za "${crop}" — unesite cilj u polje „Cilj“ ili uklonite rutu.`,
        toType: 'none',
        targetLabel: '',
        targetUrl: '',
        suggestions: [],
      }
    }

    const exactCulture = Boolean(cultureBySlug)
    const url = `/planovi-zastite/${chosen.slug}`
    return {
      from: c.from,
      path: c.path,
      kind: c.type,
      hint: c.hint,
      status: exactCulture ? 'auto-matched' : 'needs-review',
      confidence: exactCulture ? 100 : 70,
      note: exactCulture ? 'Plan zaštite — kultura pronađena.' : 'Plan zaštite — proverite kulturu.',
      toType: 'custom',
      url,
      targetLabel: `Plan zaštite: ${chosen.title}`,
      targetUrl: url,
      suggestions: [],
    }
  }

  const skip = (c: ClassifiedUrl, note: string): Proposal => ({
    from: c.from,
    path: c.path,
    kind: c.type,
    hint: c.hint,
    status: 'skip',
    confidence: 0,
    note,
    toType: 'none',
    targetLabel: '',
    targetUrl: '',
    suggestions: [],
  })

  const match = (c: ClassifiedUrl): Proposal => {
    switch (c.type) {
      case 'home':
        return skip(c, 'Početna strana — preusmerenje nije potrebno.')
      case 'notFound':
        return skip(c, 'Stara 404 strana — ignorisati.')
      case 'gallery':
        return {
          ...skip(c, 'Envira galerija — niska vrednost. Ignorišite ili uputite na proizvod.'),
          // harmless default if the client does decide to commit it
          toType: 'custom',
          url: '/',
          targetLabel: 'Početna',
          targetUrl: '/',
        }
      case 'pdf':
        return {
          from: c.from,
          path: c.path,
          kind: c.type,
          hint: c.hint,
          status: 'needs-review',
          confidence: 0,
          note: 'PDF dokument — otpremite u Media pa postavite cilj, ili ostavite da vodi na 404.',
          toType: 'none',
          targetLabel: '',
          targetUrl: '',
          suggestions: [],
        }
      case 'content':
        return c.hint === 'plan' ? matchPlan(c) : matchContent(c)
      default:
        return skip(c, 'Nepoznat tip.')
    }
  }

  return { match }
}
