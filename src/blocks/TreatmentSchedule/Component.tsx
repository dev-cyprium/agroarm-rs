'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { ArrowUpRight, Leaf, Sparkles, Sprout } from 'lucide-react'

import { CaterpillarIcon, MiteIcon, SporeIcon } from './icons'

// Lucide components and the custom SVG icons share this surface.
type TargetIcon = React.ComponentType<{ className?: string; strokeWidth?: number | string }>

type TargetType = 'herbicid' | 'fungicid' | 'insekticid' | 'akaricid' | 'biostimulator' | 'ostalo'

type ProductRef =
  | number
  | { id?: number; title?: string | null; slug?: string | null }
  | null
  | undefined

type ProductRow = {
  product?: ProductRef
  productName?: string | null
  dose?: string | null
  note?: string | null
  combineWithPrevious?: boolean | null
  id?: string | null
}

type TargetGroup = {
  target?: string | null
  targetType?: TargetType | null
  products?: ProductRow[] | null
  id?: string | null
}

type Stage = {
  stage?: string | null
  targets?: TargetGroup[] | null
  // Legacy flat shape (pre-multi-target): rendered via getTargetGroups() fallback.
  target?: string | null
  targetType?: TargetType | null
  products?: ProductRow[] | null
  note?: string | null
  id?: string | null
}

type TreatmentScheduleProps = {
  title?: string | null
  stages?: Stage[] | null
  footnotes?: ({ text?: string | null; id?: string | null } | null)[] | null
}

const TARGET: Record<
  TargetType,
  { label: string; Icon: TargetIcon; accent: string; dot: string; chip: string }
> = {
  herbicid: {
    label: 'Korov',
    Icon: Sprout,
    accent: 'var(--brand)',
    dot: 'bg-brand',
    chip: 'bg-brand/10 text-brand-strong',
  },
  fungicid: {
    label: 'Bolest',
    Icon: SporeIcon,
    accent: '#0284c7',
    dot: 'bg-sky-600',
    chip: 'bg-sky-50 text-sky-700',
  },
  insekticid: {
    label: 'Štetočina',
    Icon: CaterpillarIcon,
    accent: '#e11d48',
    dot: 'bg-rose-600',
    chip: 'bg-rose-50 text-rose-700',
  },
  akaricid: {
    label: 'Grinje',
    Icon: MiteIcon,
    accent: '#d97706',
    dot: 'bg-amber-600',
    chip: 'bg-amber-50 text-amber-700',
  },
  biostimulator: {
    label: 'Biostimulator',
    Icon: Leaf,
    accent: '#0d9488',
    dot: 'bg-teal-600',
    chip: 'bg-teal-50 text-teal-700',
  },
  ostalo: {
    label: 'Tretman',
    Icon: Sparkles,
    accent: 'var(--ink)',
    dot: 'bg-[#1F2A24]',
    chip: 'bg-hairline text-ink',
  },
}

// Unknown/legacy values fall back to 'ostalo' so a stray targetType can't crash the page.
function normalizeType(value: unknown): TargetType {
  return typeof value === 'string' && value in TARGET ? (value as TargetType) : 'ostalo'
}

// Normalize a stage into its list of target groups, tolerating the legacy flat
// shape where target/targetType/products lived directly on the stage.
function getTargetGroups(stage: Stage): TargetGroup[] {
  if (stage.targets && stage.targets.length > 0) {
    return stage.targets.filter(Boolean) as TargetGroup[]
  }
  if (stage.target || stage.targetType || (stage.products && stage.products.length)) {
    return [{ target: stage.target, targetType: stage.targetType, products: stage.products }]
  }
  return []
}

// Distinct target types in a stage, in order of first appearance.
function distinctTypes(groups: TargetGroup[]): TargetType[] {
  const seen: TargetType[] = []
  for (const g of groups) {
    const tt = normalizeType(g.targetType)
    if (!seen.includes(tt)) seen.push(tt)
  }
  return seen
}

