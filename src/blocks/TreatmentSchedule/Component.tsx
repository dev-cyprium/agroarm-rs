'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { ArrowUpRight, Bug, Droplets, Sparkles, Sprout, type LucideIcon } from 'lucide-react'

type TargetType = 'herbicid' | 'fungicid' | 'insekticid' | 'ostalo'

type ProductRef =
  | number
  | { id?: number; title?: string | null; slug?: string | null }
  | null
  | undefined

type ProductRow = {
  product?: ProductRef
  productName?: string | null
  dose?: string | null
  id?: string | null
}

type Stage = {
  stage?: string | null
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
  { label: string; Icon: LucideIcon; accent: string; dot: string; chip: string }
> = {
  herbicid: {
    label: 'Korov',
    Icon: Sprout,
    accent: '#007D41',
    dot: 'bg-[#007D41]',
    chip: 'bg-[#007D41]/10 text-[#024E29]',
  },
  fungicid: {
    label: 'Bolest',
    Icon: Droplets,
    accent: '#0284c7',
    dot: 'bg-sky-600',
    chip: 'bg-sky-50 text-sky-700',
  },
  insekticid: {
    label: 'Štetočina',
    Icon: Bug,
    accent: '#e11d48',
    dot: 'bg-rose-600',
    chip: 'bg-rose-50 text-rose-700',
  },
  ostalo: {
    label: 'Tretman',
    Icon: Sparkles,
    accent: '#1F2A24',
    dot: 'bg-[#1F2A24]',
    chip: 'bg-[#E6EFEA] text-[#1F2A24]',
  },
}

function resolveProduct(row: ProductRow): { name: string | null; slug: string | null } {
  const prod = typeof row.product === 'object' && row.product ? row.product : null
  const name = prod?.title ?? row.productName ?? null
  const slug = typeof prod?.slug === 'string' ? prod.slug : null
  return { name, slug }
}

function ProductPill({ row }: { row: ProductRow }) {
  const { name, slug } = resolveProduct(row)
  if (!name && !row.dose) return null

  const inner = (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border border-[#E6EFEA] bg-[#F4F8F6] px-3 py-1.5 text-sm transition-colors',
        slug ? 'group-hover/pill:border-[#007D41]/40 group-hover/pill:bg-[#007D41]/5' : '',
      ].join(' ')}
    >
      {name && <span className="font-medium text-[#024E29]">{name}</span>}
      {row.dose && (
        <span className="text-[#1F2A24]/55">
          {name ? '· ' : ''}
          {row.dose}
        </span>
      )}
      {slug && (
        <ArrowUpRight className="h-3.5 w-3.5 text-[#007D41]/70 transition-transform group-hover/pill:-translate-y-0.5 group-hover/pill:translate-x-0.5" />
      )}
    </span>
  )

  return slug ? (
    <Link href={`/proizvodi/${slug}`} className="group/pill inline-flex">
      {inner}
    </Link>
  ) : (
    <span className="inline-flex">{inner}</span>
  )
}

function StageRow({ stage, index }: { stage: Stage; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-12% 0px' })
  const t = TARGET[(stage.targetType as TargetType) ?? 'ostalo'] ?? TARGET.ostalo
  const Icon = t.Icon
  const products = (stage.products ?? []).filter(Boolean)

  return (
    <div ref={ref} className="relative pb-8 pl-16 last:pb-0">
      {/* Node marker on the spine */}
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
        className={`absolute left-0 top-1 flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm ${t.dot}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </motion.span>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-2xl border border-[#E6EFEA] bg-white shadow-sm"
        style={{ borderLeft: `3px solid ${t.accent}` }}
      >
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
            <h4 className="whitespace-pre-line text-base font-semibold leading-snug text-[#1F2A24]">
              {stage.stage}
            </h4>
            {stage.targetType && (
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${t.chip}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </span>
            )}
          </div>

          {stage.target && (
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-[#1F2A24]/70">
              {stage.target}
            </p>
          )}

          {products.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {products.map((row, i) => (
                <ProductPill key={row?.id ?? i} row={row as ProductRow} />
              ))}
            </div>
          )}

          {stage.note && (
            <p className="mt-3 text-xs italic text-[#1F2A24]/50">{stage.note}</p>
          )}
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

  // Only show legend entries that actually appear.
  const presentTypes = Array.from(
    new Set(items.map((s) => (s.targetType as TargetType) ?? 'ostalo')),
  )

  const notes = (footnotes ?? []).filter((f): f is { text: string } => Boolean(f?.text))

  return (
    <section className="not-prose my-10">
      {title && (
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#007D41]">
            Program tretmana
          </p>
          <h3 className="mt-1 text-2xl font-bold text-[#024E29] sm:text-3xl">{title}</h3>
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
          className="absolute bottom-2 left-[21px] top-2 w-0.5 rounded-full bg-gradient-to-b from-[#007D41]/15 via-[#007D41]/30 to-[#007D41]/10"
        />
        {items.map((stage, i) => (
          <StageRow key={stage.id ?? i} stage={stage} index={i} />
        ))}
      </div>

      {/* Footnotes */}
      {notes.length > 0 && (
        <div className="mt-6 space-y-1 rounded-xl bg-[#F4F8F6] p-4 text-xs leading-relaxed text-[#1F2A24]/60">
          {notes.map((f, i) => (
            <p key={i}>{f.text}</p>
          ))}
        </div>
      )}
    </section>
  )
}
