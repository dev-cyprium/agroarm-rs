'use client'
import Fuse from 'fuse.js'
import { useMemo } from 'react'

import { normalize } from '@/utilities/normalize'
import { type SpotlightRecord, type SpotlightType, TYPE_ORDER } from './types'

export interface SpotlightGroup {
  type: SpotlightType
  items: SpotlightRecord[]
}

export interface SpotlightSearchResult {
  /** Results grouped by type, in TYPE_ORDER, only non-empty groups */
  groups: SpotlightGroup[]
  /** Flat ordered list (groups concatenated) for keyboard navigation */
  flat: SpotlightRecord[]
}

const EMPTY: SpotlightSearchResult = { groups: [], flat: [] }

export function useSpotlightSearch(
  records: SpotlightRecord[],
  query: string,
): SpotlightSearchResult {
  const fuse = useMemo(
    () =>
      new Fuse(records, {
        includeScore: true,
        threshold: 0.4, // typo tolerance
        ignoreLocation: true, // match anywhere in the blob
        minMatchCharLength: 2,
        keys: [
          { name: 'titleNormalized', weight: 1.0 },
          { name: 'keywords', weight: 0.5 },
        ],
      }),
    [records],
  )

  return useMemo(() => {
    const q = normalize(query)
    if (q.length < 2) return EMPTY

    const matches = fuse.search(q).map((r) => r.item)

    const groups: SpotlightGroup[] = []
    const flat: SpotlightRecord[] = []
    for (const type of TYPE_ORDER) {
      const items = matches.filter((m) => m.type === type)
      if (items.length > 0) {
        groups.push({ type, items })
        flat.push(...items)
      }
    }

    return { groups, flat }
  }, [fuse, query])
}
