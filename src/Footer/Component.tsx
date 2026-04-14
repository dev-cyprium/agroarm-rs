import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Footer, SiteSetting } from '@/payload-types'

import { FooterTextBlock } from './blocks/FooterText/Component'
import { FooterNavBlock } from './blocks/FooterNav/Component'
import { FooterContactBlock } from './blocks/FooterContact/Component'
import { FooterSocialBlock } from './blocks/FooterSocial/Component'
import { FooterLogoBlock } from './blocks/FooterLogo/Component'

type FooterBlock = NonNullable<Footer['columnLeft']>[number]

const RenderFooterBlock: React.FC<{ block: FooterBlock; siteSettings: SiteSetting }> = ({
  block,
  siteSettings,
}) => {
  switch (block.blockType) {
    case 'footerLogo':
      return <FooterLogoBlock {...block} />
    case 'footerText':
      return <FooterTextBlock {...block} />
    case 'footerNav':
      return <FooterNavBlock {...block} />
    case 'footerContact':
      return <FooterContactBlock {...block} siteSettings={siteSettings} />
    case 'footerSocial':
      return <FooterSocialBlock {...block} siteSettings={siteSettings} />
    default:
      return null
  }
}

function getLogoHeight(columns: (FooterBlock[] | null | undefined)[]): number {
  for (const col of columns) {
    if (!col) continue
    for (const block of col) {
      if (block.blockType === 'footerLogo') {
        return block.height || 40
      }
    }
  }
  return 0
}

function columnHasLogo(blocks?: FooterBlock[] | null): boolean {
  return blocks?.some((b) => b.blockType === 'footerLogo') ?? false
}

const FooterColumn: React.FC<{
  blocks?: FooterBlock[] | null
  siteSettings: SiteSetting
  topOffset?: number
}> = ({ blocks, siteSettings, topOffset }) => {
  if (!blocks || blocks.length === 0) return <div />

  return (
    <div className="flex flex-col gap-6" style={topOffset ? { paddingTop: `${topOffset}px` } : undefined}>
      {blocks.map((block, i) => (
        <RenderFooterBlock key={i} block={block} siteSettings={siteSettings} />
      ))}
    </div>
  )
}

export async function Footer() {
  let footerData: Footer = {} as Footer
  let siteSettings: SiteSetting = {} as SiteSetting

  try {
    ;[footerData, siteSettings] = await Promise.all([
      getCachedGlobal('footer', 1)() as Promise<Footer>,
      getCachedGlobal('site-settings', 1)() as Promise<SiteSetting>,
    ])
  } catch (error) {
    console.warn('Failed to load footer or site settings from Payload.', error)
  }

  const columns = [footerData?.columnLeft, footerData?.columnCenter, footerData?.columnRight]
  const logoHeight = getLogoHeight(columns)
  // offset = logo height + gap (gap-6 = 24px) so titles align across columns
  const offset = logoHeight > 0 ? logoHeight + 24 : 0

  return (
    <footer className="mt-auto bg-[#024E29] text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {columns.map((col, i) => (
            <FooterColumn
              key={i}
              blocks={col}
              siteSettings={siteSettings}
              topOffset={offset > 0 && !columnHasLogo(col) ? offset : undefined}
            />
          ))}
        </div>
      </div>
      <div className="border-t border-white/15 py-4">
        <div className="container text-center text-sm text-white/60">
          &copy; {new Date().getFullYear()} Agroarm. Sva prava su zadržana.
        </div>
      </div>
    </footer>
  )
}
