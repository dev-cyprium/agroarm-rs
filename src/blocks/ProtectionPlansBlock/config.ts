import type { Block } from 'payload'

export const ProtectionPlans: Block = {
  slug: 'protectionPlans',
  interfaceName: 'ProtectionPlansBlock',
  labels: {
    singular: 'Planovi zastite',
    plural: 'Planovi zastite',
  },
  fields: [
    {
      name: 'blockTitle',
      type: 'text',
      label: 'Block title',
      admin: {
        description: 'Optional section heading',
      },
    },
    {
      name: 'blockSubtitle',
      type: 'text',
      label: 'Block subtitle',
    },
  ],
}
