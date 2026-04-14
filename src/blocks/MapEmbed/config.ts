import type { Block } from 'payload'

export const MapEmbed: Block = {
  slug: 'mapEmbed',
  interfaceName: 'MapEmbedBlock',
  labels: {
    singular: 'Mapa',
    plural: 'Mape',
  },
  fields: [
    {
      name: 'address',
      type: 'text',
      label: 'Adresa za pretragu',
      required: true,
      admin: {
        description: 'Adresa koja će biti prikazana na mapi (npr. "Pukovnika Purića 4, Beograd")',
      },
    },
    {
      name: 'height',
      type: 'number',
      label: 'Visina mape (px)',
      defaultValue: 450,
      admin: {
        description: 'Visina mape u pikselima',
      },
    },
  ],
}
