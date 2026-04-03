import React from 'react'

import type { Page, SiteSetting } from '@/payload-types'

import { HighImpactHero } from '@/heros/HighImpact'
import { LowImpactHero } from '@/heros/LowImpact'
import { MediumImpactHero } from '@/heros/MediumImpact'

const heroes = {
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
}

type RenderHeroProps = Page['hero'] & {
  siteSettings?: SiteSetting | null
}

export const RenderHero: React.FC<RenderHeroProps> = (props) => {
  const { type, siteSettings, ...rest } = props || {}

  if (!type || type === 'none') return null

  const HeroToRender = heroes[type]

  if (!HeroToRender) return null

  return <HeroToRender {...rest} type={type} siteSettings={siteSettings} />
}
