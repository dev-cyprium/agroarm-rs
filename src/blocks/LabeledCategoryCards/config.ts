import type { Block } from 'payload'

import { link } from '@/fields/link'

export const LabeledCategoryCards: Block = {
  slug: 'labeledCategoryCards',
  interfaceName: 'LabeledCategoryCardsBlock',
  labels: {
    singular: 'Labeled Category Cards',
    plural: 'Labeled Category Cards',
  },
  fields: [
    {
      name: 'smallText',
      type: 'text',
      label: 'Small text',
      admin: {
        description: 'Uppercase intro text (e.g. "AGROSAVA - SINCE 1990")',
      },
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Heading (H1)',
      required: true,
    },
    {
      name: 'subheading',
      type: 'text',
      label: 'Subheading (H2)',
    },
    {
      name: 'cards',
      type: 'array',
      label: 'Product cards',
      required: true,
      minRows: 1,
      admin: {
        initCollapsed: false,
        description: 'Category cards with icon and label',
      },
      fields: [
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'SVG Icon',
          admin: {
            description: 'Upload an SVG or image for the category icon',
          },
        },
        link({
          appearances: false,
          disableLabel: false,
          overrides: {
            admin: {
              description: 'Optional link for the card (leave empty to show as non-clickable)',
            },
          },
        }),
      ],
    },
  ],
}
