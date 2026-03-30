import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  EXPERIMENTAL_TableFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { Banner } from '../blocks/Banner/config'
import { Code } from '../blocks/Code/config'
import { MediaBlock } from '../blocks/MediaBlock/config'
import { slugField } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Proizvod',
    plural: 'Proizvodi',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'culture', 'cultureGroup', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Short Description',
    },
    {
      name: 'activeMaterial',
      type: 'text',
      label: 'Aktivna materija',
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                    EXPERIMENTAL_TableFeature(),
                  ]
                },
              }),
              label: false,
            },
          ],
        },
        {
          label: 'Documents',
          fields: [
            {
              name: 'documents',
              type: 'array',
              label: 'PDF Documents',
              labels: {
                singular: 'Document',
                plural: 'Documents',
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Document Title',
                },
                {
                  name: 'file',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                  filterOptions: {
                    mimeType: { contains: 'pdf' },
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Relations',
          fields: [
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              label: 'Categories',
            },
            {
              name: 'culture',
              type: 'relationship',
              relationTo: 'cultures',
              label: 'Kultura',
            },
            {
              name: 'cultureGroup',
              type: 'relationship',
              relationTo: 'culture-groups',
              label: 'Grupe Kultura',
            },
          ],
        },
      ],
    },
    slugField({
      fieldToUse: 'title',
    }),
  ],
}
