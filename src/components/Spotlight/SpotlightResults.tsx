'use client'
import Link from 'next/link'
import React, { useEffect, useRef } from 'react'
import { Layers, Package, Sprout, Tag } from 'lucide-react'

import { cn } from '@/utilities/ui'
import { normalize } from '@/utilities/normalize'
import { type SpotlightRecord, type SpotlightType, TYPE_LABELS } from './types'
import type { SpotlightGroup } from './useSpotlightSearch'

const TYPE_ICON: Record<SpotlightType, React.ElementType> = {
  culture: Sprout,
  product: Package,
  category: Tag,
  'culture-group': Layers,
}

// If the query matched one of a product's cultures, return that culture's name
// so we can show the user *why* the result appeared.
function matchedCulture(item: SpotlightRecord, normalizedQuery: string): string | undefined {
  if (item.type !== 'product' || !item.cultures?.length || normalizedQuery.length < 2) return undefined
  return item.cultures.find((c) => {
    const n = normalize(c)
    return n.includes(normalizedQuery) || normalizedQuery.includes(n)
  })
}

interface Props {
  groups: SpotlightGroup[]
  flat: SpotlightRecord[]
  activeIndex: number
  onHover: (index: number) => void
  onSelect: (record: SpotlightRecord) => void
  variant?: 'modal' | 'page'
  /** Current search query — used to show "matched by Kultura" pills */
  query?: string
}

export const SpotlightResults: React.FC<Props> = ({
  groups,
  flat,
  activeIndex,
  onHover,
  onSelect,
  variant = 'modal',
  query = '',
}) => {
  const activeRef = useRef<HTMLAnchorElement | null>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const normalizedQuery = normalize(query)

  // Map each record key → its index in the flat list (matches keyboard order).
  const indexByKey = new Map(flat.map((r, i) => [r.key, i]))

  return (
    <div className={cn(variant === 'modal' ? 'flex-1 min-h-0 overflow-y-auto py-2' : 'py-2')}>
      {groups.map((group) => {
        const SectionIcon = TYPE_ICON[group.type]
        return (
          <div key={group.type} className="mb-2 last:mb-0">
            <div className="flex items-center gap-2 px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-[#1F2A24]/50">
              <SectionIcon className="h-3.5 w-3.5" />
              {TYPE_LABELS[group.type]}
            </div>
            <ul>
              {group.items.map((item) => {
                const index = indexByKey.get(item.key) ?? -1
                const isActive = index === activeIndex
                const ItemIcon = TYPE_ICON[item.type]
                const cultureMatch = matchedCulture(item, normalizedQuery)
                return (
                  <li key={item.key}>
                    <Link
                      ref={isActive ? activeRef : undefined}
                      href={item.url}
                      onClick={() => onSelect(item)}
                      onMouseMove={() => onHover(index)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 no-underline transition-colors',
                        isActive ? 'bg-[#F4F8F6]' : 'bg-transparent',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border',
                          isActive
                            ? 'border-[#007D41]/30 bg-white'
                            : 'border-[#E6EFEA] bg-[#F4F8F6]',
                        )}
                      >
                        {item.iconUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.iconUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <ItemIcon
                            className={cn('h-4 w-4', isActive ? 'text-[#007D41]' : 'text-[#1F2A24]/60')}
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block truncate text-sm font-medium',
                            isActive ? 'text-[#007D41]' : 'text-[#1F2A24]',
                          )}
                        >
                          {item.title}
                        </span>
                        {item.subtitle ? (
                          <span className="block truncate text-xs text-[#1F2A24]/55">
                            {item.subtitle}
                          </span>
                        ) : null}
                      </span>
                      {cultureMatch ? (
                        <span
                          className="ml-auto flex shrink-0 items-center gap-1 rounded-full border border-[#007D41]/20 bg-[#E6EFEA] px-2 py-0.5 text-[10px] font-medium text-[#007D41]"
                          title={`Kultura: ${cultureMatch}`}
                        >
                          <Sprout className="h-3 w-3" />
                          {cultureMatch}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
