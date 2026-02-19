import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const RichTextImage: Block = {
  slug: 'richTextImage',
  interfaceName: 'RichTextImageBlock',
  labels: {
    singular: 'Rich Text + Image',
    plural: 'Rich Text + Image',
  },
  fields: [
    {
      name: 'richText',
      type: 'richText',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'right',
      options: [
        {
          label: 'Left',
          value: 'left',
        },
        {
          label: 'Right',
          value: 'right',
        },
      ],
      admin: {
        description: 'Choose whether the image appears on the left or right of the text',
      },
    },
    {
      name: 'backgroundColor',
      type: 'text',
      label: 'Background color',
      admin: {
        description: 'Hex color for the block background (e.g. #ffffff, #f5f5f5, #007D41)',
      },
    },
  ],
}
