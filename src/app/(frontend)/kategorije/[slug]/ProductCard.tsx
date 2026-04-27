import React from 'react'
import Link from 'next/link'
import { FlaskConical, Tag } from 'lucide-react'
import { getMediaUrl } from '@/utilities/getMediaUrl'

type MediaLike = { url?: string | null; alt?: string | null; updatedAt?: string | null }

type CategoryLike = { id: number; title: string; slug: string }

type ProductCardProps = {
  product: {
    id: string | number
    title: string
    slug?: string | null
    shortDescription?: string | null
    activeMaterial?: string | null
    image: MediaLike | unknown
    categories?: (number | CategoryLike)[] | null
  }
  /** Query string (without leading `?`) appended to the product link so the
   * product page can render contextual breadcrumbs and a back-link with
   * filter state preserved. */
  linkSearchParams?: string
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, linkSearchParams }) => {
  const { title, shortDescription, activeMaterial, image, slug, categories } = product
  const href = `/proizvodi/${slug || ''}${linkSearchParams ? `?${linkSearchParams}` : ''}`
  const imageObj = image as MediaLike | null | undefined
  const imageUrl =
    imageObj && typeof imageObj === 'object' && imageObj.url
      ? getMediaUrl(imageObj.url, imageObj.updatedAt)
      : null

  const resolvedCategories = (categories ?? []).filter(
    (c): c is CategoryLike => typeof c === 'object',
  )

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007D41] focus-visible:ring-offset-2"
    >
      {/* Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#F4F8F6]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageObj?.alt || title || ''}
            className="h-full w-full object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#1F2A24]/20">
            <span className="text-sm">Nema slike</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 border-t border-[#E6EFEA] p-5">
        {/* Category pills */}
        {resolvedCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resolvedCategories.slice(0, 2).map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center gap-1 rounded-full bg-[#007D41]/10 px-2 py-0.5 text-[11px] font-semibold text-[#007D41]"
              >
                <Tag className="h-2.5 w-2.5" />
                {cat.title}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-base font-bold leading-snug text-[#1F2A24] group-hover:text-[#007D41] transition-colors">
          {title}
        </h3>

        {shortDescription && (
          <p className="line-clamp-2 text-sm leading-relaxed text-[#1F2A24]/60">
            {shortDescription}
          </p>
        )}

        {activeMaterial && (
          <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-[#1F2A24]/40">
            <FlaskConical className="h-3 w-3" />
            <span>{activeMaterial}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
