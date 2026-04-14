import type { Block } from 'payload'

export const LogoTicker: Block = {
  slug: 'logoTicker',
  interfaceName: 'LogoTickerBlock',
  labels: {
    singular: 'Logo traka',
    plural: 'Logo trake',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Naslov',
      admin: {
        description: 'Npr. "Naši saradnici" ili "Partneri od poverenja"',
      },
    },
    {
      name: 'logos',
      type: 'array',
      label: 'Logotipi',
      required: true,
      minRows: 3,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Logo',
        },
        {
          name: 'name',
          type: 'text',
          label: 'Naziv kompanije',
          admin: {
            description: 'Koristi se za alt tekst slike',
          },
        },
      ],
    },
    {
      name: 'speed',
      type: 'select',
      label: 'Brzina skrolovanja',
      defaultValue: 'normal',
      options: [
        { label: 'Sporo', value: 'slow' },
        { label: 'Normalno', value: 'normal' },
        { label: 'Brzo', value: 'fast' },
      ],
    },
  ],
}
