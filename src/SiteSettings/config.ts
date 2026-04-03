import type { GlobalConfig } from 'payload'

import { revalidateSiteSettings } from './hooks/revalidateSiteSettings'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Podešavanja sajta',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'socialLinks',
      label: 'Društvene mreže',
      type: 'array',
      maxRows: 6,
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'platform',
          label: 'Platforma',
          type: 'select',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'Twitter / X', value: 'twitter' },
          ],
        },
        {
          name: 'url',
          label: 'URL',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'address',
      label: 'Adresa',
      type: 'text',
    },
    {
      name: 'phone',
      label: 'Telefon',
      type: 'text',
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
    },
  ],
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
}
