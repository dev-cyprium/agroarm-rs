import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { link } from '../fields/link'
import { slugField } from 'payload'

export const ProtectionPlans: CollectionConfig = {
  slug: 'protection-plans',
  labels: {
    singular: 'Plan zastite',
    plural: 'Planovi zastite',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'updatedAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      name: 'description',
      type: 'text',
      label: 'Description',
      admin: {
        description: 'Short description for the card',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Image',
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'protection-plan-categories',
      required: true,
      label: 'Category',
    },
    link({
      appearances: false,
      disableLabel: true,
      required: false,
      relationTo: ['pages', 'protection-plans'],
      overrides: {
        admin: {
          description: 'Where the card links to (optional - defaults to plan detail page)',
        },
      },
    }),
    slugField({
      fieldToUse: 'title',
    }),
  ],
}
