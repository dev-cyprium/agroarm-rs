import React from 'react'
import RichText from '@/components/RichText'

import type { TextImageBlock as TextImageBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'

type Size = NonNullable<TextImageBlockProps['imageSize']>
type Position = NonNullable<TextImageBlockProps['imagePosition']>
type VerticalAlignment = NonNullable<TextImageBlockProps['verticalAlignment']>

const verticalAlignmentClass: Record<VerticalAlignment, string> = {
  top: 'items-start',
  center: 'items-center',
  bottom: 'items-end',
}

// Static class lookup so Tailwind's JIT picks every variant up at build time.
// Tracks are listed image-column first, text-column second, then flipped when
// the image lives on the right.
const gridColsClass: Record<Position, Record<Size, string>> = {
  left: {
    small: 'lg:grid-cols-[1fr_2fr]',
    medium: 'lg:grid-cols-[1fr_1fr]',
    large: 'lg:grid-cols-[2fr_1fr]',
  },
  right: {
    small: 'lg:grid-cols-[2fr_1fr]',
    medium: 'lg:grid-cols-[1fr_1fr]',
    large: 'lg:grid-cols-[1fr_2fr]',
  },
}

type Props = TextImageBlockProps & {
  /** When the block is rendered inside a parent that already provides the
   * page gutter (e.g. a richText converter inside `prose`), pass false so we
   * don't add a second `container` and shift the text inward. */
  enableGutter?: boolean
}

export const TextImageBlock: React.FC<Props> = (props) => {
  const {
    text,
    image,
    imagePosition = 'right',
    imageSize = 'medium',
    imageMaxHeight,
    backgroundColor,
    verticalAlignment = 'center',
    enableGutter = true,
  } = props

  const position = (imagePosition ?? 'right') as Position
  const size = (imageSize ?? 'medium') as Size
  const alignment = (verticalAlignment ?? 'center') as VerticalAlignment
  const isImageLeft = position === 'left'

  const textBlock = (
    <div className="[&_h1]:text-[#024E29] [&_h2]:text-[#024E29] [&_h3]:text-[#024E29] [&_h4]:text-[#024E29] [&_>*:first-child]:mt-0 [&_>*:last-child]:mb-0">
      {text && <RichText data={text} enableGutter={false} />}
    </div>
  )

  const imageBlock =
    image && typeof image === 'object' ? (
      <div
        className="not-prose relative aspect-[4/3] w-full overflow-hidden rounded-2xl"
        style={imageMaxHeight ? { maxHeight: `${imageMaxHeight}px` } : undefined}
      >
        <Media
          className="size-full"
          fill
          imgClassName="rounded-2xl object-cover object-center"
          pictureClassName="rounded-2xl"
          resource={image}
        />
      </div>
    ) : null

  const bgColor = backgroundColor?.trim()

  return (
    <div
      className={`not-prose my-6${enableGutter ? ' container' : ''}`}
      {...(bgColor && { style: { backgroundColor: bgColor } })}
    >
      <div
        className={`grid grid-cols-1 gap-6 lg:gap-10 ${verticalAlignmentClass[alignment]} ${gridColsClass[position][size]}`}
      >
        {isImageLeft ? (
          <>
            {imageBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {imageBlock}
          </>
        )}
      </div>
    </div>
  )
}
