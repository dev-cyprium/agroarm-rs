'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, X, SlidersHorizontal, Leaf, Package } from 'lucide-react'
import { ProductCard } from './ProductCard'

import type { Product } from '@/payload-types'
import type { CultureFilterGroup, CultureOption, SubcategoryFacetOption } from './catalogData'

const QUERY_PARAM = 'q'
const SUB_PARAM = 'sub'
const CULTURE_PARAM = 'culture'
const PAGE_SIZE = 24

type ScopeInfo = { id: number; title: string; slug: string }
type TopLevelTab = { id: number; title: string; slug: string }

export type CatalogClientProps = {
  /** null = "Svi proizvodi" (the /kategorije index). */
  scope: ScopeInfo | null
  topLevelCategories: TopLevelTab[]
  subcategoryFacet: SubcategoryFacetOption[]
  cultureFilterGroups: CultureFilterGroup[]
  ungroupedCultures: CultureOption[]
  products: Product[]
}

const objectsOnly = <T,>(arr: (number | T)[] | null | undefined): T[] =>
  (arr ?? []).filter((v): v is Exclude<typeof v, number> => typeof v === 'object') as T[]

export const CatalogClient: React.FC<CatalogClientProps> = ({
  scope,
  topLevelCategories,
  subcategoryFacet,
  cultureFilterGroups,
  ungroupedCultures,
  products,
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  /* ── URL-synced state ── */

  const urlSearchQuery = searchParams.get(QUERY_PARAM) ?? ''
  // Local search mirrors the URL but updates immediately on keystroke; the URL
  // (and thus the filter) sync on a debounce to avoid a route update per char.
  const [searchQuery, setSearchQueryState] = useState(urlSearchQuery)
  const lastUrlSearchQueryRef = useRef(urlSearchQuery)
  useEffect(() => {
    if (urlSearchQuery !== lastUrlSearchQueryRef.current) {
      lastUrlSearchQueryRef.current = urlSearchQuery
      setSearchQueryState(urlSearchQuery)
    }
  }, [urlSearchQuery])

  const selectedSubSlugs = useMemo(() => {
    const raw = searchParams.get(SUB_PARAM)
    if (!raw) return new Set<string>()
    return new Set(raw.split(',').filter(Boolean))
  }, [searchParams])

  const selectedCultures = useMemo(() => {
    const raw = searchParams.get(CULTURE_PARAM)
    if (!raw) return new Set<number>()
    return new Set(
      raw
        .split(',')
        .map((s) => Number(s))
        .filter((n) => Number.isFinite(n)),
    )
  }, [searchParams])

  const updateParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams.toString())
      mutate(next)
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  useEffect(() => {
    if (searchQuery === urlSearchQuery) return
    const handle = setTimeout(() => {
      lastUrlSearchQueryRef.current = searchQuery
      updateParams((p) => {
        if (searchQuery) p.set(QUERY_PARAM, searchQuery)
        else p.delete(QUERY_PARAM)
      })
    }, 250)
    return () => clearTimeout(handle)
  }, [searchQuery, urlSearchQuery, updateParams])

  const toggleSub = (slug: string) => {
    updateParams((p) => {
      const next = new Set(selectedSubSlugs)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      if (next.size === 0) p.delete(SUB_PARAM)
      else p.set(SUB_PARAM, Array.from(next).join(','))
    })
  }

  const toggleCulture = (id: number) => {
    updateParams((p) => {
      const next = new Set(selectedCultures)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      if (next.size === 0) p.delete(CULTURE_PARAM)
      else p.set(CULTURE_PARAM, Array.from(next).join(','))
    })
  }

  const clearAllFilters = () => {
    setSearchQueryState('')
    lastUrlSearchQueryRef.current = ''
    updateParams((p) => {
      p.delete(QUERY_PARAM)
      p.delete(SUB_PARAM)
      p.delete(CULTURE_PARAM)
    })
  }

  /* ── Lookups ── */

  const subOptionBySlug = useMemo(() => {
    const m = new Map<string, SubcategoryFacetOption>()
    for (const o of subcategoryFacet) m.set(o.slug, o)
    return m
  }, [subcategoryFacet])

  const selectedSubIds = useMemo(() => {
    const ids = new Set<number>()
    for (const slug of selectedSubSlugs) {
      const opt = subOptionBySlug.get(slug)
      if (opt) ids.add(opt.id)
    }
    return ids
  }, [selectedSubSlugs, subOptionBySlug])

  const cultureTitleById = useMemo(() => {
    const m = new Map<number, string>()
    for (const g of cultureFilterGroups) for (const c of g.cultures) m.set(c.id, c.title)
    for (const c of ungroupedCultures) m.set(c.id, c.title)
    return m
  }, [cultureFilterGroups, ungroupedCultures])

  /* ── Filtering (OR within a facet, AND across facets) ── */

  const filteredProducts = useMemo(() => {
    let result = products

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) ||
          (p.activeMaterial && p.activeMaterial.toLowerCase().includes(q)),
      )
    }

    if (selectedSubIds.size > 0) {
      result = result.filter((p) =>
        objectsOnly<{ id: number }>(p.categories).some((c) => selectedSubIds.has(c.id)),
      )
    }

    if (selectedCultures.size > 0) {
      result = result.filter((p) =>
        objectsOnly<{ id: number }>(p.culture).some((c) => selectedCultures.has(c.id)),
      )
    }

    return result
  }, [products, searchQuery, selectedSubIds, selectedCultures])

  // Reset the load-more window whenever the active filters change.
  const filterSignature = `${searchQuery}|${Array.from(selectedSubSlugs).sort().join(',')}|${Array.from(
    selectedCultures,
  )
    .sort()
    .join(',')}`
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [filterSignature])

  const visibleProducts = filteredProducts.slice(0, visibleCount)

  /* ── Derived UI state ── */

  const activeFilterCount = selectedSubSlugs.size + selectedCultures.size + (searchQuery.trim() ? 1 : 0)
  const hasActiveFilters = activeFilterCount > 0
  const hasSubFacet = subcategoryFacet.length > 0
  const hasCultureFacet = cultureFilterGroups.length > 0 || ungroupedCultures.length > 0

  // Params round-tripped through the product page so back/breadcrumbs restore filters.
  const productLinkParams = useMemo(() => {
    const p = new URLSearchParams()
    if (scope?.slug) p.set('from', scope.slug)
    if (searchQuery) p.set(QUERY_PARAM, searchQuery)
    if (selectedSubSlugs.size > 0) p.set(SUB_PARAM, Array.from(selectedSubSlugs).join(','))
    if (selectedCultures.size > 0) p.set(CULTURE_PARAM, Array.from(selectedCultures).join(','))
    return p.toString()
  }, [scope?.slug, searchQuery, selectedSubSlugs, selectedCultures])

  /* ── Filter rail content (shared desktop + mobile) ── */

  const filterContent = (
    <>
      {hasSubFacet && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/40">
            Kategorija
          </h3>
          <ul className="flex flex-col gap-0.5">
            {subcategoryFacet.map((sub) => {
              const isActive = selectedSubSlugs.has(sub.slug)
              return (
                <li key={sub.id}>
                  <button
                    type="button"
                    onClick={() => toggleSub(sub.slug)}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                      isActive
                        ? 'bg-brand font-medium text-white'
                        : 'text-ink/70 hover:bg-hairline hover:text-ink'
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                        isActive
                          ? 'border-white/30 bg-white/20 text-white'
                          : 'border-hairline bg-surface-raised text-transparent'
                      }`}
                    >
                      {isActive && '✓'}
                    </span>
                    <span className="flex-1">{sub.title}</span>
                    <span className={isActive ? 'text-white/70' : 'text-ink/35'}>
                      {sub.count}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {hasCultureFacet && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink/40">
            Kultura
          </h3>
          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto">
            {cultureFilterGroups.map(({ group, cultures }) => (
              <div key={group.id}>
                <span className="flex items-center gap-1.5 px-1 pb-1.5 text-xs font-semibold text-brand-strong/60">
                  <Leaf className="h-3 w-3" />
                  {group.title}
                </span>
                <ul className="flex flex-col gap-0.5">
                  {cultures.map((culture) => (
                    <CultureRow
                      key={culture.id}
                      culture={culture}
                      isActive={selectedCultures.has(culture.id)}
                      onToggle={toggleCulture}
                    />
                  ))}
                </ul>
              </div>
            ))}

            {ungroupedCultures.length > 0 && (
              <ul className="flex flex-col gap-0.5">
                {ungroupedCultures.map((culture) => (
                  <CultureRow
                    key={culture.id}
                    culture={culture}
                    isActive={selectedCultures.has(culture.id)}
                    onToggle={toggleCulture}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {!hasSubFacet && !hasCultureFacet && (
        <p className="text-sm text-ink/40">Nema dostupnih filtera.</p>
      )}
    </>
  )

  /* ── Render ── */

  const pageTitle = scope?.title ?? 'Svi proizvodi'

  return (
    <article className="min-h-screen bg-surface">
      {/* Header banner with scope tabs */}
      <div className="bg-[#024E29]">
        <div className="container py-9 md:py-12">
          <div className="mb-3 flex items-center gap-2 text-sm text-white/60">
            <Link href="/" className="transition-colors hover:text-white">
              Početna
            </Link>
            <span>/</span>
            <span className="text-white/90">{pageTitle}</span>
          </div>

          <h1 className="text-3xl font-bold text-white sm:text-4xl">{pageTitle}</h1>
          <p className="mt-2 text-white/60">
            {products.length} {products.length === 1 ? 'proizvod' : 'proizvoda'}
          </p>

          {/* Scope tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            <ScopeTab href="/kategorije" label="Svi proizvodi" active={scope == null} />
            {topLevelCategories.map((cat) => (
              <ScopeTab
                key={cat.id}
                href={`/kategorije/${cat.slug}`}
                label={cat.title}
                active={scope?.id === cat.id}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop sidebar — always rendered */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 flex flex-col gap-6 rounded-2xl bg-surface-raised p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-ink">Filteri</h2>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs font-medium text-brand hover:underline"
                  >
                    Obriši sve
                  </button>
                )}
              </div>
              {filterContent}
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Search + mobile filter toggle */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQueryState(e.target.value)}
                  placeholder="Pretražite proizvode..."
                  className="w-full rounded-xl border border-hairline bg-surface-raised py-2.5 pl-10 pr-10 text-sm text-ink placeholder-ink/30 shadow-sm transition-colors focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQueryState('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-ink/30 hover:text-ink/60"
                    aria-label="Obriši pretragu"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Mobile filter toggle — always present */}
              <button
                type="button"
                onClick={() => setShowMobileFilters((o) => !o)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-hairline bg-surface-raised px-4 py-2.5 text-sm font-medium text-ink/70 shadow-sm transition-colors hover:border-brand/30 hover:text-brand lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filteri
                {activeFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile filters panel */}
            {showMobileFilters && (
              <div className="mb-6 flex flex-col gap-5 rounded-2xl bg-surface-raised p-5 shadow-sm lg:hidden">
                {filterContent}
              </div>
            )}

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {searchQuery.trim() && (
                  <FilterChip label={`„${searchQuery.trim()}"`} onRemove={() => setSearchQueryState('')} />
                )}
                {Array.from(selectedSubSlugs).map((slug) => (
                  <FilterChip
                    key={`sub-${slug}`}
                    label={subOptionBySlug.get(slug)?.title ?? slug}
                    onRemove={() => toggleSub(slug)}
                  />
                ))}
                {Array.from(selectedCultures).map((id) => (
                  <FilterChip
                    key={`culture-${id}`}
                    label={cultureTitleById.get(id) ?? String(id)}
                    onRemove={() => toggleCulture(id)}
                  />
                ))}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-medium text-brand hover:underline"
                >
                  Obriši sve filtere
                </button>
              </div>
            )}

            {/* Result count — always shown */}
            <p className="mb-4 text-sm text-ink/50">
              {hasActiveFilters
                ? filteredProducts.length === 0
                  ? 'Nema rezultata za zadate filtere'
                  : `Prikazano ${filteredProducts.length} od ${products.length} proizvoda`
                : `${products.length} ${products.length === 1 ? 'proizvod' : 'proizvoda'}`}
            </p>

            {/* Product grid */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-surface-raised px-6 py-20 text-center shadow-sm">
                <Package className="h-12 w-12 text-hairline" />
                <p className="mt-4 text-base font-medium text-ink/50">
                  {hasActiveFilters
                    ? 'Nemamo proizvode koji odgovaraju izabranim filterima.'
                    : 'Trenutno nemamo proizvode u ovoj kategoriji.'}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-5 rounded-xl bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-hover"
                  >
                    {scope
                      ? `Pogledaj sve iz kategorije „${scope.title}"`
                      : 'Pogledaj sve proizvode'}
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      linkSearchParams={productLinkParams}
                    />
                  ))}
                </div>

                {filteredProducts.length > visibleCount && (
                  <div className="mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="rounded-xl border border-brand bg-surface-raised px-6 py-2.5 text-sm font-semibold text-brand shadow-sm transition-colors hover:bg-brand hover:text-white"
                    >
                      Učitaj još
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

/* ── Subcomponents ── */

function ScopeTab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-semibold no-underline transition-colors ${
        active
          ? 'bg-white text-brand-strong'
          : 'bg-white/10 text-white hover:bg-white/20 hover:text-white'
      }`}
    >
      {label}
    </Link>
  )
}

function CultureRow({
  culture,
  isActive,
  onToggle,
}: {
  culture: CultureOption
  isActive: boolean
  onToggle: (id: number) => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onToggle(culture.id)}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
          isActive
            ? 'bg-[#024E29] font-medium text-white'
            : 'text-ink/70 hover:bg-hairline hover:text-ink'
        }`}
      >
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
            isActive
              ? 'border-white/30 bg-white/20 text-white'
              : 'border-hairline bg-surface-raised text-transparent'
          }`}
        >
          {isActive && '✓'}
        </span>
        {culture.title}
      </button>
    </li>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full transition-colors hover:text-brand-hover"
        aria-label={`Ukloni filter ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
