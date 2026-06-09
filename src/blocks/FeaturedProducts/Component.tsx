import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { FeaturedProductsBlock as FeaturedProductsBlockType } from '@/payload-types'

import { ProductCard } from '@/app/(frontend)/kategorije/ProductCard'

export const FeaturedProductsBlock: React.FC<FeaturedProductsBlockType> = async ({
  heading,
  subheading,
  products: productRefs,
}) => {
  if (!productRefs || productRefs.length === 0) return null

  // Resolve product IDs to full objects
  const ids = productRefs.map((p) => (typeof p === 'object' ? p.id : p))

  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'products',
    where: { id: { in: ids } },
    depth: 1,
    limit: ids.length,
  })

  if (docs.length === 0) return null

  // `where: { id: { in } }` returns rows in database (id) order, not the order
  // the editor declared in the relationship field. Re-sort to match `ids`.
  const productsById = new Map(docs.map((doc) => [doc.id, doc]))
  const products = ids.map((id) => productsById.get(id)).filter((p) => p != null)

  return (
    <div className="container">
      {(heading || subheading) && (
        <div className="mb-10 text-center">
          {heading && (
            <h2 className="text-3xl font-bold text-ink md:text-4xl">{heading}</h2>
          )}
          {subheading && (
            <p className="mt-3 text-lg text-ink/70">{subheading}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
