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
import { TextImage } from '../blocks/TextImage/config'
import { slugField } from 'payload'
import { serbianSlugify } from '@/utilities/serbianSlugify'

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
  defaultPopulate: {
    title: true,
    slug: true,
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
      type: 'row',
      fields: [
        {
          name: 'descriptorType',
          type: 'select',
          label: 'Tip oznake',
          defaultValue: 'activeMaterial',
          options: [
            { label: 'Aktivna materija', value: 'activeMaterial' },
            { label: 'Tip proizvoda', value: 'productType' },
            { label: 'Namena proizvoda', value: 'productPurpose' },
          ],
          admin: {
            width: '40%',
            description: 'Vrsta oznake koja se prikazuje uz proizvod (svaka ima svoju ikonu).',
          },
        },
        {
          name: 'activeMaterial',
          type: 'text',
          label: 'Vrednost oznake',
          admin: {
            width: '60%',
            description:
              'Tekst koji se prikazuje uz izabranu oznaku (npr. naziv aktivne materije, tip ili namena proizvoda).',
          },
        },
      ],
    },
    {
      name: 'attributes',
      type: 'array',
      label: 'Atributi proizvoda',
      labels: {
        singular: 'Atribut',
        plural: 'Atributi',
      },
      admin: {
        description: 'Dinamički atributi koji se prikazuju kao tabela na stranici proizvoda.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Naziv',
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          label: 'Vrednost',
        },
      ],
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
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock, TextImage] }),
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
              hasMany: true,
              label: 'Kulture',
            },
            {
              name: 'cultureGroup',
              type: 'relationship',
              relationTo: 'culture-groups',
              hasMany: true,
              label: 'Grupe Kultura',
            },
          ],
        },
      ],
    },
    slugField({
      fieldToUse: 'title',
      slugify: serbianSlugify,
    }),
  ],
}
