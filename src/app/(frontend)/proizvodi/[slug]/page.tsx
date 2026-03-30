import type { Metadata } from 'next'

import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'
import Link from 'next/link'
import { FileText, TriangleAlert } from 'lucide-react'
import RichText from '@/components/RichText'
import { getMediaUrl } from '@/utilities/getMediaUrl'

const BRAND_GREEN = '#007D41'

type Args = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const products = await payload.find({
    collection: 'products',
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })

  return products.docs.filter((p) => p.slug).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const product = await queryProductBySlug(slug)

  return {
    title: product ? `${product.title} - Proizvodi` : 'Proizvod',
    description: product?.shortDescription ?? undefined,
  }
}

export default async function ProductPage({ params }: Args) {
  const { slug } = await params
  const product = await queryProductBySlug(decodeURIComponent(slug))

  if (!product) notFound()

  const image = product.image as { url?: string; alt?: string; updatedAt?: string } | null
  const imageUrl = image?.url ? getMediaUrl(image.url, image.updatedAt) : null

  const categories = (product.categories ?? []).filter(
    (c): c is Exclude<typeof c, number> => typeof c === 'object',
  )
  const culture = typeof product.culture === 'object' ? product.culture : null
  const cultureGroup = typeof product.cultureGroup === 'object' ? product.cultureGroup : null
  const documents = product.documents ?? []

  return (
    <article className="container py-16">
      {/* Hero: image + title side by side */}
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          {/* Product image */}
          {imageUrl && (
            <div className="relative w-full shrink-0 overflow-hidden rounded-xl md:w-80 lg:w-96">
              <img
                src={imageUrl}
                alt={image?.alt || product.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Product info */}
          <div className="flex flex-1 flex-col gap-4">
            <h1 className="text-3xl font-semibold sm:text-4xl" style={{ color: BRAND_GREEN }}>
              {product.title}
            </h1>

            {product.shortDescription && (
              <p className="text-lg text-muted-foreground">{product.shortDescription}</p>
            )}

            {product.activeMaterial && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Aktivna materija: </span>
                <span className="text-sm">{product.activeMaterial}</span>
              </div>
            )}

            {/* Meta: categories, culture, culture group */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm">
              {categories.length > 0 && (
                <div>
                  <span className="font-medium text-muted-foreground">Kategorije: </span>
                  {categories.map((cat, i) => (
                    <span key={cat.id}>
                      <Link
                        href={`/kategorije/${cat.slug}`}
                        className="underline underline-offset-2 hover:text-foreground"
                        style={{ color: BRAND_GREEN }}
                      >
                        {cat.title}
                      </Link>
                      {i < categories.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              )}

              {culture && (
                <div>
                  <span className="font-medium text-muted-foreground">Kultura: </span>
                  <span>{culture.title}</span>
                </div>
              )}

              {cultureGroup && (
                <div>
                  <span className="font-medium text-muted-foreground">Grupa kultura: </span>
                  <span>{cultureGroup.title}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rich text content */}
        {product.content && (
          <div className="mt-12">
            <RichText data={product.content} enableGutter={false} />
          </div>
        )}

        {/* PDF Documents */}
        {documents.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-semibold" style={{ color: BRAND_GREEN }}>
              Dokumentacija
            </h2>
            <div className="flex flex-col gap-3">
              {documents.map((doc) => {
                const file = doc.file as { url?: string; updatedAt?: string } | null
                const fileUrl = file?.url ? getMediaUrl(file.url, file.updatedAt) : null
                if (!fileUrl) return null

                return (
                  <a
                    key={doc.id}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-sm transition-colors hover:bg-muted/50"
                  >
                    <FileText className="h-5 w-5 shrink-0 text-red-500" />
                    <span>{doc.title || 'Dokument'}</span>
                  </a>
                )
              })}
            </div>
          </section>
        )}
        {/* Disclaimer */}
        <div className="mt-16 rounded-xl border-2 border-amber-400 bg-amber-50 px-5 py-5 dark:border-amber-500/60 dark:bg-amber-950/30">
          <div className="flex gap-4">
            <TriangleAlert className="mt-0.5 h-6 w-6 shrink-0 text-amber-500" />
            <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
              Informacije na ovom sajtu su informativnog karaktera. Pre primene sredstva za
              zaštitu bilja obavezno pročitati i pridržavati se pratećeg uputstva i etikete, kako
              bi se izbegli rizici po zdravlje ljudi i životnu sredinu. Koristite proizvode za
              zaštitu bilja bezbedno i odgovorno.
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}

const queryProductBySlug = cache(async (slug: string) => {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'products',
      depth: 2,
      limit: 1,
      pagination: false,
      overrideAccess: false,
      where: { slug: { equals: slug } },
    })

    return result.docs?.[0] || null
  } catch (error) {
    console.warn(`Failed to query product by slug "${slug}".`, error)
    return null
  }
})
