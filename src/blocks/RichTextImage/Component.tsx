import React from 'react'
import RichText from '@/components/RichText'

import type { RichTextImageBlock as RichTextImageBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'

export const RichTextImageBlock: React.FC<RichTextImageBlockProps> = (props) => {
  const { richText, image, imagePosition = 'right', backgroundColor } = props

  const isImageLeft = imagePosition === 'left'

  const contentBlock = (
    <div className="flex flex-col justify-center [&_h1]:text-[#007D41] [&_h2]:text-[#007D41] [&_h3]:text-[#007D41] [&_h4]:text-[#007D41]">
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

  return (
    <div
      className="container my-16 px-6 py-10 md:px-10 md:py-12 lg:px-12"
      {...(bgColor && { style: { backgroundColor: bgColor } })}
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
