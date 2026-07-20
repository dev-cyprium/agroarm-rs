import type { Metadata } from 'next'

import React from 'react'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { ArrowRight, LayoutGrid, Search } from 'lucide-react'

import type { Product } from '@/payload-types'

import { ProductCard } from '../kategorije/ProductCard'

/**
 * Rendered via middleware rewrite for URLs recorded in the gone-urls
 * collection — the middleware sets the actual 410 status. Direct visits to
 * /gone just see the same page (noindex, so it never enters the index).
 */

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Stranica je uklonjena | AGROARM',
  robots: { index: false, follow: false },
}

export default async function GonePage() {
  let products: Product[] = []
  try {
    const payload = await getPayload({ config: configPromise })
    const { docs } = await payload.find({
      collection: 'products',
      sort: '-updatedAt',
      depth: 1,
      limit: 4,
    })
    products = docs
  } catch {
    // Fail-open: the page still works as a plain 410 without suggestions.
  }

  return (
    <div className="bg-surface pb-24 pt-24">
      <div className="container">
        {/* Status + message */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 text-sm font-semibold text-brand">
            410 — stranica uklonjena
          </span>
          <h1 className="mt-6 text-3xl font-bold text-ink md:text-4xl">
            Ova stranica više ne postoji
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-ink/70">
            Sadržaj koji je bio ovde trajno je uklonjen sa sajta.
          </p>
        </div>

        {/* Search emphasis */}
        <div className="mx-auto mt-14 max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-ink md:text-3xl">Tražiš nešto drugo?</h2>
          <p className="mt-2 text-ink/70">
            Pretraži ceo sajt — proizvode, kulture i kategorije — na jednom mestu.
          </p>
          <form action="/search" method="get" className="mt-6">
            <div className="flex items-center gap-2 rounded-2xl border border-hairline bg-surface-raised p-2 pl-5 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-brand">
              <Search className="h-5 w-5 shrink-0 text-ink/40" aria-hidden="true" />
              <input
                type="search"
                name="q"
                placeholder="Pretražite kulture, proizvode i kategorije…"
                aria-label="Pretraga sajta"
                className="h-12 w-full min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink/40 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-hover"
              >
                Pretraži
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </form>
          <p className="mt-3 text-sm text-ink/50">
            ili otvori{' '}
            <Link href="/search" className="font-semibold text-brand hover:text-brand-hover">
              stranicu za pretragu
            </Link>
          </p>
        </div>

        {/* Product suggestions */}
        {products.length > 0 && (
          <div className="mt-20">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-ink">Možda te zanima</h2>
              <p className="mt-2 text-ink/70">Izdvojeni proizvodi iz naše ponude</p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                href="/kategorije"
                className="inline-flex items-center gap-2 rounded-xl border border-hairline bg-surface-raised px-6 py-3 font-semibold text-brand transition-colors hover:border-brand hover:text-brand-hover"
              >
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                Pogledaj sve kategorije
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
