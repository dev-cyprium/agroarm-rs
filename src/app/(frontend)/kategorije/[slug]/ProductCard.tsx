import React from 'react'
import Link from 'next/link'
import { getMediaUrl } from '@/utilities/getMediaUrl'

type MediaLike = { url?: string | null; alt?: string | null; updatedAt?: string | null }

type ProductCardProps = {
  product: {
    id: string | number
    title: string
    slug?: string | null
    shortDescription?: string | null
    image: MediaLike | unknown
  }
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { title, shortDescription, image, slug } = product
  const imageObj = image as MediaLike | null | undefined
  const imageUrl =
    imageObj && typeof imageObj === 'object' && imageObj.url
      ? getMediaUrl(imageObj.url, imageObj.updatedAt)
      : null

  return (
    <Link
      href={`/proizvodi/${slug || ''}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageObj?.alt || title || ''}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <span className="text-sm">Nema slike</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-4">
        <h3 className="text-base font-semibold leading-snug text-foreground">{title}</h3>
        {shortDescription && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {shortDescription}
          </p>
        )}
      </div>
    </Link>
  )
}
