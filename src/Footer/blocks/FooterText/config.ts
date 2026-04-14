import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const FooterText: Block = {
  slug: 'footerText',
  interfaceName: 'FooterTextBlock',
  labels: {
    singular: 'Tekst',
    plural: 'Tekst blokovi',
  },
  fields: [
    {
      name: 'richText',
      type: 'richText',
      label: 'Sadržaj',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
  ],
}
