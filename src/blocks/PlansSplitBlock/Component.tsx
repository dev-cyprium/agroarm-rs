import React from 'react'

import { CMSLink } from '@/components/Link'
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

export const PlansSplitBlock: React.FC<BlockProps> = ({ nutritionPlans, protectionPlans }) => {
  const columns = [
    {
      key: 'nutrition',
      title: 'Planovi ishrane',
      data: nutritionPlans,
    },
    {
      key: 'protection',
      title: 'Planovi zastite',
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

                {column.data?.link && (
                  <CMSLink
                    {...column.data.link}
                    appearance="inline"
                    label="Saznaj vise"
                    className={cn(
                      'mt-6 inline-flex w-fit items-center justify-center rounded-full border px-5 py-2 text-sm font-medium transition-colors',
                      styles.button,
                    )}
                  />
                )}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
