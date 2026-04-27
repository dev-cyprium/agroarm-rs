import type { Block } from 'payload'

import { link } from '@/fields/link'

const iconOptions = [
  { label: 'List (Leaf)', value: 'leaf' },
  { label: 'Mladica (Sprout)', value: 'sprout' },
  { label: 'Štit (Shield)', value: 'shield' },
  { label: 'Hemija (FlaskConical)', value: 'flask' },
  { label: 'Sertifikat (BadgeCheck)', value: 'badgeCheck' },
  { label: 'Kap (Droplet)', value: 'droplet' },
  { label: 'Sunce (Sun)', value: 'sun' },
  { label: 'Munja (Zap)', value: 'zap' },
  { label: 'Cilj (Target)', value: 'target' },
  { label: 'Nagrada (Award)', value: 'award' },
  { label: 'Tim (Users)', value: 'users' },
  { label: 'Rukovanje (HeartHandshake)', value: 'handshake' },
]

export const InteractiveSplit: Block = {
  slug: 'interactiveSplit',
  interfaceName: 'InteractiveSplitBlock',
  labels: {
    singular: 'Interaktivni duo',
    plural: 'Interaktivni duo',
  },
  fields: [
    {
      name: 'eyebrow',
      type: 'text',
      label: 'Nadnaslov',
    },
    {
      name: 'heading',
      type: 'text',
      label: 'Naslov',
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Podnaslov',
    },
    {
      name: 'cards',
      type: 'array',
      label: 'Kartice',
      labels: { singular: 'Kartica', plural: 'Kartice' },
      minRows: 2,
      maxRows: 2,
      admin: { initCollapsed: false },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'icon',
              type: 'select',
              label: 'Ikona',
              options: iconOptions,
              admin: { width: '40%' },
            },
            {
              name: 'theme',
              type: 'select',
              label: 'Tema boja',
              defaultValue: 'emerald',
              options: [
                { label: 'Zelena (Emerald)', value: 'emerald' },
                { label: 'Žuta (Amber)', value: 'amber' },
                { label: 'Plava (Sky)', value: 'sky' },
                { label: 'Crvena (Rose)', value: 'rose' },
                { label: 'Ljubičasta (Violet)', value: 'violet' },
              ],
              admin: { width: '60%' },
            },
          ],
        },
        {
          name: 'title',
          type: 'text',
          label: 'Naslov kartice',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Opis',
        },
        {
          type: 'row',
          fields: [
            {
              name: 'statValue',
              type: 'text',
              label: 'Statistika (broj/oznaka)',
              admin: {
                width: '40%',
                description: 'Npr. "120+", "5", "Top 3"',
              },
            },
            {
              name: 'statLabel',
              type: 'text',
              label: 'Opis statistike',
              admin: {
                width: '60%',
                description: 'Npr. "proizvoda u ponudi", "podkategorija"',
              },
            },
          ],
        },
        link({
          appearances: false,
          relationTo: ['pages', 'posts', 'products', 'categories'],
          overrides: {
            name: 'primaryLink',
            label: 'Glavni link (cela kartica je klikabilna)',
          },
        }),
        {
          name: 'chips',
          type: 'array',
          label: 'Podkategorije / chip linkovi',
          labels: { singular: 'Chip', plural: 'Chips' },
          admin: {
            description: 'Pojavljuju se na hover sa staggered animacijom.',
          },
          fields: [
            link({
              appearances: false,
              relationTo: ['pages', 'posts', 'products', 'categories'],
            }),
          ],
        },
      ],
    },
  ],
}
