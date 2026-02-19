'use client'

import React, { createContext, useCallback, use, useEffect, useState } from 'react'

import type { Theme, ThemeContextType } from './types'

import canUseDOM from '@/utilities/canUseDOM'
import { defaultTheme, themeLocalStorageKey } from './shared'

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
    // Light-only mode: ignore dark/auto requests and pin the app theme to light.
    setThemeState(defaultTheme)
    window.localStorage.setItem(themeLocalStorageKey, defaultTheme)
    document.documentElement.setAttribute('data-theme', defaultTheme)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', defaultTheme)
    window.localStorage.setItem(themeLocalStorageKey, defaultTheme)
    setThemeState(defaultTheme)
  }, [])

  return <ThemeContext value={{ setTheme, theme }}>{children}</ThemeContext>
}

export const useTheme = (): ThemeContextType => use(ThemeContext)
