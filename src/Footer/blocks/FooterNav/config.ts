import type { Block } from 'payload'

import { link } from '@/fields/link'

export const FooterNav: Block = {
  slug: 'footerNav',
  interfaceName: 'FooterNavBlock',
  labels: {
    singular: 'Navigacija',
    plural: 'Navigacija blokovi',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Naslov',
    },
    {
      name: 'links',
      type: 'array',
      label: 'Linkovi',
      maxRows: 10,
      fields: [
        link({
          appearances: false,
        }),
      ],
    },
  ],
}
