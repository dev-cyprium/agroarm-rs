'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search, X, SlidersHorizontal, Leaf, Package, ChevronRight, ArrowRight } from 'lucide-react'
import { ProductCard } from './ProductCard'

import type { Category, Product } from '@/payload-types'

const CULTURE_PARAM = 'culture'
const QUERY_PARAM = 'q'

type CultureOption = { id: number; title: string }
type CultureFilterGroup = {
  group: { id: number; title: string }
  cultures: CultureOption[]
}

type ParentProps = {
  mode: 'parent'
  category: Category
  children: Category[]
  childProductCounts: Record<number, number>
}

type LeafProps = {
  mode: 'leaf'
  category: Category
  siblings: Category[]
  products: Product[]
  cultureFilterGroups: CultureFilterGroup[]
  ungroupedCultures: CultureOption[]
}

type CategoryPageClientProps = ParentProps | LeafProps

export const CategoryPageClient: React.FC<CategoryPageClientProps> = (props) => {
  const { category } = props

  if (props.mode === 'parent') {
    return <ParentCategoryView {...props} />
  }

  return <LeafCategoryView {...props} />
}

/* ── Parent category: show child category cards ── */

function ParentCategoryView({ category, children, childProductCounts }: ParentProps) {
  return (
    <article className="bg-[#F4F8F6] min-h-screen">
      {/* Header banner */}
      <div className="bg-[#024E29]">
        <div className="container py-10 md:py-14">
          <Breadcrumbs category={category} />
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{category.title}</h1>
          <p className="mt-2 text-white/60">
            {children.length}{' '}
            {children.length === 1 ? 'podkategorija' : 'podkategorija'}
          </p>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => {
            const count = childProductCounts[child.id] ?? 0
            return (
              <Link
                key={child.id}
                href={`/kategorije/${child.slug}`}
                className="group flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-lg font-bold text-[#1F2A24] transition-colors group-hover:text-[#007D41]">
                    {child.title}
                  </h2>
                  <span className="text-sm text-[#1F2A24]/50">
                    {count} {count === 1 ? 'proizvod' : 'proizvoda'}
                  </span>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4F8F6] text-[#007D41] transition-all group-hover:bg-[#007D41] group-hover:text-white">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </article>
  )
}

/* ── Leaf category: show products with filters ── */

function LeafCategoryView({
  category,
  siblings,
  products,
  cultureFilterGroups,
  ungroupedCultures,
}: LeafProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const urlSearchQuery = searchParams.get(QUERY_PARAM) ?? ''
  // Local state mirrors the URL but updates immediately on keystroke; the
  // URL (and thus the filter) sync on a debounce to avoid re-rendering on
  // every character.
  const [searchQuery, setSearchQueryState] = useState(urlSearchQuery)
  const lastUrlSearchQueryRef = useRef(urlSearchQuery)
  useEffect(() => {
    // Re-sync local state when the URL changes from outside (back/forward,
    // breadcrumb, clear filters), but never clobber the user's in-progress typing.
    if (urlSearchQuery !== lastUrlSearchQueryRef.current) {
      lastUrlSearchQueryRef.current = urlSearchQuery
      setSearchQueryState(urlSearchQuery)
    }
  }, [urlSearchQuery])

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

  const setSearchQuery = (value: string) => {
    setSearchQueryState(value)
  }

  // Debounce URL sync for the search query so typing doesn't trigger a
  // route update + re-render on every character.
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

  const toggleCulture = (id: number) => {
    updateParams((p) => {
      const next = new Set(selectedCultures)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      if (next.size === 0) p.delete(CULTURE_PARAM)
      else p.set(CULTURE_PARAM, Array.from(next).join(','))
    })
  }

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

    if (selectedCultures.size > 0) {
      result = result.filter((p) => {
        const productCultures = (p.culture ?? []).filter(
          (c): c is Exclude<typeof c, number> => typeof c === 'object',
        )
        return productCultures.some((c) => selectedCultures.has(c.id))
      })
    }

    return result
  }, [products, searchQuery, selectedCultures])

  const hasActiveFilters = searchQuery.trim() || selectedCultures.size > 0

  const clearFilters = () => {
    // Reset local search immediately so the pending debounced URL update
    // doesn't undo the clear.
    setSearchQueryState('')
    lastUrlSearchQueryRef.current = ''
    updateParams((p) => {
      p.delete(QUERY_PARAM)
      p.delete(CULTURE_PARAM)
    })
  }

  const clearCultures = () => {
    updateParams((p) => p.delete(CULTURE_PARAM))
  }

  // Params we round-trip through the product page so back/breadcrumbs restore filters.
  const productLinkParams = useMemo(() => {
    const p = new URLSearchParams()
    p.set('from', category.slug ?? '')
    if (searchQuery) p.set(QUERY_PARAM, searchQuery)
    if (selectedCultures.size > 0) p.set(CULTURE_PARAM, Array.from(selectedCultures).join(','))
    return p.toString()
  }, [category.slug, searchQuery, selectedCultures])

  const hasFilters = siblings.length > 1 || cultureFilterGroups.length > 0 || ungroupedCultures.length > 0

  const filterContent = (
    <>
      {/* Sibling categories */}
      {siblings.length > 1 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#1F2A24]/40">
            Kategorije
          </h3>
          <ul className="flex flex-col gap-1">
            {siblings.map((sib) => {
              const isActive = sib.id === category.id
              return (
                <li key={sib.id}>
                  <Link
                    href={`/kategorije/${sib.slug}`}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#007D41] text-white'
                        : 'text-[#1F2A24]/70 hover:bg-[#E6EFEA] hover:text-[#1F2A24]'
                    }`}
                  >
                    {sib.title}
                    {isActive && <ChevronRight className="h-3.5 w-3.5" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Culture filters grouped by culture group */}
      {(cultureFilterGroups.length > 0 || ungroupedCultures.length > 0) && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#1F2A24]/40">
            Kultura
          </h3>
          <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
            {cultureFilterGroups.map(({ group, cultures }) => (
              <div key={group.id}>
                <span className="flex items-center gap-1.5 px-1 pb-1.5 text-xs font-semibold text-[#024E29]/60">
                  <Leaf className="h-3 w-3" />
                  {group.title}
                </span>
                <ul className="flex flex-col gap-0.5">
                  {cultures.map((culture) => {
                    const isActive = selectedCultures.has(culture.id)
                    return (
                      <li key={culture.id}>
                        <button
                          type="button"
                          onClick={() => toggleCulture(culture.id)}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                            isActive
                              ? 'bg-[#024E29] font-medium text-white'
                              : 'text-[#1F2A24]/70 hover:bg-[#E6EFEA] hover:text-[#1F2A24]'
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                              isActive
                                ? 'border-white/30 bg-white/20 text-white'
                                : 'border-[#E6EFEA] bg-white text-transparent'
                            }`}
                          >
                            {isActive && '✓'}
                          </span>
                          {culture.title}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}

            {ungroupedCultures.length > 0 && (
              <ul className="flex flex-col gap-0.5">
                {ungroupedCultures.map((culture) => {
                  const isActive = selectedCultures.has(culture.id)
                  return (
                    <li key={culture.id}>
                      <button
                        type="button"
                        onClick={() => toggleCulture(culture.id)}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                          isActive
                            ? 'bg-[#024E29] font-medium text-white'
                            : 'text-[#1F2A24]/70 hover:bg-[#E6EFEA] hover:text-[#1F2A24]'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                            isActive
                              ? 'border-white/30 bg-white/20 text-white'
                              : 'border-[#E6EFEA] bg-white text-transparent'
                          }`}
                        >
                          {isActive && '✓'}
                        </span>
                        {culture.title}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {selectedCultures.size > 0 && (
            <button
              type="button"
              onClick={clearCultures}
              className="mt-2 text-xs font-medium text-[#007D41] hover:underline"
            >
              Poništi izbor kultura
            </button>
          )}
        </div>
      )}
    </>
  )

  return (
    <article className="bg-[#F4F8F6] min-h-screen">
      {/* Header banner */}
      <div className="bg-[#024E29]">
        <div className="container py-10 md:py-14">
          <Breadcrumbs category={category} />
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{category.title}</h1>
          <p className="mt-2 text-white/60">
            {products.length}{' '}
            {products.length === 1 ? 'proizvod' : 'proizvoda'}
          </p>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop sidebar */}
          {hasFilters && (
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 flex flex-col gap-6 rounded-2xl bg-white p-5 shadow-sm">
                {filterContent}
              </div>
            </aside>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search and filter bar */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1F2A24]/30" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pretražite proizvode..."
                  className="w-full rounded-xl border border-[#E6EFEA] bg-white py-2.5 pl-10 pr-10 text-sm text-[#1F2A24] placeholder-[#1F2A24]/30 shadow-sm transition-colors focus:border-[#007D41] focus:outline-none focus:ring-2 focus:ring-[#007D41]/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[#1F2A24]/30 hover:text-[#1F2A24]/60"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Mobile filter toggle */}
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => setShowMobileFilters((o) => !o)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E6EFEA] bg-white px-4 py-2.5 text-sm font-medium text-[#1F2A24]/70 shadow-sm transition-colors hover:border-[#007D41]/30 hover:text-[#007D41] lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filteri
                  {selectedCultures.size > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#007D41] px-1.5 text-[10px] font-bold text-white">
                      {selectedCultures.size}
                    </span>
                  )}
                </button>
              )}

              {/* Active filter indicator + clear */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#007D41]/10 px-3 py-1.5 text-xs font-semibold text-[#007D41] transition-colors hover:bg-[#007D41]/20"
                >
                  <X className="h-3 w-3" />
                  Obriši filtere
                </button>
              )}
            </div>

            {/* Mobile filters panel */}
            {showMobileFilters && hasFilters && (
              <div className="mb-6 flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm lg:hidden">
                {filterContent}
              </div>
            )}

            {/* Results count */}
            {hasActiveFilters && (
              <p className="mb-4 text-sm text-[#1F2A24]/50">
                {filteredProducts.length === 0
                  ? 'Nema rezultata'
                  : `Prikazano ${filteredProducts.length} od ${products.length} proizvoda`}
              </p>
            )}

            {/* Product grid */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-sm">
                <Package className="h-12 w-12 text-[#E6EFEA]" />
                <p className="mt-4 text-base font-medium text-[#1F2A24]/50">
                  {hasActiveFilters
                    ? 'Nema proizvoda koji odgovaraju filterima.'
                    : 'Nema proizvoda u ovoj kategoriji.'}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-3 text-sm font-medium text-[#007D41] hover:underline"
                  >
                    Obriši sve filtere
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    linkSearchParams={productLinkParams}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

/* ── Shared breadcrumbs ── */

function Breadcrumbs({ category }: { category: Category }) {
  return (
    <div className="flex items-center gap-2 text-sm text-white/60 mb-3">
      <Link href="/" className="hover:text-white transition-colors">
        Početna
      </Link>
      <span>/</span>
      {category.parent && typeof category.parent === 'object' && (
        <>
          <Link
            href={`/kategorije/${category.parent.slug}`}
            className="hover:text-white transition-colors"
          >
            {category.parent.title}
          </Link>
          <span>/</span>
        </>
      )}
      <span className="text-white/90">{category.title}</span>
    </div>
  )
}
