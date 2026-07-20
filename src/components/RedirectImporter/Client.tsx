'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { Proposal } from '@/redirectImport/match'

type ProposalRow = Proposal & { exists: boolean }

interface DiscoverResponse {
  ok?: boolean
  error?: string
  origin?: string
  crawl?: {
    sitemaps: { url: string; isIndex: boolean; count: number }[]
    warnings: string[]
    urls: string[]
  }
  summary?: {
    total: number
    autoMatched: number
    needsReview: number
    noMatch: number
    noise: number
    alreadyExists: number
    candidates: { docs: number; cultures: number }
  }
  proposals?: ProposalRow[]
}

type Phase = 'idle' | 'crawling' | 'review' | 'committing' | 'done'

// Payload admin theme tokens (with light-theme fallbacks) so the view stays
// legible in both light and dark admin themes. Brand greens stay fixed.
const ui = {
  text: 'var(--theme-text, #1F2A24)',
  muted: 'var(--theme-elevation-500, #6b7280)',
  border: 'var(--theme-elevation-150, #E6EFEA)',
  surface: 'var(--theme-elevation-0, #ffffff)',
  surfaceAlt: 'var(--theme-elevation-50, #F4F8F6)',
  green: '#007D41',
  greenHover: '#009F54',
  amber: '#B8860B',
  red: '#B00020',
  redSoft: 'rgba(176, 0, 32, 0.12)',
  greenSoft: 'rgba(0, 125, 65, 0.12)',
  disabled: '#9ca3af',
} as const

const STATUS_LABEL: Record<Proposal['status'], string> = {
  'auto-matched': 'Automatski',
  'needs-review': 'Za proveru',
  'no-match': 'Bez poklapanja',
  skip: 'Preskočeno',
}

const STATUS_COLOR: Record<Proposal['status'], string> = {
  'auto-matched': ui.green,
  'needs-review': ui.amber,
  'no-match': ui.red,
  skip: '#6b7280',
}

const COMMIT_BATCH = 25
const PAGE_SIZE = 150

// Per-row outcome: 301 redirect, 410 gone (de-index), or leave it (→404).
type Decision = '301' | '410' | 'skip'

const DECISION_LABEL: Record<Decision, string> = {
  '301': '301 · Preusmeri',
  '410': '410 · Ukloni',
  skip: '404 · Ostavi',
}

// Default: confident matches WITH a target → 301. Rows without a target (PDFs,
// no-match) default to "leave" — a 301 without a destination would either fail
// or, worse, get pointed somewhere irrelevant (soft-404).
const defaultDecision = (p: ProposalRow): Decision => {
  if (p.exists) return 'skip'
  const confident = p.status === 'auto-matched' || p.status === 'needs-review'
  return confident && p.toType !== 'none' ? '301' : 'skip'
}

// Ensure a hand-typed destination is a usable path/URL ("kontakt" → "/kontakt").
const normalizeDest = (v: string): string => {
  const t = v.trim()
  if (!t || t.startsWith('/') || /^https?:\/\//i.test(t)) return t
  return `/${t}`
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await res.json()) as T
  if (!res.ok) throw new Error((data as { error?: string })?.error || `HTTP ${res.status}`)
  return data
}

