'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('dark')
  })

  return (
    <div
      className="relative -mt-[10.5rem] flex min-h-[56vh] w-full flex-col items-center justify-center overflow-hidden text-white"
      data-theme="dark"
    >
      {/* Full-width background image */}
      {media && typeof media === 'object' && (
        <Media
          className="absolute inset-0 -z-10"
          fill
          imgClassName="object-cover"
          priority
          resource={media}
        />
      )}
      {/* Content overlay */}
      <div className="container relative z-10 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        <div className="max-w-[36.5rem] text-center">
          {richText && <RichText className="mb-6" data={richText} enableGutter={false} />}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex justify-center gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
