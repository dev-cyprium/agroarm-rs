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
        components: {
          RowLabel: '@/blocks/TreatmentSchedule/RowLabels#StageRowLabel',
        },
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
            components: {
              RowLabel: '@/blocks/TreatmentSchedule/RowLabels#TargetRowLabel',
            },
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
                { label: 'Grinje (akaricid)', value: 'akaricid' },
                { label: 'Biostimulator / prihrana', value: 'biostimulator' },
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
                      label: 'Prikazani naziv (opciono)',
                      admin: {
                        width: '50%',
                        description:
                          'Ako je unet, prikazuje se umesto naziva iz kataloga (npr. pun naziv sa formulacijom „Futocis 2.5 EC“). Obavezan ako preparat nije u katalogu.',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'dose',
                      type: 'text',
                      label: 'Doza / koncentracija',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'note',
                      type: 'text',
                      label: 'Napomena uz preparat (opciono)',
                      admin: {
                        width: '50%',
                        description: 'Npr. „samo u zatvorenom prostoru“ ili „imuno biostimulator“.',
                      },
                    },
                  ],
                },
                {
                  name: 'combineWithPrevious',
                  type: 'checkbox',
                  label: 'Tank-mix: primenjuje se zajedno sa prethodnim preparatom (+)',
                  defaultValue: false,
                  admin: {
                    description:
                      'Označi ako se ovaj preparat meša sa prethodnim u istoj primeni (u tabeli povezano znakom „+“).',
                  },
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
