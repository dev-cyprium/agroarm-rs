import type { CollectionConfig, Field } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { link } from '../fields/link'
import { planContentLexical } from '../fields/planContentLexical'
import { revalidatePlansAfterChange, revalidatePlansAfterDelete } from '../hooks/revalidatePlans'
import {
  revalidateSpotlightAfterChange,
  revalidateSpotlightAfterDelete,
} from '../hooks/revalidateSpotlight'
import { slugField } from 'payload'
import { serbianSlugify } from '@/utilities/serbianSlugify'

// Fields for a single plan (zaštita or ishrana) attached to a culture.
// All optional — a culture has a plan only when its image is set.
const planFields = (): Field[] => [
  {
    name: 'image',
    type: 'upload',
    relationTo: 'media',
    label: 'Slika',
    admin: {
      description: 'Postavljanje slike označava da kultura ima ovaj plan (prikazuje se u listi).',
    },
  },
  {
    name: 'description',
    type: 'textarea',
    label: 'Kratak opis (za karticu)',
    admin: {
      description: 'Kratak tekst koji se prikazuje na kartici u listi.',
    },
  },
  {
    name: 'content',
    type: 'richText',
    label: 'Sadržaj',
    editor: planContentLexical,
    admin: {
      description:
        'Rich tekst za stranicu plana. Ubaci blok „Plan tretmana“ za interaktivnu tabelu/timeline tretmana.',
    },
  },
  link({
    appearances: false,
    disableLabel: true,
    required: false,
    relationTo: ['pages'],
    overrides: {
      admin: {
        description: 'Opcioni link ili PDF (podrazumevano vodi na detalj kulture).',
      },
    },
  }),
]

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
    defaultColumns: ['title', 'cultureGroup', 'slug', 'updatedAt'],
  },
  hooks: {
    afterChange: [revalidatePlansAfterChange, revalidateSpotlightAfterChange],
    afterDelete: [revalidatePlansAfterDelete, revalidateSpotlightAfterDelete],
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
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Plan zaštite',
          name: 'protection',
          fields: planFields(),
        },
        {
          label: 'Plan ishrane',
          name: 'nutrition',
          fields: planFields(),
        },
      ],
    },
    slugField({
      fieldToUse: 'title',
      slugify: serbianSlugify,
    }),
  ],
}
