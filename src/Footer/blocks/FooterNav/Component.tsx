import React from 'react'

import type { FooterNavBlock as FooterNavBlockType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

export const FooterNavBlock: React.FC<FooterNavBlockType> = ({ title, links }) => {
  return (
    <div>
      {title && <h4 className="mb-4 text-base font-semibold text-white">{title}</h4>}
      {links && links.length > 0 && (
        <nav className="flex flex-col gap-2">
          {links.map(({ link }, i) => (
            <CMSLink
              key={i}
              className="text-sm text-white/70 transition-colors hover:text-white"
              {...link}
            />
          ))}
        </nav>
      )}
    </div>
  )
}
