import React from 'react'
import RichText from '@/components/RichText'

import type { RichTextImageBlock as RichTextImageBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'
import { cn } from '@/utilities/ui'

// Neutral "light" backgrounds picked in the CMS map to the theme-aware surface
// token so the block flips with dark mode (a fixed light hex would otherwise
// stay white while the prose text inverts to light → unreadable).
const NEUTRAL_LIGHT_BG = new Set(['#fff', '#ffffff', '#fafafa', '#f5f5f5', '#f4f8f6', '#e6efea'])

export const RichTextImageBlock: React.FC<RichTextImageBlockProps> = (props) => {
  const { richText, image, imagePosition = 'right', backgroundColor } = props

  const isImageLeft = imagePosition === 'left'

  const contentBlock = (
    <div className="flex flex-col justify-center [&_h1]:text-brand [&_h2]:text-brand [&_h3]:text-brand [&_h4]:text-brand">
      {richText && (
          <RichText
            className="lg:prose-lg"
            data={richText}
            enableGutter={false}
          />
        )}
    </div>
  )

  const imageBlock =
    image && typeof image === 'object' ? (
      <div className="relative aspect-[4/3] max-h-[28rem] w-full overflow-hidden rounded-[0.8rem] border border-border">
        <Media
          className="size-full"
          fill
          imgClassName="object-cover object-center"
          resource={image}
        />
      </div>
    ) : null

  const bgColor = backgroundColor?.trim()
  const useSurface = bgColor ? NEUTRAL_LIGHT_BG.has(bgColor.toLowerCase()) : false
  // Only apply a raw hex for genuinely custom (non-neutral) colors.
  const customBg = bgColor && !useSurface

  return (
    <div
      className={cn(
        'container my-16 px-6 py-10 md:px-10 md:py-12 lg:px-12',
        useSurface && 'rounded-[0.8rem] bg-surface',
      )}
      {...(customBg && { style: { backgroundColor: bgColor } })}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 items-center">
        {isImageLeft ? (
          <>
            {imageBlock}
            {contentBlock}
          </>
        ) : (
          <>
            {contentBlock}
            {imageBlock}
          </>
        )}
      </div>
    </div>
  )
}
