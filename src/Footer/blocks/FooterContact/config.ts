import type { Block } from 'payload'

export const FooterContact: Block = {
  slug: 'footerContact',
  interfaceName: 'FooterContactBlock',
  labels: {
    singular: 'Kontakt informacije',
    plural: 'Kontakt blokovi',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Naslov',
    },
    {
      name: 'showPhone',
      type: 'checkbox',
      label: 'Prikaži telefon',
      defaultValue: true,
    },
    {
      name: 'showEmail',
      type: 'checkbox',
      label: 'Prikaži email',
      defaultValue: true,
    },
    {
      name: 'showAddress',
      type: 'checkbox',
      label: 'Prikaži adresu',
      defaultValue: true,
    },
  ],
}
