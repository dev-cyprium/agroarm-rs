import React from 'react'

import Link from 'next/link'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { ProtectionPlanCard } from './ProtectionPlanCard'
import { ProtectionPlanCarousel } from './ProtectionPlanCarousel'
import { PLAN_CONFIG, cultureHasPlan, cultureToPlanCard } from '@/utilities/plans'

const BRAND_GREEN = '#007D41'
const PLAN_TYPE = 'protection' as const

export const ProtectionPlansBlock: React.FC<{
  blockTitle?: string | null
  blockSubtitle?: string | null
}> = async (props) => {
  const { blockTitle, blockSubtitle } = props
  const cfg = PLAN_CONFIG[PLAN_TYPE]

  const payload = await getPayload({ config: configPromise })

  const categoriesResult = await payload.find({
    collection: 'culture-groups',
    depth: 0,
    limit: 100,
    sort: 'order',
    overrideAccess: false,
  })

  const categories = categoriesResult.docs ?? []

  const categoriesWithPlans = await Promise.all(
    categories.map(async (category) => {
      const culturesResult = await payload.find({
        collection: 'cultures',
        depth: 2,
        limit: 100,
        where: { cultureGroup: { equals: category.id } },
        overrideAccess: false,
      })
      const plans = (culturesResult.docs ?? [])
        .filter((culture) => cultureHasPlan(culture, PLAN_TYPE))
        .map((culture) => cultureToPlanCard(culture, PLAN_TYPE))
      return { category, plans }
    }),
  )

  return (
    <div className="bg-white py-20 sm:py-28">
      <div className="container">
        {/* Block header */}
        {(blockTitle || blockSubtitle) && (
          <header className="mb-14 max-w-2xl">
            {blockTitle && (
              <h2
                className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl"
                style={{ color: BRAND_GREEN }}
              >
                {blockTitle}
              </h2>
            )}
            {blockSubtitle && (
              <p className="mt-4 text-lg text-muted-foreground">{blockSubtitle}</p>
            )}
          </header>
        )}

        {/* Category sections */}
        <div className="space-y-20">
          {categoriesWithPlans.map(({ category, plans }, index) => {
            if (plans.length === 0) return null

            const categorySlug = typeof category.slug === 'string' ? category.slug : ''
            const categoryName = category.title || ''

            return (
              <section key={category.id}>
                {/* Section divider (skip first) */}
                {index > 0 && <div className="mb-12 h-px bg-border" />}

                {/* Category header */}
                <div className="mb-8 flex items-end justify-between gap-4">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {categoryName}
                  </h3>
                  <Link
                    href={`${cfg.basePath}/${categorySlug}`}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-foreground px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
                  >
                    Vidi sve
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="shrink-0"
                      aria-hidden
                    >
                      <path
                        d="M6 4L10 8L6 12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>

                {/* Desktop: grid */}
                <div className="hidden grid-cols-3 gap-4 md:grid lg:grid-cols-4 xl:grid-cols-5">
                  {plans.map((plan) => (
                    <ProtectionPlanCard key={plan.id} plan={plan} basePath={cfg.basePath} />
                  ))}
                </div>

                {/* Mobile: carousel */}
                <div className="md:hidden">
                  <ProtectionPlanCarousel plans={plans} basePath={cfg.basePath} />
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