function resolveProduct(row: ProductRow): { name: string | null; slug: string | null } {
  const prod = typeof row.product === 'object' && row.product ? row.product : null
  // Explicit display name wins (keeps brochure formulation names, e.g. „Futocis 2.5 EC“),
  // catalog title is the fallback when the row is only linked.
  const name = row.productName ?? prod?.title ?? null
  const slug = typeof prod?.slug === 'string' ? prod.slug : null
  return { name, slug }
}

// Group product rows into applications: a row with `combineWithPrevious` is
// tank-mixed with the row(s) before it and rendered as one "+"-joined unit.
function groupApplications(products: ProductRow[]): ProductRow[][] {
  const apps: ProductRow[][] = []
  for (const row of products) {
    if (row.combineWithPrevious && apps.length > 0) {
      apps[apps.length - 1].push(row)
    } else {
      apps.push([row])
    }
  }
  return apps
}

function ProductPill({ row }: { row: ProductRow }) {
  const { name, slug } = resolveProduct(row)
  if (!name && !row.dose) return null

  const inner = (
    <span
      className={[
        'inline-flex flex-col items-start border border-hairline bg-surface px-3 py-1.5 text-sm transition-colors',
        row.note ? 'rounded-xl' : 'rounded-full',
        slug ? 'group-hover/pill:border-brand/40 group-hover/pill:bg-brand/5' : '',
      ].join(' ')}
    >
      <span className="inline-flex items-center gap-1.5">
        {name && <span className="font-medium text-brand-strong">{name}</span>}
        {row.dose && (
          <span className="text-ink/55">
            {name ? '· ' : ''}
            {row.dose}
          </span>
        )}
        {slug && (
          <ArrowUpRight className="h-3.5 w-3.5 text-brand/70 transition-transform group-hover/pill:-translate-y-0.5 group-hover/pill:translate-x-0.5" />
        )}
      </span>
      {row.note && <span className="mt-0.5 text-xs italic text-ink/50">{row.note}</span>}
    </span>
  )

  return slug ? (
    <Link href={`/proizvodi/${slug}`} className="group/pill inline-flex no-underline">
      {inner}
    </Link>
  ) : (
    <span className="inline-flex">{inner}</span>
  )
}

// One application: either a lone preparation or a "+"-joined tank mix.
function ApplicationUnit({ rows }: { rows: ProductRow[] }) {
  if (rows.length === 1) return <ProductPill row={rows[0]} />
  return (
    <span className="inline-flex flex-wrap items-center gap-1 rounded-2xl border border-dashed border-hairline bg-hairline/30 p-1">
      {rows.map((row, i) => (
        <React.Fragment key={row.id ?? i}>
          {i > 0 && (
            <span aria-label="u kombinaciji sa" className="px-0.5 text-sm font-semibold text-ink/60">
              +
            </span>
          )}
          <ProductPill row={row} />
        </React.Fragment>
      ))}
    </span>
  )
}

// Render a target group's products as application units.
function ProductList({ products }: { products: ProductRow[] }) {
  const apps = groupApplications(products)
  if (apps.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      {apps.map((rows, i) => (
        <ApplicationUnit key={rows[0]?.id ?? i} rows={rows} />
      ))}
    </div>
  )
}

