import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { slugField } from 'payload'

export const ProtectionPlanCategories: CollectionConfig = {
  slug: 'protection-plan-categories',
  labels: {
    singular: 'Plan Zastite grupa',
    plural: 'Planovi Zastite grupe',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'order', 'updatedAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Name',
    },
    {
      name: 'order',
      type: 'number',
      label: 'Order',
      admin: {
        description: 'Display order (lower numbers first)',
      },
    },
    slugField({
      fieldToUse: 'name',
    }),
  ],
}
