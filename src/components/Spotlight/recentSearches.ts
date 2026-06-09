const KEY = 'agroarm:spotlight:recent'
const MAX = 5

export function getRecent(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string').slice(0, MAX) : []
  } catch {
    return []
  }
}

export function pushRecent(query: string): string[] {
  const trimmed = query.trim()
  if (typeof window === 'undefined' || !trimmed) return getRecent()
  try {
    const existing = getRecent().filter((q) => q.toLowerCase() !== trimmed.toLowerCase())
    const next = [trimmed, ...existing].slice(0, MAX)
    window.localStorage.setItem(KEY, JSON.stringify(next))
    return next
  } catch {
    return getRecent()
  }
}

export function clearRecent(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