export const RedirectImporterClient: React.FC = () => {
  const [origin, setOrigin] = useState('https://agroarm.rs')
  const [phase, setPhase] = useState<Phase>('idle')
  const [statusText, setStatusText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [result, setResult] = useState<DiscoverResponse | null>(null)
  // Per-row decision: 301 redirect, 410 gone, or leave (404).
  const [decisions, setDecisions] = useState<Record<string, Decision>>({})
  // Per-row manual destination overrides (custom URL).
  const [overrides, setOverrides] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState<'all' | Proposal['status']>('all')
  const [query, setQuery] = useState('')
  // Non-content noise (/, home, galleries) is hidden by default to declutter.
  const [hideNoise, setHideNoise] = useState(true)
  // Render cap — 584 rows of inputs at once makes the page sluggish.
  const [rowLimit, setRowLimit] = useState(PAGE_SIZE)

  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [commitResult, setCommitResult] = useState<{
    redirects: number
    gone: number
    skipped: number
    errors: number
  } | null>(null)

  const proposals = useMemo(() => result?.proposals ?? [], [result])

  // Effective destination for a row: manual override wins, else the auto match.
  const destFor = useCallback(
    (p: ProposalRow) => {
      const o = overrides[p.from]
      return (o !== undefined ? o : (p.targetUrl ?? '')).trim()
    },
    [overrides],
  )

  const discover = useCallback(async () => {
    setPhase('crawling')
    setError(null)
    setResult(null)
    setCommitResult(null)
    setStatusText('Preuzimanje sitemap-ova sa starog sajta…')
    try {
      const data = await postJSON<DiscoverResponse>('/api/redirect-import/discover', { origin })
      const rows = data.proposals ?? []
      setResult(data)
      const initial: Record<string, Decision> = {}
      for (const p of rows) initial[p.from] = defaultDecision(p)
      setDecisions(initial)
      setOverrides({})
      setRowLimit(PAGE_SIZE)
      setPhase('review')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setPhase('idle')
    }
  }, [origin])

  const commit = useCallback(async () => {
    const actionable = proposals.filter((p) => !p.exists)

    // 301 rows with a real destination → redirects collection.
    const items301 = actionable
      .filter((p) => decisions[p.from] === '301' && destFor(p) !== '')
      .map((p) => {
        const dest = normalizeDest(destFor(p))
        // A hand-entered destination overrides the auto match → custom URL.
        if (dest !== (p.targetUrl ?? '')) {
          return {
            ...p,
            toType: 'custom' as const,
            url: dest,
            reference: undefined,
            targetUrl: dest,
            targetLabel: dest,
            note: 'Ručno postavljen cilj.',
          }
        }
        return p
      })

    // 410 rows → gone-urls collection.
    const items410 = actionable
      .filter((p) => decisions[p.from] === '410')
      .map((p) => ({ from: p.from, note: `Uklonjeno: ${p.path}` }))

    const total = items301.length + items410.length
    if (!total) return

    setPhase('committing')
    setError(null)
    setProgress({ done: 0, total })
    let redirects = 0
    let gone = 0
    let skipped = 0
    let errors = 0
    let done = 0
    const tally = (data: { created: number; skipped: number; errors: unknown[] }, kind: '301' | '410') => {
      if (kind === '301') redirects += data.created
      else gone += data.created
      skipped += data.skipped
      errors += Array.isArray(data.errors) ? data.errors.length : 0
    }
    try {
      for (let i = 0; i < items301.length; i += COMMIT_BATCH) {
        const batch = items301.slice(i, i + COMMIT_BATCH)
        tally(await postJSON('/api/redirect-import/commit', { items: batch }), '301')
        done += batch.length
        setProgress({ done, total })
      }
      for (let i = 0; i < items410.length; i += COMMIT_BATCH) {
        const batch = items410.slice(i, i + COMMIT_BATCH)
        tally(await postJSON('/api/redirect-import/commit-gone', { items: batch }), '410')
        done += batch.length
        setProgress({ done, total })
      }
      // Mark committed rows as handled so they can't be double-committed and
      // the remaining counts reflect the actual outstanding work.
      const committed = new Set<string>([
        ...items301.map((i) => i.from),
        ...items410.map((i) => i.from),
      ])
      setResult((prev) =>
        prev
          ? {
              ...prev,
              proposals: prev.proposals?.map((p) =>
                committed.has(p.from) ? { ...p, exists: true } : p,
              ),
            }
          : prev,
      )
      setCommitResult({ redirects, gone, skipped, errors })
      setPhase('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setPhase('review')
    }
  }, [proposals, decisions, overrides, destFor])

  // Non-content noise: homepage, old 404 helper, Envira galleries (all render as "/").
  const isNoise = (p: ProposalRow) => p.kind === 'home' || p.kind === 'notFound' || p.kind === 'gallery'

  const visible = useMemo(
    () => (hideNoise ? proposals.filter((p) => !isNoise(p)) : proposals),
    [proposals, hideNoise],
  )

  const filtered = useMemo(() => {
    const byStatus = filter === 'all' ? visible : visible.filter((p) => p.status === filter)
    const q = query.trim().toLowerCase()
    if (!q) return byStatus
    return byStatus.filter(
      (p) =>
        p.path.toLowerCase().includes(q) ||
        destFor(p).toLowerCase().includes(q) ||
        (p.targetLabel ?? '').toLowerCase().includes(q),
    )
  }, [visible, filter, query, destFor])

  // New filter/search context → start from the first page again.
  useEffect(() => {
    setRowLimit(PAGE_SIZE)
  }, [filter, query, hideNoise])

  const shown = useMemo(() => filtered.slice(0, rowLimit), [filtered, rowLimit])

  const setDecision = (from: string, d: Decision) =>
    setDecisions((prev) => ({ ...prev, [from]: d }))

  // Setting a destination implies intent to redirect — flip the row to 301 so a
  // suggestion click or typed target is never silently ignored.
  const setDest = (from: string, value: string) => {
    setOverrides((prev) => ({ ...prev, [from]: value }))
    if (value.trim()) {
      setDecisions((prev) => (prev[from] === '301' ? prev : { ...prev, [from]: '301' }))
    }
  }

  // Apply a decision to every currently-filtered row (not just the rendered page).
  const bulkDecision = (d: Decision) =>
    setDecisions((prev) => {
      const next = { ...prev }
      for (const p of filtered) if (!p.exists) next[p.from] = d
      return next
    })

  const counts = useMemo(() => {
    let r = 0
    let g = 0
    let invalid = 0
    for (const p of proposals) {
      if (p.exists) continue
      const d = decisions[p.from]
      if (d === '301') {
        if (destFor(p)) r++
        else invalid++ // 301 without a destination — excluded from commit
      } else if (d === '410') g++
    }
    return { r, g, invalid }
  }, [proposals, decisions, destFor])

  const summary = result?.summary
  const busy = phase === 'crawling' || phase === 'committing'
  const commitTotal = counts.r + counts.g

  return (
    <div style={{ maxWidth: 1100, color: ui.text }}>
      <h1 style={{ marginBottom: 4 }}>Uvoz preusmerenja (301 / 410)</h1>
      <p style={{ color: ui.muted, marginTop: 0 }}>
        Pretraži sitemap-ove starog sajta i za svaku staru rutu izaberi ishod: <strong>301</strong>{' '}
        (preusmeri na cilj), <strong>410</strong> (trajno ukloni iz indeksa) ili <strong>404</strong>{' '}
        (ostavi bez akcije).
      </p>

      {/* --- controls --- */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '16px 0', flexWrap: 'wrap' }}>
        <input
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          disabled={busy}
          placeholder="https://agroarm.rs"
          aria-label="Adresa starog sajta"
          style={{ ...inputStyle, flex: '0 0 320px' }}
        />
        <button onClick={discover} disabled={busy} style={primaryBtn(busy)}>
          {phase === 'crawling' ? 'Pretraga u toku…' : 'Pokreni pretragu'}
        </button>
      </div>

      {busy && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: ui.green }}>
          <Spinner />
          <span>{phase === 'committing' ? `Upisivanje… ${progress.done}/${progress.total}` : statusText}</span>
        </div>
      )}

      {phase === 'committing' && (
        <div style={{ height: 8, background: ui.border, borderRadius: 4, marginTop: 10, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
              background: ui.greenHover,
              transition: 'width .2s',
            }}
          />
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, padding: 12, background: ui.redSoft, color: ui.red, borderRadius: 6 }}>
          {error}
        </div>
      )}

      {/* --- summary --- */}
      {summary && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '18px 0' }}>
          <Stat label="Ukupno ruta" value={summary.total} />
          <Stat label="Automatski" value={summary.autoMatched} color={ui.green} />
          <Stat label="Za proveru" value={summary.needsReview} color={ui.amber} />
          <Stat label="Bez poklapanja" value={summary.noMatch} color={ui.red} />
          <Stat label="Već postoji" value={summary.alreadyExists} color={ui.muted} />
        </div>
      )}

      {result?.crawl?.sitemaps?.length ? (
        <div style={{ marginBottom: 8, fontSize: 12, color: ui.muted }}>
          Pročitani sitemap-ovi:{' '}
          {result.crawl.sitemaps
            .filter(Boolean)
            .map((s) => {
              const e = s as { url?: string; isIndex?: boolean; count?: number }
              const raw = e.url ?? (typeof s === 'string' ? (s as string) : '')
              const path = raw.replace(/^https?:\/\/[^/]+/, '') || '?'
              return e.count != null ? `${path} (${e.count}${e.isIndex ? ' pod-mapa' : ' URL'})` : path
            })
            .join(' · ')}
        </div>
      ) : null}

      {result?.crawl?.warnings?.length ? (
        <div style={{ marginBottom: 12, fontSize: 13, color: ui.red, fontWeight: 600 }}>
          ⚠️ {result.crawl.warnings.join(' · ')} — ako nedostaje „page-sitemap.xml“, deo URL-ova nije
          preuzet.
        </div>
      ) : null}

      {/* --- done banner --- */}
      {phase === 'done' && commitResult && (
        <div style={{ margin: '12px 0', padding: 12, background: ui.greenSoft, color: ui.text, borderRadius: 6 }}>
          Upisano {commitResult.redirects} preusmerenja (301) i {commitResult.gone} uklanjanja (410) ·
          preskočeno {commitResult.skipped}
          {commitResult.errors ? ` · grešaka ${commitResult.errors}` : ''}.{' '}
          <a href="/admin/collections/redirects" style={{ color: ui.green, fontWeight: 600 }}>
            Redirects →
          </a>{' '}
          <a href="/admin/collections/gone-urls" style={{ color: ui.green, fontWeight: 600 }}>
            Uklonjeni URL-ovi →
          </a>
        </div>
      )}

      {/* --- proposals table --- */}
      {proposals.length > 0 && (
        <>
          <p style={{ fontSize: 13, color: ui.muted, margin: '4px 0' }}>
            <strong>301</strong> = trajno preusmerenje na cilj · <strong>410</strong> = trajno uklonjeno
            (najbrže izlazi iz indeksa) · <strong>404</strong> = ostavi bez akcije (i dalje izlazi iz
            indeksa, samo sporije).
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '10px 0', flexWrap: 'wrap' }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pretraga ruta… (npr. predstavnistva)"
              aria-label="Pretraga ruta"
              style={{ ...inputStyle, flex: '0 0 260px' }}
            />
            <label style={{ fontSize: 13 }}>
              Filter:{' '}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                style={selectStyle}
              >
                <option value="all">Sve ({filtered.length})</option>
                <option value="auto-matched">Automatski</option>
                <option value="needs-review">Za proveru</option>
                <option value="no-match">Bez poklapanja</option>
              </select>
            </label>
            <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={hideNoise}
                onChange={(e) => setHideNoise(e.target.checked)}
              />
              Sakrij sistemske rute
              {summary?.noise ? ` (${summary.noise})` : ''}
            </label>
            <span style={{ fontSize: 12, color: ui.muted }}>Filtrirane →</span>
            <button onClick={() => bulkDecision('301')} style={linkBtn} disabled={busy}>
              sve 301
            </button>
            <button onClick={() => bulkDecision('410')} style={linkBtn} disabled={busy}>
              sve 410
            </button>
            <button onClick={() => bulkDecision('skip')} style={linkBtn} disabled={busy}>
              sve 404
            </button>
            <strong style={{ marginLeft: 'auto', color: ui.green }}>
              {counts.r} × 301 · {counts.g} × 410
            </strong>
            <button onClick={commit} disabled={busy || commitTotal === 0} style={primaryBtn(busy || commitTotal === 0)}>
              Upiši ({commitTotal})
            </button>
          </div>

          {counts.invalid > 0 && (
            <div style={{ margin: '6px 0', fontSize: 13, color: ui.red }}>
              ⚠️ {counts.invalid} ruta je označeno „301“ bez cilja — biće izostavljene. Unesite cilj ili
              promenite ishod.
            </div>
          )}

          {/* Horizontal scroll only (narrow screens); vertical scrolling belongs
              to the page — a nested vertical scrollbar makes double-scroll. */}
          <div style={{ overflowX: 'auto', border: `1px solid ${ui.border}`, borderRadius: 6 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th style={{ ...th, minWidth: 130 }}>Ishod</th>
                  <th style={th}>Stari URL</th>
                  <th style={th}>Status</th>
                  <th style={th}>%</th>
                  <th style={{ ...th, minWidth: 280 }}>Cilj (izmenljivo)</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((p) => {
                  const dest = overrides[p.from] ?? p.targetUrl ?? ''
                  const decision = decisions[p.from] ?? defaultDecision(p)
                  const missing301 = decision === '301' && !destFor(p)
                  return (
                    <tr key={p.from} style={{ borderTop: `1px solid ${ui.border}`, opacity: p.exists ? 0.5 : 1 }}>
                      <td style={td}>
                        {p.exists ? (
                          <em style={{ fontSize: 11, color: ui.muted }}>upisano</em>
                        ) : (
                          <select
                            value={decision}
                            disabled={busy}
                            onChange={(e) => setDecision(p.from, e.target.value as Decision)}
                            aria-label={`Ishod za ${p.path}`}
                            style={{
                              ...selectStyle,
                              fontWeight: 600,
                              borderColor: decision === '301' ? ui.green : decision === '410' ? ui.red : ui.border,
                              color: decision === '301' ? ui.green : decision === '410' ? ui.red : ui.muted,
                            }}
                          >
                            <option value="301">{DECISION_LABEL['301']}</option>
                            <option value="410">{DECISION_LABEL['410']}</option>
                            <option value="skip">{DECISION_LABEL['skip']}</option>
                          </select>
                        )}
                      </td>
                      <td style={{ ...td, fontFamily: 'monospace' }}>{p.path || '/'}</td>
                      <td style={td}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: 11,
                            color: '#fff',
                            background: STATUS_COLOR[p.status],
                          }}
                        >
                          {STATUS_LABEL[p.status]}
                        </span>
                      </td>
                      <td style={td}>{p.confidence || ''}</td>
                      <td style={td}>
                        {p.targetLabel ? (
                          <div style={{ fontSize: 11, color: ui.muted, marginBottom: 2 }}>{p.targetLabel}</div>
                        ) : null}
                        <input
                          value={dest}
                          disabled={busy || p.exists}
                          placeholder="/putanja-cilja"
                          aria-label={`Cilj za ${p.path}`}
                          onChange={(e) => setDest(p.from, e.target.value)}
                          style={{
                            ...inputStyle,
                            width: '100%',
                            padding: '6px 8px',
                            fontFamily: 'monospace',
                            fontSize: 12,
                            borderColor: missing301 ? ui.red : ui.border,
                          }}
                        />
                        {missing301 ? (
                          <div style={{ color: ui.red, fontSize: 11, marginTop: 2 }}>
                            Unesite cilj — 301 bez cilja se ne upisuje.
                          </div>
                        ) : !p.targetLabel && p.note ? (
                          <div style={{ color: ui.red, fontSize: 11, marginTop: 2 }}>{p.note}</div>
                        ) : null}
                        {p.suggestions?.length ? (
                          <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {p.suggestions.map((s) => (
                              <button
                                key={s.url + String(s.value)}
                                onClick={() => setDest(p.from, s.url)}
                                style={suggestionBtn}
                                title={`Predlog · ${s.score}%`}
                                disabled={busy || p.exists}
                              >
                                {s.label} → {s.url}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filtered.length > rowLimit && (
            <div style={{ margin: '10px 0', textAlign: 'center' }}>
              <button onClick={() => setRowLimit((l) => l + PAGE_SIZE * 2)} style={{ ...linkBtn, fontSize: 14 }}>
                Prikaži još ({filtered.length - rowLimit} preostalo)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const th: React.CSSProperties = {
  padding: '8px 10px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  background: ui.surfaceAlt,
}
const td: React.CSSProperties = { padding: '8px 10px', verticalAlign: 'top' }

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  border: `1px solid ${ui.border}`,
  borderRadius: 6,
  background: ui.surface,
  color: ui.text,
}

const selectStyle: React.CSSProperties = {
  padding: '4px 6px',
  borderRadius: 4,
  border: `1px solid ${ui.border}`,
  background: ui.surface,
  color: ui.text,
  fontSize: 12,
}

const linkBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: ui.green,
  cursor: 'pointer',
  fontSize: 13,
  textDecoration: 'underline',
  padding: 0,
}

const suggestionBtn: React.CSSProperties = {
  background: ui.surfaceAlt,
  border: `1px solid ${ui.border}`,
  color: ui.green,
  cursor: 'pointer',
  fontSize: 11,
  borderRadius: 4,
  padding: '2px 6px',
  fontFamily: 'monospace',
}

const primaryBtn = (disabled: boolean): React.CSSProperties => ({
  padding: '8px 16px',
  background: disabled ? ui.disabled : ui.green,
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  cursor: disabled ? 'default' : 'pointer',
  fontWeight: 600,
})

const Stat: React.FC<{ label: string; value: number; color?: string }> = ({ label, value, color }) => (
  <div
    style={{
      minWidth: 120,
      padding: '10px 14px',
      background: ui.surface,
      border: `1px solid ${ui.border}`,
      borderRadius: 8,
    }}
  >
    <div style={{ fontSize: 22, fontWeight: 700, color: color || ui.text }}>{value}</div>
    <div style={{ fontSize: 12, color: ui.muted }}>{label}</div>
  </div>
)

const Spinner: React.FC = () => (
  <span
    style={{
      width: 16,
      height: 16,
      border: `2px solid ${ui.border}`,
      borderTopColor: ui.green,
      borderRadius: '50%',
      display: 'inline-block',
      animation: 'ra-spin 0.8s linear infinite',
    }}
  >
    <style>{'@keyframes ra-spin{to{transform:rotate(360deg)}}'}</style>
  </span>
)
