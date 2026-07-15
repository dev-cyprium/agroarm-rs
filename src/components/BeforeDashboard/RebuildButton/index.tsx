'use client'

import React, { useCallback, useState } from 'react'
import { toast } from '@payloadcms/ui'

export const RebuildButton: React.FC = () => {
  const [loading, setLoading] = useState(false)

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      if (loading) return

      if (
        !window.confirm(
          'Pokrenuti kompletno ponovno objavljivanje sajta? Traje nekoliko minuta — koristite samo ako se izmene ne vide na sajtu.',
        )
      ) {
        return
      }

      setLoading(true)
      try {
        const res = await fetch('/api/force-rebuild', {
          method: 'POST',
          credentials: 'include',
        })
        if (res.ok) {
          toast.success('Rebuild pokrenut. Izmene će biti vidljive za nekoliko minuta.')
        } else {
          const data = (await res.json().catch(() => null)) as { error?: string } | null
          toast.error(data?.error ?? 'Greška pri pokretanju rebuilda.')
        }
      } catch {
        toast.error('Greška pri pokretanju rebuilda.')
      } finally {
        setLoading(false)
      }
    },
    [loading],
  )

  return (
    <button type="button" className="rebuildButton" onClick={handleClick} disabled={loading}>
      {loading ? 'Pokrećem…' : 'Objavi sve izmene (rebuild sajta)'}
    </button>
  )
}
