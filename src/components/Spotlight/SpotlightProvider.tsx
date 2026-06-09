'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { SpotlightContext } from './useSpotlight'
import { SpotlightDialog } from './SpotlightDialog'
import type { SpotlightRecord } from './types'

export const SpotlightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [records, setRecords] = useState<SpotlightRecord[]>([])
  const [loading, setLoading] = useState(false)
  const fetchedRef = useRef(false)

  const loadIndex = useCallback(async () => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    setLoading(true)
    try {
      const res = await fetch('/api/spotlight')
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = (await res.json()) as SpotlightRecord[]
      setRecords(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load spotlight index', err)
      fetchedRef.current = false // allow a retry on next open
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch the index the first time the dialog opens.
  useEffect(() => {
    if (open) void loadIndex()
  }, [open, loadIndex])

  const toggle = useCallback(() => setOpen((o) => !o), [])

  // Global Cmd+K / Ctrl+K shortcut.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [toggle])

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle])

  return (
    <SpotlightContext.Provider value={value}>
      {children}
      <SpotlightDialog open={open} onOpenChange={setOpen} records={records} loading={loading} />
    </SpotlightContext.Provider>
  )
}
