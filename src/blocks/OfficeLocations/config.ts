import type { Block } from 'payload'

export const OfficeLocations: Block = {
  slug: 'officeLocations',
  interfaceName: 'OfficeLocationsBlock',
  labels: {
    singular: 'Lokacije',
    plural: 'Lokacije blokovi',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Naslov sekcije',
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Podnaslov',
    },
    {
      name: 'offices',
      type: 'array',
      label: 'Kancelarije',
      maxRows: 6,
      required: true,
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Naziv lokacije',
          required: true,
        },
        {
          name: 'badge',
          type: 'text',
          label: 'Oznaka',
          admin: {
            description: 'Npr. "Sedište" ili "Filijala"',
          },
        },
        {
          name: 'address',
          type: 'text',
          label: 'Adresa',
          required: true,
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Telefon',
        },
        {
          name: 'fax',
          type: 'text',
          label: 'Fax',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
        },
        {
          name: 'mapAddress',
          type: 'text',
          label: 'Adresa za mapu',
          admin: {
            description: 'Puna adresa za Google Maps pretragu (npr. "Pukovnika Purića 4, Beograd, Srbija")',
          },
        },
      ],
    },
  ],
}
