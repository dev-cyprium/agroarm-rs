import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'

export const Cultures: CollectionConfig = {
  slug: 'cultures',
  labels: {
    singular: 'Kultura',
    plural: 'Kulture',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'cultureGroup', 'updatedAt'],
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
      name: 'icon',
      type: 'upload',
      relationTo: 'media',
      label: 'Icon (SVG)',
      filterOptions: {
        mimeType: { contains: 'svg' },
      },
    },
    {
      name: 'cultureGroup',
      type: 'relationship',
      relationTo: 'culture-groups',
      required: true,
      label: 'Grupe Kultura',
    },
    {
      name: 'keywordAliases',
      type: 'array',
      label: 'Keyword Aliases',
      labels: {
        singular: 'Keyword',
        plural: 'Keywords',
      },
      fields: [
        {
          name: 'keyword',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
