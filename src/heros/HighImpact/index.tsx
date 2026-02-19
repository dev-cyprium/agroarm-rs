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
      className="relative flex min-h-[62svh] w-full flex-col items-center justify-center overflow-hidden text-white md:min-h-[68vh]"
      data-theme="dark"
      data-hero-root="true"
    >
      {/* Full-width background image */}
      {media && typeof media === 'object' && (
        <Media
          className="absolute inset-0 -z-20"
          fill
          imgClassName="object-cover"
          priority
          resource={media}
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-950/45 via-slate-900/20 to-slate-950/55" />
      {/* Content overlay */}
      <div className="container relative z-10 flex flex-col items-center justify-center px-4 pt-[clamp(7rem,14vh,10rem)] pb-16 md:pt-[clamp(8rem,11vh,11rem)] md:pb-20">
        <div className="max-w-[36.5rem] text-center">
          {richText && (
            <RichText
              className="mb-6 rounded-2xl border border-white/30 bg-white/12 px-5 py-4 shadow-[0_8px_24px_rgba(2,6,23,0.22)] backdrop-blur-md [&_p]:m-0 [&_h1]:text-[2.1rem] md:[&_h1]:text-[2.4rem]"
              data={richText}
              enableGutter={false}
            />
          )}
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
