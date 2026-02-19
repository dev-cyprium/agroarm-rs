import React from 'react'

import type { ProtectionPlan } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'

type MediaLike = { url?: string | null; alt?: string | null; updatedAt?: string | null }
type LinkRef = { relationTo?: string; value?: { slug?: string | null } | string | number }
type PlanLike = {
  slug: string | null
  link?: {
    type?: 'reference' | 'custom' | null
    url?: string | null
    newTab?: boolean | null
    reference?: LinkRef | null
  } | null
}

type ProtectionPlanCardProps = {
  plan: (PlanLike & { id: string | number; title: string | null; description?: string | null; image: MediaLike | unknown }) | ProtectionPlan
}

function getPlanHref(plan: PlanLike): string {
  const { link } = plan
  if (link?.type === 'custom' && link.url) {
    return link.url
  }
  const ref = link?.reference
  if (link?.type === 'reference' && ref) {
    const value = typeof ref === 'object' ? ref.value : null
    const slug = typeof value === 'object' && value?.slug ? value.slug : null
    const relationTo = typeof ref === 'object' ? ref.relationTo : null
    if (slug) {
      const prefix = relationTo === 'pages' ? '' : relationTo === 'protection-plans' ? '/planovi-zastite' : relationTo ? `/${relationTo}` : '/planovi-zastite'
      return `${prefix}/${slug}`.replace(/^\/\//, '/')
    }
  }
  return `/planovi-zastite/${plan.slug || ''}`
}

function getPlanLinkProps(plan: PlanLike) {
  const href = getPlanHref(plan)
  const newTab = plan.link?.newTab ?? false
  return { href, newTab }
}

export const ProtectionPlanCard: React.FC<ProtectionPlanCardProps> = ({ plan }) => {
  const { title, description, image, link } = plan
  const imageObj = image as MediaLike | null | undefined
  const imageUrl = imageObj && typeof imageObj === 'object' && imageObj.url
    ? getMediaUrl(imageObj.url, imageObj.updatedAt)
    : null
  const isCustomUrl = link?.type === 'custom'
  const isPdf = isCustomUrl && link?.url?.toLowerCase().endsWith('.pdf')

  const { href, newTab } = getPlanLinkProps(plan)

  const cardContent = (
    <article className="group relative aspect-square w-full overflow-hidden rounded-xl">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={imageObj?.alt || title || ''}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      )}
      {!imageUrl && (
        <div className="absolute inset-0 bg-muted" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      {/* PDF badge */}
      {isPdf && (
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-foreground backdrop-blur-sm">
          PDF
        </span>
      )}

      {/* Text content inside the card */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-3.5">
        <h3 className="text-sm font-semibold leading-snug text-white">
          {title}
        </h3>
        {description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-white/75">
            {description}
          </p>
        )}
      </div>
    </article>
  )

  return (
    <a
      href={href}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      {...(newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
    >
      {cardContent}
    </a>
  )
}
