import type { Metadata } from 'next'

import Link from 'next/link'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

const BRAND_GREEN = '#007D41'

export const metadata: Metadata = {
  title: 'Planovi zastite',
  description: 'Planovi zastite za vocarstvo, ratarstvo i povrtarstvo',
}

export default async function PlanoviZastitePage() {
  const payload = await getPayload({ config: configPromise })

  const categoriesResult = await payload.find({
    collection: 'protection-plan-categories',
    depth: 0,
    limit: 100,
    sort: 'order',
    overrideAccess: false,
  })

  const categories = categoriesResult.docs ?? []

  return (
    <article className="container py-16">
      <header className="mb-12 text-center">
        <h1
          className="text-3xl font-bold sm:text-4xl"
          style={{ color: BRAND_GREEN }}
        >
          Planovi zastite
        </h1>
        <p className="mt-2 text-muted-foreground">
          Izaberite kategoriju za pregled planova zastite
        </p>
      </header>

      <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
        {categories.map((category) => {
          const slug = typeof category.slug === 'string' ? category.slug : ''
          return (
            <Link
              key={category.id}
              href={`/planovi-zastite/${slug}`}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted/50"
              style={{ borderColor: 'color-mix(in srgb, #007D41 25%)' }}
            >
              <span className="font-medium" style={{ color: BRAND_GREEN }}>
                {category.name}
              </span>
              <svg
                width="20"
                height="20"
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
          )
        })}
      </div>
    </article>
  )
}
