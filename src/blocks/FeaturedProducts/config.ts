import type { Block } from 'payload'

export const FeaturedProducts: Block = {
  slug: 'featuredProducts',
  interfaceName: 'FeaturedProductsBlock',
  labels: {
    singular: 'Istaknuti proizvodi',
    plural: 'Istaknuti proizvodi blokovi',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Naslov',
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Podnaslov',
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      required: true,
      label: 'Proizvodi',
      maxRows: 8,
      admin: {
        description: 'Odaberite proizvode za prikaz (preporuka: 4)',
      },
    },
  ],
}
