'use client'

import React, { createContext, useCallback, use, useEffect, useState } from 'react'

import type { Theme, ThemeContextType } from './types'

import canUseDOM from '@/utilities/canUseDOM'
import { defaultTheme, themeLocalStorageKey } from './shared'
import { themeIsValid } from './types'

const initialContext: ThemeContextType = {
  setTheme: () => null,
  theme: undefined,
}

const ThemeContext = createContext(initialContext)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme | undefined>(
    canUseDOM ? (document.documentElement.getAttribute('data-theme') as Theme) : undefined,
  )

  const setTheme = useCallback((themeToSet: Theme | null) => {
    // Anything that isn't an explicit "dark" resolves to light (the default).
    const next: Theme = themeToSet === 'dark' ? 'dark' : defaultTheme
    setThemeState(next)
    window.localStorage.setItem(themeLocalStorageKey, next)
    document.documentElement.setAttribute('data-theme', next)
  }, [])

  useEffect(() => {
    // Sync React state with whatever the pre-hydration InitTheme script applied.
    const current = document.documentElement.getAttribute('data-theme')
    setThemeState(themeIsValid(current) ? current : defaultTheme)
  }, [])

  return <ThemeContext value={{ setTheme, theme }}>{children}</ThemeContext>
}

export const useTheme = (): ThemeContextType => use(ThemeContext)
