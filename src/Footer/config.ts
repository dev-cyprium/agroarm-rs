import type { GlobalConfig } from 'payload'

import { revalidateFooter } from './hooks/revalidateFooter'
import { FooterText } from './blocks/FooterText/config'
import { FooterNav } from './blocks/FooterNav/config'
import { FooterContact } from './blocks/FooterContact/config'
import { FooterSocial } from './blocks/FooterSocial/config'
import { FooterLogo } from './blocks/FooterLogo/config'

const footerBlocks = [FooterLogo, FooterText, FooterNav, FooterContact, FooterSocial]

const columnField = (name: string, label: string) => ({
  name,
  label,
  type: 'blocks' as const,
  blocks: footerBlocks,
  admin: {
    initCollapsed: true,
  },
})

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        columnField('columnLeft', 'Leva kolona'),
        columnField('columnCenter', 'Srednja kolona'),
        columnField('columnRight', 'Desna kolona'),
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateFooter],
  },
}
