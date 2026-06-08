'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'

import { useDebounce } from '@/utilities/useDebounce'
import type { SpotlightRecord } from '@/components/Spotlight/types'
import { useSpotlightSearch } from '@/components/Spotlight/useSpotlightSearch'
import { SpotlightResults } from '@/components/Spotlight/SpotlightResults'

interface Props {
  records: SpotlightRecord[]
}

export const SearchPageClient: React.FC<Props> = ({ records }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initial = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initial)
  const debounced = useDebounce(query, 200)

  // Keep the URL in sync (shareable / deep-linkable) without scrolling.
  useEffect(() => {
    const current = searchParams.get('q') ?? ''
    if (debounced === current) return
    router.replace(`/search${debounced ? `?q=${encodeURIComponent(debounced)}` : ''}`, {
      scroll: false,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const { groups, flat } = useSpotlightSearch(records, debounced)
  const hasQuery = debounced.trim().length >= 2

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#E6EFEA] bg-white px-4 shadow-sm focus-within:border-[#007D41]">
        <SearchIcon className="h-5 w-5 shrink-0 text-[#007D41]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pretražite kulture, proizvode i kategorije…"
          autoFocus
          className="h-14 flex-1 bg-transparent text-base text-[#1F2A24] placeholder:text-[#1F2A24]/40 focus:outline-none"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-[#E6EFEA] bg-white">
        {!hasQuery ? (
          <p className="px-4 py-10 text-center text-sm text-[#1F2A24]/50">
            Unesite pojam za pretragu.
          </p>
        ) : flat.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-[#1F2A24]/50">
            Nema rezultata za „{debounced.trim()}".
          </p>
        ) : (
          <SpotlightResults
            groups={groups}
            flat={flat}
            activeIndex={-1}
            onHover={() => {}}
            onSelect={() => {}}
            variant="page"
            query={debounced}
          />
        )}
      </div>
    </div>
  )
}
