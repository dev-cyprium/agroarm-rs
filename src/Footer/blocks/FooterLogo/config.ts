import type { Block } from 'payload'

import { link } from '@/fields/link'

export const FooterLogo: Block = {
  slug: 'footerLogo',
  interfaceName: 'FooterLogoBlock',
  labels: {
    singular: 'Logo',
    plural: 'Logo blokovi',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Slika',
      required: true,
    },
    {
      name: 'height',
      type: 'number',
      label: 'Visina (px)',
      defaultValue: 40,
      admin: {
        description: 'Visina slike u pikselima',
      },
    },
    link({
      appearances: false,
      disableLabel: true,
    }),
  ],
}
