import type { Block } from 'payload'

export const FooterSocial: Block = {
  slug: 'footerSocial',
  interfaceName: 'FooterSocialBlock',
  labels: {
    singular: 'Društvene mreže',
    plural: 'Društvene mreže blokovi',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Naslov',
    },
  ],
}
