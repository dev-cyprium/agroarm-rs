import React from 'react'

import Link from 'next/link'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { PlansSplitBlock as BlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'

const visualIdentityClasses = {
  primary: {
    card: 'border-transparent bg-[#007D41] text-white',
    description: 'text-white/90',
    button: 'border-white/75 text-white hover:bg-white hover:text-[#007D41]',
  },
  secondary: {
    card: 'border-[#C8DDCF] bg-[#F3F8F5] text-[#0D5B34]',
    description: 'text-[#2C6D4A]',
    button: 'border-[#007D41] text-[#007D41] hover:bg-[#007D41] hover:text-white',
  },
} as const

export const PlansSplitBlock: React.FC<BlockProps> = async ({
  nutritionPlans,
  protectionPlans,
}) => {
  const payload = await getPayload({ config: configPromise })

  const categoriesResult = await payload.find({
    collection: 'culture-groups',
    depth: 0,
    limit: 100,
    sort: 'order',
    overrideAccess: false,
  })

  const categories = categoriesResult.docs ?? []

  const columns = [
    {
      key: 'nutrition',
      title: 'Planovi ishrane',
      basePath: '/planovi-ishrane',
      data: nutritionPlans,
    },
    {
      key: 'protection',
      title: 'Planovi zastite',
      basePath: '/planovi-zastite',
      data: protectionPlans,
    },
  ] as const

  return (
    <section className="py-16 sm:py-20">
      <div className="container">
        <div className="grid gap-6 md:grid-cols-2">
          {columns.map((column) => {
            const identity =
              column.data?.visualIdentity === 'secondary' ? 'secondary' : 'primary'
            const styles = visualIdentityClasses[identity]

            return (
              <article
                key={column.key}
                className={cn(
                  'flex h-full flex-col rounded-2xl border p-6 shadow-sm sm:p-8',
                  styles.card,
                )}
              >
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {column.title}
                </h2>

                {column.data?.description && (
                  <p className={cn('mt-4 text-base leading-relaxed', styles.description)}>
                    {column.data.description}
                  </p>
                )}

                {categories.length > 0 && (
                  <ul className="mt-6 flex flex-col gap-2">
                    {categories.map((category) => {
                      const slug = typeof category.slug === 'string' ? category.slug : ''
                      return (
                        <li key={category.id}>
                          <Link
                            href={`${column.basePath}/${slug}`}
                            className={cn(
                              'flex w-full items-center justify-between rounded-xl border px-5 py-3 text-sm font-medium transition-colors',
                              styles.button,
                            )}
                          >
                            <span>{category.title}</span>
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 20 20"
                              fill="none"
                              className="shrink-0"
                              aria-hidden
                            >
                              <path
                                d="M7.5 5L12.5 10L7.5 15"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
