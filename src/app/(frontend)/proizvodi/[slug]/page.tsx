import type { Metadata } from 'next'

import { notFound } from 'next/navigation'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'
import Link from 'next/link'
import { FileText, TriangleAlert, Leaf, FlaskConical, Tag } from 'lucide-react'
import RichText from '@/components/RichText'
import { getMediaUrl } from '@/utilities/getMediaUrl'

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
  const attributes = product.attributes ?? []

  return (
    <article className="bg-[#F4F8F6]">
      <div className="container py-12 md:py-16">
        <div className="mx-auto max-w-5xl">

          {/* Product hero card */}
          <div className="overflow-hidden bg-white shadow-sm rounded-b-2xl">
            {/* Green top accent */}
            <div className="h-2 bg-[#007D41]" />

            <div className="flex flex-col gap-8 p-6 md:flex-row md:items-start md:p-10">
              {/* Product image */}
              {imageUrl && (
                <div className="relative w-full shrink-0 overflow-hidden rounded-xl bg-[#F4F8F6] md:w-80 lg:w-96">
                  <img
                    src={imageUrl}
                    alt={image?.alt || product.title}
                    className="h-full w-full object-contain p-4"
                  />
                </div>
              )}

              {/* Product info */}
              <div className="flex flex-1 flex-col gap-3 md:mt-4">
                {/* Pills / meta */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/kategorije/${cat.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#007D41]/10 px-3 py-1 text-xs font-semibold text-[#007D41] transition-colors hover:bg-[#007D41]/20"
                    >
                      <Tag className="h-3 w-3" />
                      {cat.title}
                    </Link>
                  ))}
                  {culture && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6EFEA] px-3 py-1 text-xs font-semibold text-[#024E29]">
                      <Leaf className="h-3 w-3" />
                      {culture.title}
                    </span>
                  )}
                  {cultureGroup && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6EFEA] px-3 py-1 text-xs font-semibold text-[#024E29]">
                      <Leaf className="h-3 w-3" />
                      {cultureGroup.title}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-[#1F2A24] sm:text-4xl">
                  {product.title}
                </h1>

                {product.shortDescription && (
                  <p className="text-base leading-relaxed text-[#1F2A24]/70">{product.shortDescription}</p>
                )}

                {product.activeMaterial && (
                  <div className="inline-flex items-center gap-2 text-sm">
                    <FlaskConical className="h-4 w-4 text-[#007D41]" />
                    <span className="font-medium text-[#1F2A24]/50">Aktivna materija:</span>
                    <span className="text-[#1F2A24]">{product.activeMaterial}</span>
                  </div>
                )}

                {/* Attributes table */}
                {attributes.length > 0 && (
                  <div className="mt-2 rounded-xl bg-[#F4F8F6] p-4">
                    <table className="w-full text-sm">
                      <tbody>
                        {attributes.map((attr, i) => (
                          <tr
                            key={attr.id || i}
                            className="border-b border-[#E6EFEA] last:border-b-0"
                          >
                            <td className="py-2.5 pr-4 font-medium text-[#1F2A24]/50">{attr.label}</td>
                            <td className="py-2.5 text-[#1F2A24]">{attr.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rich text content */}
          {product.content && (
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm md:p-10">
              <RichText data={product.content} enableGutter={false} />
            </div>
          )}

          {/* PDF Documents */}
          {documents.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 text-xl font-semibold text-[#024E29]">
                Dokumentacija
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
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
                      className="inline-flex items-center gap-3 rounded-xl border border-[#E6EFEA] bg-white px-5 py-4 text-sm text-[#1F2A24] shadow-sm transition-all hover:border-[#007D41]/30 hover:shadow-md"
                    >
                      <FileText className="h-5 w-5 shrink-0 text-red-500" />
                      <span className="font-medium">{doc.title || 'Dokument'}</span>
                    </a>
                  )
                })}
              </div>
            </section>
          )}

          {/* Disclaimer */}
          <div className="mt-10 rounded-xl border-2 border-amber-400 bg-amber-50 px-5 py-5">
            <div className="flex gap-4">
              <TriangleAlert className="mt-0.5 h-6 w-6 shrink-0 text-amber-500" />
              <p className="text-sm leading-relaxed text-amber-900">
                Informacije na ovom sajtu su informativnog karaktera. Pre primene sredstva za
                zaštitu bilja obavezno pročitati i pridržavati se pratećeg uputstva i etikete, kako
                bi se izbegli rizici po zdravlje ljudi i životnu sredinu. Koristite proizvode za
                zaštitu bilja bezbedno i odgovorno.
              </p>
            </div>
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
