import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      fields: [
        {
          name: 'type',
          type: 'select',
          defaultValue: 'link',
          options: [
            { label: 'Link', value: 'link' },
            { label: 'Category Dropdown', value: 'category' },
          ],
          required: true,
        },
        link({
          appearances: false,
          overrides: {
            admin: {
              condition: (_data, siblingData) => siblingData?.type === 'link',
            },
          },
        }),
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
          label: 'Parent Category',
          admin: {
            description: 'Select a parent category. Its children will appear as a dropdown.',
            condition: (_data, siblingData) => siblingData?.type === 'category',
          },
        },
        {
          name: 'categoryLabel',
          type: 'text',
          label: 'Label Override',
          admin: {
            description: 'Optional label override. Defaults to the category title.',
            condition: (_data, siblingData) => siblingData?.type === 'category',
          },
        },
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