// A single (patogen + tip mete) group with its preparati pills. `boxed` wraps
// it in a sub-card for the multi-target grid layout.
function TargetGroupView({ group, boxed }: { group: TargetGroup; boxed: boolean }) {
  const t = TARGET[normalizeType(group.targetType)]
  const Icon = t.Icon
  const products = (group.products ?? []).filter(Boolean) as ProductRow[]

  const body = (
    <>
      {group.targetType && (
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${t.chip}`}
        >
          <Icon className="h-3.5 w-3.5" />
          {t.label}
        </span>
      )}
      {group.target && (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/70">
          {group.target}
        </p>
      )}
      {products.length > 0 && (
        <div className="mt-3">
          <ProductList products={products} />
        </div>
      )}
    </>
  )

  if (!boxed) return <div>{body}</div>

  return (
    <div
      className="h-full rounded-xl border border-hairline bg-surface p-4"
      style={{ borderLeft: `3px solid ${t.accent}` }}
    >
      {body}
    </div>
  )
}

function StageRow({ stage, index }: { stage: Stage; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-12% 0px' })

  const groups = getTargetGroups(stage)
  const types = distinctTypes(groups)
  const multi = groups.length > 1
  // Single type → its color drives the spine accent; mixed types → brand green.
  const accent = types.length === 1 ? TARGET[types[0]].accent : 'var(--brand)'

  return (
    <div ref={ref} className="relative pb-8 pl-16 last:pb-0">
      {/* Node marker(s) on the spine — one icon per distinct target type. */}
      <div className="absolute left-0 top-1 flex w-11 flex-col items-center gap-1.5">
        {types.map((type, di) => {
          const t = TARGET[type]
          const Icon = t.Icon
          const lone = types.length === 1
          return (
            <motion.span
              key={type}
              initial={{ scale: 0, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: 0.4, delay: 0.05 + di * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className={`flex items-center justify-center rounded-full text-white shadow-sm ${t.dot} ${
                lone ? 'h-11 w-11' : 'h-9 w-9 ring-2 ring-surface-raised'
              }`}
            >
              <Icon className={lone ? 'h-5 w-5' : 'h-4 w-4'} strokeWidth={2} />
            </motion.span>
          )
        })}
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-2xl border border-hairline bg-surface-raised shadow-sm"
        style={{ borderLeft: `3px solid ${accent}` }}
      >
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
            <h4 className="whitespace-pre-line text-base font-semibold leading-snug text-ink">
              {stage.stage}
            </h4>
            {/* Accumulated type pills for the whole stage. */}
            {types.length > 0 && (
              <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                {types.map((type) => {
                  const t = TARGET[type]
                  const Icon = t.Icon
                  return (
                    <span
                      key={type}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${t.chip}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t.label}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {multi ? (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {groups.map((group, i) => (
                <TargetGroupView key={group.id ?? i} group={group} boxed />
              ))}
            </div>
          ) : (
            groups[0] && (
              <div className="mt-2">
                {/* The single type is already shown as a header pill; just the
                    target text + preparati here to avoid a duplicate chip. */}
                {groups[0].target && (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink/70">
                    {groups[0].target}
                  </p>
                )}
                {(groups[0].products ?? []).filter(Boolean).length > 0 && (
                  <div className="mt-4">
                    <ProductList products={(groups[0].products ?? []).filter(Boolean) as ProductRow[]} />
                  </div>
                )}
              </div>
            )
          )}

          {stage.note && <p className="mt-3 text-xs italic text-ink/50">{stage.note}</p>}
        </div>
      </motion.div>
    </div>
  )
}

export const TreatmentScheduleBlock: React.FC<TreatmentScheduleProps> = ({
  title,
  stages,
  footnotes,
}) => {
  const items = (stages ?? []).filter(Boolean)
  if (items.length === 0) return null

  // Only show legend entries that actually appear (across all target groups).
  const presentTypes = Array.from(
    new Set(items.flatMap((s) => getTargetGroups(s).map((g) => normalizeType(g.targetType)))),
  )

  const notes = (footnotes ?? []).filter((f): f is { text: string } => Boolean(f?.text))

  return (
    <section className="not-prose my-10">
      {title && (
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Program tretmana
          </p>
          <h3 className="mt-1 text-2xl font-bold text-brand-strong sm:text-3xl">{title}</h3>
        </header>
      )}

      {/* Legend */}
      {presentTypes.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {presentTypes.map((type) => {
            const t = TARGET[type]
            const Icon = t.Icon
            return (
              <span
                key={type}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${t.chip}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </span>
            )
          })}
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Spine */}
        <span
          aria-hidden
          className="absolute bottom-2 left-[21px] top-2 w-0.5 rounded-full bg-gradient-to-b from-brand/15 via-brand/30 to-brand/10"
        />
        {items.map((stage, i) => (
          <StageRow key={stage.id ?? i} stage={stage} index={i} />
        ))}
      </div>

      {/* Footnotes */}
      {notes.length > 0 && (
        <div className="mt-6 space-y-1 rounded-xl bg-surface p-4 text-xs leading-relaxed text-ink/60">
          {notes.map((f, i) => (
            <p key={i}>{f.text}</p>
          ))}
        </div>
      )}
    </section>
  )
}
