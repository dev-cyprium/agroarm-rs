'use client'
import { createContext, useContext } from 'react'

export interface SpotlightContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

export const SpotlightContext = createContext<SpotlightContextValue | null>(null)

export function useSpotlight(): SpotlightContextValue {
  const ctx = useContext(SpotlightContext)
  if (!ctx) {
    throw new Error('useSpotlight must be used within a <SpotlightProvider>')
  }
  return ctx
}
