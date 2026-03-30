import type { Metadata } from 'next'

import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { ProductCard } from './ProductCard'

const BRAND_GREEN = '#007D41'

type Args = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'categories',
    limit: 1000,
    overrideAccess: false,
    select: { slug: true },
  })

  return categories.docs
    .filter((cat) => cat.slug)
    .map((cat) => ({ slug: cat.slug }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 1,
    where: { slug: { equals: slug } },
    overrideAccess: false,
  })

  const category = result.docs?.[0]

  return {
    title: category ? `${category.title} - Proizvodi` : 'Kategorija',
    description: category ? `Svi proizvodi u kategoriji ${category.title}` : undefined,
  }
}

export default async function CategoryPage({ params }: Args) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })

  const categoryResult = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 1,
    where: { slug: { equals: slug } },
    overrideAccess: false,
  })

  const category = categoryResult.docs?.[0]
  if (!category) notFound()

  const productsResult = await payload.find({
    collection: 'products',
    depth: 2,
    limit: 100,
    where: { categories: { contains: category.id } },
    overrideAccess: false,
  })

  const products = productsResult.docs ?? []

  return (
    <article className="container py-16">
      <header className="mb-12">
        <h1 className="text-3xl font-semibold sm:text-4xl" style={{ color: BRAND_GREEN }}>
          {category.title}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Svi proizvodi u kategoriji {category.title}
        </p>
      </header>

      {products.length === 0 ? (
        <p className="text-muted-foreground">Nema proizvoda u ovoj kategoriji.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </article>
  )
}
