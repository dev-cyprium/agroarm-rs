import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { revalidatePlansAfterChange, revalidatePlansAfterDelete } from '../hooks/revalidatePlans'
import {
  revalidateSpotlightAfterChange,
  revalidateSpotlightAfterDelete,
} from '../hooks/revalidateSpotlight'
import {
  revalidateCatalogAfterChange,
  revalidateCatalogAfterDelete,
} from '../hooks/revalidateCatalog'
import { slugField } from 'payload'
import { serbianSlugify } from '@/utilities/serbianSlugify'

export const CultureGroups: CollectionConfig = {
  slug: 'culture-groups',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'order', 'updatedAt'],
  },
  labels: {
    singular: 'Grupe Kultura',
    plural: 'Grupe Kultura',
  },
  hooks: {
    afterChange: [
      revalidatePlansAfterChange,
      revalidateCatalogAfterChange,
      revalidateSpotlightAfterChange,
    ],
    afterDelete: [
      revalidatePlansAfterDelete,
      revalidateCatalogAfterDelete,
      revalidateSpotlightAfterDelete,
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
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
      fieldToUse: 'title',
      slugify: serbianSlugify,
    }),
  ],
}
