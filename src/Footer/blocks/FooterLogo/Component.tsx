import React from 'react'

import type { FooterLogoBlock as FooterLogoBlockType, Media } from '@/payload-types'

import { CMSLink } from '@/components/Link'

export const FooterLogoBlock: React.FC<FooterLogoBlockType> = ({ image, height, link }) => {
  const media = typeof image === 'object' ? (image as Media) : null
  if (!media?.url) return null

  const h = height || 40

  const img = (
    <img
      src={media.url}
      alt={media.alt || ''}
      height={h}
      style={{ height: `${h}px`, width: 'auto' }}
      loading="lazy"
      decoding="async"
    />
  )

  if (link) {
    return (
      <CMSLink className="inline-block" {...link}>
        {img}
      </CMSLink>
    )
  }

  return img
}
