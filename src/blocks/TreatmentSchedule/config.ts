import type { Block } from 'payload'

// A crop protection/nutrition schedule: an ordered list of growth-stage
// treatments. Rendered on the frontend as an interactive timeline.
export const TreatmentSchedule: Block = {
  slug: 'treatmentSchedule',
  interfaceName: 'TreatmentScheduleBlock',
  labels: {
    singular: 'Plan tretmana',
    plural: 'Planovi tretmana',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Naslov (opciono)',
      admin: { description: 'Npr. „Program zaštite suncokreta“.' },
    },
    {
      name: 'stages',
      type: 'array',
      label: 'Faze tretmana',
      labels: { singular: 'Faza', plural: 'Faze' },
      admin: {
        initCollapsed: true,
        description: 'Svaka faza je jedan korak u sezoni (po redosledu primene).',
      },
      fields: [
        {
          name: 'stage',
          type: 'textarea',
          required: true,
          label: 'Vreme primene / razvojni stadijum',
        },
        {
          name: 'targets',
          type: 'array',
          label: 'Patogen i tip mete',
          labels: { singular: 'Meta', plural: 'Mete' },
          admin: {
            initCollapsed: true,
            description:
              'Jedan razvojni stadijum može imati više meta (patogen / štetočina / korov), svaka sa svojim tipom i preparatima.',
          },
          fields: [
            {
              name: 'target',
              type: 'textarea',
              label: 'Patogen / štetočina / korov',
            },
            {
              name: 'targetType',
              type: 'select',
              label: 'Tip mete',
              defaultValue: 'ostalo',
              admin: { description: 'Određuje boju i ikonu na timeline-u.' },
              options: [
                { label: 'Korov (herbicid)', value: 'herbicid' },
                { label: 'Bolest (fungicid)', value: 'fungicid' },
                { label: 'Štetočina (insekticid)', value: 'insekticid' },
                { label: 'Ostalo / tretman', value: 'ostalo' },
              ],
            },
            {
              name: 'products',
              type: 'array',
              label: 'Preparati',
              labels: { singular: 'Preparat', plural: 'Preparati' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'product',
                      type: 'relationship',
                      relationTo: 'products',
                      label: 'Proizvod (iz kataloga)',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'productName',
                      type: 'text',
                      label: 'Naziv (ako nije u katalogu)',
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  name: 'dose',
                  type: 'text',
                  label: 'Doza / koncentracija',
                },
              ],
            },
          ],
        },
        {
          name: 'note',
          type: 'text',
          label: 'Napomena (opciono)',
          admin: { description: 'Npr. oznaka fusnote „***“ ili kratko pojašnjenje.' },
        },
      ],
    },
    {
      name: 'footnotes',
      type: 'array',
      label: 'Fusnote',
      labels: { singular: 'Fusnota', plural: 'Fusnote' },
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
          label: 'Tekst',
        },
      ],
    },
  ],
}
