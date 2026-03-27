import type { Block, Field } from 'payload'

import { link } from '@/fields/link'

const visualIdentityOptions = [
  { label: 'Primarni (tamna pozadina)', value: 'primary' },
  { label: 'Sekundarni (svetla pozadina)', value: 'secondary' },
]

const createPlanColumnFields = ({
  dbName,
  name,
  label,
  descriptionDefault,
  visualIdentityDefault,
}: {
  dbName: string
  name: string
  label: string
  descriptionDefault: string
  visualIdentityDefault: 'primary' | 'secondary'
}): Field => ({
  dbName,
  name,
  type: 'group',
  label,
  fields: [
    {
      dbName: 'desc',
      name: 'description',
      type: 'textarea',
      label: 'Description',
      required: true,
      defaultValue: descriptionDefault,
    },
    {
      dbName: 'vi',
      name: 'visualIdentity',
      type: 'select',
      label: 'Visual identity',
      required: true,
      defaultValue: visualIdentityDefault,
      options: visualIdentityOptions,
      admin: {
        description: 'Izaberi jedan od 2 vizuelna identiteta za kolonu.',
      },
    },
    link({
      appearances: false,
      disableLabel: true,
      overrides: {
        label: 'Button link',
        admin: {
          description: 'Dugme "Saznaj vise" koristi ovaj link.',
        },
      },
    }),
  ],
})

export const PlansSplit: Block = {
  slug: 'plansSplit',
  interfaceName: 'PlansSplitBlock',
  labels: {
    singular: 'Planovi (Ishrana + Zastita)',
    plural: 'Planovi (Ishrana + Zastita)',
  },
  fields: [
    createPlanColumnFields({
      dbName: 'np',
      name: 'nutritionPlans',
      label: 'Planovi ishrane (left column)',
      descriptionDefault: 'Opis za planove ishrane.',
      visualIdentityDefault: 'secondary',
    }),
    createPlanColumnFields({
      dbName: 'pp',
      name: 'protectionPlans',
      label: 'Planovi zastite (right column)',
      descriptionDefault: 'Opis za planove zastite.',
      visualIdentityDefault: 'primary',
    }),
  ],
}
