import React from 'react'

import type { FooterTextBlock as FooterTextBlockType } from '@/payload-types'

import RichText from '@/components/RichText'

export const FooterTextBlock: React.FC<FooterTextBlockType> = ({ richText }) => {
  if (!richText) return null

  return (
    <RichText
      className="[&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-white/70 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mb-3 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:text-white [&_h4]:mb-2 [&_a]:text-white/70 [&_a]:underline [&_a:hover]:text-white"
      data={richText}
      enableGutter={false}
    />
  )
}
