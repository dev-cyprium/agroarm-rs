'use client'
import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Clock, Search as SearchIcon, X } from 'lucide-react'

import { useDebounce } from '@/utilities/useDebounce'
import type { SpotlightRecord } from './types'
import { useSpotlightSearch } from './useSpotlightSearch'
import { SpotlightResults } from './SpotlightResults'
import { getRecent, pushRecent } from './recentSearches'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  records: SpotlightRecord[]
  loading: boolean
}

export const SpotlightDialog: React.FC<Props> = ({ open, onOpenChange, records, loading }) => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [recent, setRecent] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Below `sm` the dialog is a bottom sheet (slides up); above it, a centered
  // spotlight panel. Drives the framer-motion variants, not the layout — that
  // stays in CSS so there's no flash on first paint.
  const [isDesktop, setIsDesktop] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const debounced = useDebounce(query, 150)
  const { groups, flat } = useSpotlightSearch(records, debounced)

  const hasQuery = debounced.trim().length >= 2
  const showRecent = !hasQuery && recent.length > 0

  // Reset highlight when the result set changes.
  useEffect(() => {
    setActiveIndex(0)
  }, [debounced])

  // On open: clear query and refresh recent searches.
  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setRecent(getRecent())
    }
  }, [open])

  // Keep the mobile bottom sheet above the software keyboard. iOS Safari (and
  // any browser that ignores `interactive-widget`) overlays the keyboard on top
  // of fixed elements without resizing the layout viewport, so `bottom: 0` /
  // `dvh` don't move. We read the real visible area from visualViewport and
  // expose it as CSS vars the sheet is sized/anchored against.
  //   --spotlight-vvh: height of the visible viewport (caps the sheet height)
  //   --spotlight-kb:  keyboard overlap, used as the sheet's bottom offset
  useEffect(() => {
    const vv = window.visualViewport
    if (!open || !vv) return
    const root = document.documentElement
    const update = () => {
      const keyboard = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      root.style.setProperty('--spotlight-vvh', `${vv.height}px`)
      root.style.setProperty('--spotlight-kb', `${keyboard}px`)
    }
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      root.style.removeProperty('--spotlight-vvh')
      root.style.removeProperty('--spotlight-kb')
    }
  }, [open])

  const commit = useCallback(
    (record: SpotlightRecord, navigate: boolean) => {
      pushRecent(query)
      onOpenChange(false)
      if (navigate) router.push(record.url)
    },
    [query, onOpenChange, router],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!flat.length) return
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, flat.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const record = flat[activeIndex]
        if (record) commit(record, true)
      }
    },
    [flat, activeIndex, commit],
  )

  const body = useMemo(() => {
    if (loading && records.length === 0) {
      return <StatusRow text="Učitavanje…" spinner />
    }
    if (hasQuery && flat.length === 0) {
      return <StatusRow text={`Nema rezultata za „${debounced.trim()}".`} />
    }
    if (hasQuery) {
      return (
        <SpotlightResults
          groups={groups}
          flat={flat}
          activeIndex={activeIndex}
          onHover={setActiveIndex}
          onSelect={(r) => commit(r, false)}
          query={debounced}
        />
      )
    }
    if (showRecent) {
      return (
        <div className="flex-1 min-h-0 overflow-y-auto py-2">
          <div className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-ink/50">
            Nedavne pretrage
          </div>
          <ul>
            {recent.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => {
                    setQuery(q)
                    inputRef.current?.focus()
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface"
                >
                  <Clock className="h-4 w-4 shrink-0 text-ink/40" />
                  <span className="truncate text-sm text-ink">{q}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )
    }
    return (
      <div className="px-4 py-10 text-center text-sm text-ink/50">
        Pretražite kulture, proizvode i kategorije
      </div>
    )
  }, [loading, records.length, hasQuery, flat, groups, activeIndex, debounced, showRecent, recent, commit])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[90] bg-[#1F2A24]/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              forceMount
              onOpenAutoFocus={(e) => {
                e.preventDefault()
                inputRef.current?.focus()
              }}
              aria-describedby={undefined}
            >
              <motion.div
                className="fixed z-[100] inset-x-0 bottom-[var(--spotlight-kb,0px)] sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-[12vh] sm:w-full sm:max-w-xl sm:-translate-x-1/2 sm:px-4"
                initial={isDesktop ? { opacity: 0, scale: 0.98, y: -8 } : { y: '100%' }}
                animate={isDesktop ? { opacity: 1, scale: 1, y: 0 } : { y: 0 }}
                exit={isDesktop ? { opacity: 0, scale: 0.98, y: -8 } : { y: '100%' }}
                transition={
                  isDesktop
                    ? { duration: 0.16, ease: 'easeOut' }
                    : { duration: 0.3, ease: [0.32, 0.72, 0, 1] }
                }
                onKeyDown={handleKeyDown}
              >
                <div className="flex h-[88dvh] max-h-[var(--spotlight-vvh,100dvh)] flex-col rounded-t-2xl border border-hairline bg-surface-raised shadow-2xl sm:h-auto sm:max-h-[70vh] sm:rounded-xl">
                  <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-hairline sm:hidden" />
                  <Dialog.Title className="sr-only">Pretraga</Dialog.Title>
                  {/* Search input row */}
                  <div className="flex items-center gap-3 border-b border-hairline px-4">
                    <SearchIcon className="h-5 w-5 shrink-0 text-brand" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Pretraga…"
                      className="h-14 flex-1 bg-transparent text-base text-ink placeholder:text-ink/40 focus:outline-none"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                    />
                    <Dialog.Close
                      aria-label="Zatvori"
                      className="shrink-0 rounded-md p-1.5 text-ink/50 transition-colors hover:bg-surface hover:text-ink"
                    >
                      <X className="h-5 w-5" />
                    </Dialog.Close>
                  </div>

                  {body}

                  {/* Footer hint */}
                  <div className="hidden items-center gap-4 border-t border-hairline px-4 py-2 text-xs text-ink/45 sm:flex">
                    <span>
                      <Kbd>↑</Kbd>
                      <Kbd>↓</Kbd> navigacija
                    </span>
                    <span>
                      <Kbd>Enter</Kbd> otvori
                    </span>
                    <span>
                      <Kbd>Esc</Kbd> izlaz
                    </span>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

function StatusRow({ text, spinner }: { text: string; spinner?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-ink/50">
      {spinner && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-hairline border-t-brand" />
      )}
      {text}
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded border border-hairline bg-surface px-1 font-mono text-[10px] text-ink/60">
      {children}
    </kbd>
  )
}
