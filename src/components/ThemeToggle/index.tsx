'use client'

import React, { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

import { useTheme } from '@/providers/Theme'

interface Props {
  className?: string
  /** Show a text label next to the icon (used in the mobile menu). */
  showLabel?: boolean
}

export const ThemeToggle: React.FC<Props> = ({ className, showLabel }) => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch: render a deterministic default (Moon / "Tamni režim")
  // on the server and first client paint, then reconcile with the real theme.
  useEffect(() => setMounted(true), [])

  const isDark = mounted && theme === 'dark'
  const label = isDark ? 'Svetli režim' : 'Tamni režim'

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={label}
      title={label}
      className={className}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      {showLabel ? <span>{label}</span> : null}
    </button>
  )
}
